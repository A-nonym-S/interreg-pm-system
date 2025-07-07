import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema for task update
const taskUpdateSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  category: z.enum([
    'PUBLICITA', 'FINANCIE', 'REPORTING', 'COMPLIANCE', 
    'MONITORING', 'OBSTARAVANIE', 'PARTNERSTVO', 'GENERAL'
  ]).optional(),
  deadline: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  progress: z.number().min(0).max(100).optional(),
  estimatedHours: z.number().optional(),
  actualHours: z.number().optional(),
});

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        subtasks: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = taskUpdateSchema.parse(body);
    
    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
    });
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Prepare update data
    const updateData: any = { ...validatedData };
    
    // Convert deadline string to Date if provided
    if (validatedData.deadline) {
      updateData.deadline = new Date(validatedData.deadline);
    } else if (validatedData.deadline === null) {
      updateData.deadline = null;
    }
    
    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
    
    // Create activity record for status change
    if (validatedData.status && validatedData.status !== existingTask.status) {
      await prisma.activity.create({
        data: {
          type: 'STATUS_CHANGED',
          description: `Status úlohy '${existingTask.title}' bol zmenený z '${existingTask.status}' na '${validatedData.status}'`,
          userId: 'system', // Use actual user ID in production
          taskId: params.id,
          metadata: {
            oldStatus: existingTask.status,
            newStatus: validatedData.status,
          },
        },
      });
    }
    
    // Create activity for assignment change
    if (validatedData.assigneeId && validatedData.assigneeId !== existingTask.assigneeId) {
      await prisma.activity.create({
        data: {
          type: 'TASK_ASSIGNED',
          description: `Úloha '${existingTask.title}' bola priradená novému používateľovi`,
          userId: 'system', // Use actual user ID in production
          taskId: params.id,
        },
      });
    }
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
    });
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Delete the task
    await prisma.task.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}

