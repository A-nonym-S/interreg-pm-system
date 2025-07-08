import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ActivityType } from '@/types';

// GET /api/activities - Get all activities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '20');
    const taskId = searchParams.get('taskId');
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    
    // Build filter object
    const filter: any = {};
    
    if (taskId) filter.taskId = taskId;
    if (userId) filter.userId = userId;
    if (type) filter.type = type;
    
    // Check if we have activities
    const activitiesCount = await prisma.activity.count();
    
    if (activitiesCount === 0) {
      // Create mock activities
      await createMockActivities();
    }
    
    const activities = await prisma.activity.findMany({
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            externalId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
    
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities', message: (error as Error).message },
      { status: 500 }
    );
  }
}

// Helper function to create mock activities
async function createMockActivities() {
  // Get users and tasks
  const users = await prisma.user.findMany();
  const tasks = await prisma.task.findMany();
  
  if (users.length === 0 || tasks.length === 0) {
    console.error('No users or tasks found for activity creation');
    return;
  }
  
  // Create mock activities
  const mockActivities = [
    {
      type: ActivityType.TASK_COMPLETED,
      description: `dokončila úlohu '${tasks[0].title}'`,
      userId: users[0].id,
      taskId: tasks[0].id,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      type: ActivityType.TASK_CREATED,
      description: `vytvoril novú úlohu '${tasks[1].title}'`,
      userId: users[1].id,
      taskId: tasks[1].id,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      type: ActivityType.COMPLIANCE_CHECK,
      description: `vykonal compliance kontrolu pre '${tasks[2].title}'`,
      userId: users[2].id,
      taskId: tasks[2].id,
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    },
    {
      type: ActivityType.TASK_ASSIGNED,
      description: `priradil úlohu '${tasks[3].title}' používateľovi ${users[3].name}`,
      userId: users[0].id,
      taskId: tasks[3].id,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      type: ActivityType.COMMENT_ADDED,
      description: `pridal komentár k úlohe '${tasks[0].title}'`,
      userId: users[1].id,
      taskId: tasks[0].id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  ];
  
  for (const activity of mockActivities) {
    await prisma.activity.create({
      data: activity,
    });
  }
}

