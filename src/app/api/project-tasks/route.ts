import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/project-tasks - Získanie všetkých projektových úloh
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskType = searchParams.get('taskType');
    const recurrence = searchParams.get('recurrence');
    const priority = searchParams.get('priority');
    const parentId = searchParams.get('parentId');
    const includeSubtasks = searchParams.get('includeSubtasks') === 'true';
    const includeChildren = searchParams.get('includeChildren') === 'true';

    const where: any = {};
    
    if (taskType) {
      where.taskType = taskType;
    }
    
    if (recurrence) {
      where.recurrence = recurrence;
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (parentId) {
      where.parentId = parentId;
    } else if (parentId === null) {
      where.parentId = null; // Len hlavné úlohy
    }

    const include: any = {
      document: true,
    };

    if (includeSubtasks) {
      include.subtasks = {
        orderBy: { dueDate: 'asc' }
      };
    }

    if (includeChildren) {
      include.children = {
        include: {
          document: true,
          subtasks: includeSubtasks ? {
            orderBy: { dueDate: 'asc' }
          } : false
        }
      };
    }

    const projectTasks = await prisma.projectTask.findMany({
      where,
      include,
      orderBy: [
        { taskNumber: 'asc' }
      ]
    });

    return NextResponse.json(projectTasks);
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project tasks' },
      { status: 500 }
    );
  }
}

// POST /api/project-tasks - Vytvorenie novej projektovej úlohy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      taskNumber,
      parentId,
      taskType,
      title,
      description,
      source,
      priority,
      recurrence,
      startDate,
      endDate,
      duration,
      responsiblePerson,
      expectedResult,
      fulfillsKC,
      notes,
      documentId
    } = body;

    // Validácia povinných polí
    if (!taskNumber || !taskType || !title || !description || !source || !priority || !recurrence) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Kontrola, či taskNumber už existuje
    const existingTask = await prisma.projectTask.findUnique({
      where: { taskNumber }
    });

    if (existingTask) {
      return NextResponse.json(
        { error: 'Task number already exists' },
        { status: 400 }
      );
    }

    // Ak je zadané parentId, skontrolujeme, či parent existuje
    if (parentId) {
      const parentTask = await prisma.projectTask.findUnique({
        where: { id: parentId }
      });

      if (!parentTask) {
        return NextResponse.json(
          { error: 'Parent task not found' },
          { status: 400 }
        );
      }
    }

    const projectTask = await prisma.projectTask.create({
      data: {
        taskNumber,
        parentId: parentId || null,
        taskType,
        title,
        description,
        source,
        priority,
        recurrence,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        duration,
        responsiblePerson,
        expectedResult,
        fulfillsKC: fulfillsKC || false,
        notes,
        documentId: documentId || null
      },
      include: {
        document: true,
        parent: true,
        children: true,
        subtasks: true
      }
    });

    return NextResponse.json(projectTask, { status: 201 });
  } catch (error) {
    console.error('Error creating project task:', error);
    return NextResponse.json(
      { error: 'Failed to create project task' },
      { status: 500 }
    );
  }
}

