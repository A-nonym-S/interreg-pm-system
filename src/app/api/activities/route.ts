import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

