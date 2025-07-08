import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { TaskStatus, TaskPriority, TaskCategory } from '@/types';

// Validation schema for task creation
const taskCreateSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  status: z.enum([
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.DONE,
    TaskStatus.BLOCKED,
    TaskStatus.PENDING,
    TaskStatus.COMPLETED,
    TaskStatus.CANCELLED
  ]).default(TaskStatus.TODO),
  priority: z.enum([
    TaskPriority.LOW,
    TaskPriority.MEDIUM,
    TaskPriority.HIGH,
    TaskPriority.URGENT,
    TaskPriority.CRITICAL
  ]).default(TaskPriority.MEDIUM),
  category: z.enum(Object.values(TaskCategory) as [string, ...string[]]),
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
    
    // Only add filters if they are valid enum values
    if (status && Object.values(TaskStatus).includes(status as TaskStatus)) {
      filter.status = status;
    }
    
    if (priority && Object.values(TaskPriority).includes(priority as TaskPriority)) {
      filter.priority = priority;
    }
    
    if (category && Object.values(TaskCategory).includes(category as TaskCategory)) {
      filter.category = category;
    }
    
    if (assigneeId) {
      filter.assigneeId = assigneeId;
    }
    
    // Check if we have users
    const usersCount = await prisma.user.count();
    
    if (usersCount === 0) {
      // Create mock users first
      await createMockUsers();
    }
    
    // Create mock tasks if no tasks exist
    const tasksCount = await prisma.task.count();
    
    if (tasksCount === 0) {
      await createMockTasks();
    }
    
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
      { error: 'Failed to fetch tasks', message: (error as Error).message },
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
      { error: 'Failed to create task', message: (error as Error).message },
      { status: 500 }
    );
  }
}

// Helper function to create mock users for testing
async function createMockUsers() {
  const mockUsers = [
    {
      name: 'Mária Nováková',
      email: 'maria.novakova@example.com',
      role: 'PROJECT_MANAGER',
    },
    {
      name: 'Ján Horváth',
      email: 'jan.horvath@example.com',
      role: 'TEAM_MEMBER',
    },
    {
      name: 'Peter Kováč',
      email: 'peter.kovac@example.com',
      role: 'TEAM_MEMBER',
    },
    {
      name: 'Anna Veselá',
      email: 'anna.vesela@example.com',
      role: 'STAKEHOLDER',
    },
  ];

  for (const user of mockUsers) {
    await prisma.user.create({
      data: user,
    });
  }
}

// Helper function to create mock tasks for testing
async function createMockTasks() {
  // Get users for assignment
  const users = await prisma.user.findMany();
  
  if (users.length === 0) {
    console.error('No users found for task assignment');
    return;
  }
  
  const mockTasks = [
    {
      title: 'Mesačný report pre INTERREG+',
      description: 'Pripraviť a odoslať mesačný report aktivít pre INTERREG+ program.',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      category: TaskCategory.REPORTING,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      progress: 100,
      assigneeId: users[0].id, // Assign to first user
    },
    {
      title: 'Kontrola sankčných zoznamov',
      description: 'Vykonať kontrolu sankčných zoznamov pre všetkých dodávateľov v projekte.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      category: TaskCategory.COMPLIANCE,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      progress: 60,
      assigneeId: users[1].id, // Assign to second user
    },
    {
      title: 'Príprava verejného obstarávania',
      description: 'Pripraviť dokumentáciu pre verejné obstarávanie na dodávku IT vybavenia.',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      category: TaskCategory.PROCUREMENT,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      progress: 20,
      assigneeId: users[2].id, // Assign to third user
    },
    {
      title: 'Finančný audit Q4',
      description: 'Vykonať interný finančný audit za Q4 2024.',
      status: TaskStatus.BLOCKED,
      priority: TaskPriority.CRITICAL,
      category: TaskCategory.FINANCIAL,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      progress: 10,
      assigneeId: users[3].id, // Assign to fourth user
    },
  ];

  for (const task of mockTasks) {
    const createdTask = await prisma.task.create({
      data: {
        ...task,
        externalId: `TASK-MOCK-${Math.floor(Math.random() * 1000)}`,
      },
    });
    
    // Create activity for task creation
    await prisma.activity.create({
      data: {
        type: 'TASK_CREATED',
        description: `Úloha '${createdTask.title}' bola vytvorená`,
        userId: task.assigneeId,
        taskId: createdTask.id,
      },
    });
    
    // Create activity for task completion if task is done
    if (task.status === TaskStatus.DONE) {
      await prisma.activity.create({
        data: {
          type: 'TASK_COMPLETED',
          description: `dokončila úlohu '${createdTask.title}'`,
          userId: task.assigneeId,
          taskId: createdTask.id,
        },
      });
    }
  }
}

