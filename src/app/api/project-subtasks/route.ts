import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/project-subtasks - Získanie všetkých projektových podúloh
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectTaskId = searchParams.get('projectTaskId');
    const status = searchParams.get('status');
    const dueDateFrom = searchParams.get('dueDateFrom');
    const dueDateTo = searchParams.get('dueDateTo');
    const includeTask = searchParams.get('includeTask') === 'true';

    const where: any = {};
    
    if (projectTaskId) {
      where.projectTaskId = projectTaskId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) {
        where.dueDate.gte = new Date(dueDateFrom);
      }
      if (dueDateTo) {
        where.dueDate.lte = new Date(dueDateTo);
      }
    }

    const include: any = {};

    if (includeTask) {
      include.projectTask = {
        include: {
          document: true
        }
      };
    }

    const projectSubtasks = await prisma.projectSubtask.findMany({
      where,
      include,
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    return NextResponse.json(projectSubtasks);
  } catch (error) {
    console.error('Error fetching project subtasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project subtasks' },
      { status: 500 }
    );
  }
}

// POST /api/project-subtasks - Vytvorenie novej projektovej podúlohy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      projectTaskId,
      title,
      description,
      dueDate,
      status,
      notes
    } = body;

    // Validácia povinných polí
    if (!projectTaskId || !title || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Kontrola, či projektová úloha existuje
    const projectTask = await prisma.projectTask.findUnique({
      where: { id: projectTaskId }
    });

    if (!projectTask) {
      return NextResponse.json(
        { error: 'Project task not found' },
        { status: 400 }
      );
    }

    const projectSubtask = await prisma.projectSubtask.create({
      data: {
        projectTaskId,
        title,
        description,
        dueDate: new Date(dueDate),
        status: status || 'PENDING',
        notes
      },
      include: {
        projectTask: {
          include: {
            document: true
          }
        }
      }
    });

    return NextResponse.json(projectSubtask, { status: 201 });
  } catch (error) {
    console.error('Error creating project subtask:', error);
    return NextResponse.json(
      { error: 'Failed to create project subtask' },
      { status: 500 }
    );
  }
}

// PUT /api/project-subtasks/[id] - Aktualizácia projektovej podúlohy
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Subtask ID is required' },
        { status: 400 }
      );
    }

    // Kontrola, či podúloha existuje
    const existingSubtask = await prisma.projectSubtask.findUnique({
      where: { id }
    });

    if (!existingSubtask) {
      return NextResponse.json(
        { error: 'Project subtask not found' },
        { status: 404 }
      );
    }

    const {
      title,
      description,
      dueDate,
      status,
      notes,
      completedAt
    } = body;

    // Ak sa mení status na COMPLETED a nie je nastavený completedAt, nastavíme ho
    let updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'COMPLETED' && !completedAt && !existingSubtask.completedAt) {
        updateData.completedAt = new Date();
      } else if (status !== 'COMPLETED') {
        updateData.completedAt = null;
      }
    }
    if (notes !== undefined) updateData.notes = notes;
    if (completedAt !== undefined) {
      updateData.completedAt = completedAt ? new Date(completedAt) : null;
    }

    const updatedSubtask = await prisma.projectSubtask.update({
      where: { id },
      data: updateData,
      include: {
        projectTask: {
          include: {
            document: true
          }
        }
      }
    });

    return NextResponse.json(updatedSubtask);
  } catch (error) {
    console.error('Error updating project subtask:', error);
    return NextResponse.json(
      { error: 'Failed to update project subtask' },
      { status: 500 }
    );
  }
}

// DELETE /api/project-subtasks/[id] - Vymazanie projektovej podúlohy
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Subtask ID is required' },
        { status: 400 }
      );
    }

    // Kontrola, či podúloha existuje
    const existingSubtask = await prisma.projectSubtask.findUnique({
      where: { id }
    });

    if (!existingSubtask) {
      return NextResponse.json(
        { error: 'Project subtask not found' },
        { status: 404 }
      );
    }

    await prisma.projectSubtask.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Project subtask deleted successfully' });
  } catch (error) {
    console.error('Error deleting project subtask:', error);
    return NextResponse.json(
      { error: 'Failed to delete project subtask' },
      { status: 500 }
    );
  }
}

