import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Project duration: 01.01.2025 - 31.12.2026 (24 months)
const PROJECT_START = new Date('2025-01-01');
const PROJECT_END = new Date('2026-12-31');

function generateSubTaskDates(periodicity: any, startDate?: Date, endDate?: Date): Date[] {
  const dates: Date[] = [];
  const actualStart = startDate || PROJECT_START;
  const actualEnd = endDate || PROJECT_END;
  
  if (periodicity.type === 'ONCE') {
    dates.push(actualStart);
    return dates;
  }
  
  let currentDate = new Date(actualStart);
  
  while (currentDate <= actualEnd) {
    dates.push(new Date(currentDate));
    
    switch (periodicity.type) {
      case 'DAILY':
        currentDate.setDate(currentDate.getDate() + periodicity.interval);
        break;
        
      case 'WEEKLY':
        currentDate.setDate(currentDate.getDate() + (7 * periodicity.interval));
        break;
        
      case 'MONTHLY':
        if (periodicity.frequency === 2) {
          // 2x mesačne - 1. a 15. deň v mesiaci
          if (currentDate.getDate() === 1) {
            currentDate.setDate(15);
          } else {
            currentDate.setMonth(currentDate.getMonth() + periodicity.interval);
            currentDate.setDate(1);
          }
        } else {
          // 1x mesačne alebo iná frekvencia
          currentDate.setMonth(currentDate.getMonth() + periodicity.interval);
        }
        break;
        
      case 'QUARTERLY':
        currentDate.setMonth(currentDate.getMonth() + (3 * periodicity.interval));
        break;
        
      case 'SEMI_ANNUALLY':
        currentDate.setMonth(currentDate.getMonth() + (6 * periodicity.interval));
        break;
        
      case 'ANNUALLY':
        currentDate.setFullYear(currentDate.getFullYear() + periodicity.interval);
        break;
        
      default:
        // For CUSTOM or unknown types, default to monthly
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
    }
  }
  
  return dates;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the project task with its periodicity
    const projectTask = await prisma.projectTask.findUnique({
      where: { id: params.id },
      include: {
        periodicity: true,
        subTasks: true
      }
    });

    if (!projectTask) {
      return NextResponse.json(
        { error: 'Project task not found' },
        { status: 404 }
      );
    }

    if (!projectTask.periodicity) {
      return NextResponse.json(
        { error: 'Project task has no periodicity defined' },
        { status: 400 }
      );
    }

    // Delete existing subtasks
    await prisma.subTask.deleteMany({
      where: { projectTaskId: params.id }
    });

    // Generate new subtask dates
    const dates = generateSubTaskDates(
      projectTask.periodicity,
      projectTask.startDate,
      projectTask.endDate
    );

    // Create subtasks
    const subTasks = [];
    for (let i = 0; i < dates.length; i++) {
      const dueDate = dates[i];
      const subTask = await prisma.subTask.create({
        data: {
          projectTaskId: params.id,
          title: `${projectTask.title} - ${dueDate.toLocaleDateString('sk-SK')}`,
          description: `Realizácia úlohy k termínu ${dueDate.toLocaleDateString('sk-SK')}`,
          dueDate: dueDate,
          status: 'PENDING'
        }
      });
      subTasks.push(subTask);
    }

    return NextResponse.json({
      message: `Generated ${subTasks.length} subtasks`,
      subTasks: subTasks
    });
  } catch (error) {
    console.error('Error generating subtasks:', error);
    return NextResponse.json(
      { error: 'Failed to generate subtasks' },
      { status: 500 }
    );
  }
}

