import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/project-tasks/[id] - Získanie detailu projektovej úlohy
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const projectTask = await prisma.projectTask.findUnique({
      where: { id },
      include: {
        document: true,
        parent: {
          include: {
            document: true
          }
        },
        children: {
          include: {
            document: true,
            subtasks: {
              orderBy: { dueDate: 'asc' }
            }
          },
          orderBy: { taskNumber: 'asc' }
        },
        subtasks: {
          orderBy: { dueDate: 'asc' }
        }
      }
    });

    if (!projectTask) {
      return NextResponse.json(
        { error: 'Project task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(projectTask);
  } catch (error) {
    console.error('Error fetching project task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project task' },
      { status: 500 }
    );
  }
}

// PUT /api/project-tasks/[id] - Aktualizácia projektovej úlohy
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Kontrola, či úloha existuje
    const existingTask = await prisma.projectTask.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Project task not found' },
        { status: 404 }
      );
    }

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

    // Ak sa mení taskNumber, skontrolujeme, či už neexistuje
    if (taskNumber && taskNumber !== existingTask.taskNumber) {
      const duplicateTask = await prisma.projectTask.findUnique({
        where: { taskNumber }
      });

      if (duplicateTask) {
        return NextResponse.json(
          { error: 'Task number already exists' },
          { status: 400 }
        );
      }
    }

    // Ak sa mení parentId, skontrolujeme, či parent existuje
    if (parentId && parentId !== existingTask.parentId) {
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

    const updatedTask = await prisma.projectTask.update({
      where: { id },
      data: {
        ...(taskNumber && { taskNumber }),
        ...(parentId !== undefined && { parentId: parentId || null }),
        ...(taskType && { taskType }),
        ...(title && { title }),
        ...(description && { description }),
        ...(source && { source }),
        ...(priority && { priority }),
        ...(recurrence && { recurrence }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(duration !== undefined && { duration }),
        ...(responsiblePerson !== undefined && { responsiblePerson }),
        ...(expectedResult !== undefined && { expectedResult }),
        ...(fulfillsKC !== undefined && { fulfillsKC }),
        ...(notes !== undefined && { notes }),
        ...(documentId !== undefined && { documentId: documentId || null })
      },
      include: {
        document: true,
        parent: true,
        children: true,
        subtasks: {
          orderBy: { dueDate: 'asc' }
        }
      }
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating project task:', error);
    return NextResponse.json(
      { error: 'Failed to update project task' },
      { status: 500 }
    );
  }
}

// DELETE /api/project-tasks/[id] - Vymazanie projektovej úlohy
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Kontrola, či úloha existuje
    const existingTask = await prisma.projectTask.findUnique({
      where: { id },
      include: {
        children: true
      }
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Project task not found' },
        { status: 404 }
      );
    }

    // Kontrola, či úloha nemá podúlohy
    if (existingTask.children.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete task with child tasks' },
        { status: 400 }
      );
    }

    await prisma.projectTask.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Project task deleted successfully' });
  } catch (error) {
    console.error('Error deleting project task:', error);
    return NextResponse.json(
      { error: 'Failed to delete project task' },
      { status: 500 }
    );
  }
}

