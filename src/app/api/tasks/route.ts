import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema for task creation
const taskCreateSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED']).default('PENDING'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  category: z.enum([
    'PUBLICITA', 'FINANCIE', 'REPORTING', 'COMPLIANCE', 
    'MONITORING', 'OBSTARAVANIE', 'PARTNERSTVO', 'GENERAL'
  ]),
  deadline: z.string().optional(),
  assigneeId: z.string().optional(),
});

// GET /api/tasks - Get all tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const assigneeId = searchParams.get('assigneeId');
    
    // Build filter object
    const filter: any = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (assigneeId) filter.assigneeId = assigneeId;
    
    const tasks = await prisma.task.findMany({
      where: filter,
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
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = taskCreateSchema.parse(body);
    
    // Generate external ID
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    // Get the count of tasks for this month to generate sequential number
    const tasksThisMonth = await prisma.task.count({
      where: {
        externalId: {
          startsWith: `TASK-${year}-${month}`,
        },
      },
    });
    
    const sequentialNumber = String(tasksThisMonth + 1).padStart(4, '0');
    const externalId = `TASK-${year}-${month}-${sequentialNumber}`;
    
    // Create the task
    const task = await prisma.task.create({
      data: {
        ...validatedData,
        externalId,
        deadline: validatedData.deadline ? new Date(validatedData.deadline) : undefined,
      },
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
    
    // Create activity record
    await prisma.activity.create({
      data: {
        type: 'TASK_CREATED',
        description: `Úloha '${task.title}' bola vytvorená`,
        userId: validatedData.assigneeId || 'system', // Fallback to system if no assignee
        taskId: task.id,
      },
    });
    
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

