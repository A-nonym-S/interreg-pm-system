import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all project tasks with their periodicity and subtasks
    const projectTasks = await prisma.projectTask.findMany({
      include: {
        document: true,
        periodicity: true,
        subTasks: {
          orderBy: {
            dueDate: 'asc'
          },
          take: 10 // Limit to first 10 subtasks for performance
        },
      },
      orderBy: {
        sequenceNumber: 'asc'
      }
    });

    // Group tasks by periodicity type
    const kanbanColumns = [
      {
        id: 'once',
        title: 'Jednorazové úlohy',
        periodicityType: 'ONCE',
        tasks: []
      },
      {
        id: 'monthly',
        title: 'Mesačné úlohy',
        periodicityType: 'MONTHLY',
        tasks: []
      },
      {
        id: 'quarterly',
        title: 'Kvartálne úlohy',
        periodicityType: 'QUARTERLY',
        tasks: []
      },
      {
        id: 'semi_annually',
        title: 'Polročné úlohy',
        periodicityType: 'SEMI_ANNUALLY',
        tasks: []
      },
      {
        id: 'annually',
        title: 'Ročné úlohy',
        periodicityType: 'ANNUALLY',
        tasks: []
      },
      {
        id: 'custom',
        title: 'Ostatné úlohy',
        periodicityType: 'CUSTOM',
        tasks: []
      }
    ];

    // Distribute tasks into columns
    projectTasks.forEach(task => {
      const periodicityType = task.periodicity?.type || 'CUSTOM';
      
      // Handle special cases for monthly tasks
      if (periodicityType === 'MONTHLY' && task.periodicity?.frequency === 2) {
        // 2x mesačne - add to monthly column with special indicator
        const column = kanbanColumns.find(col => col.periodicityType === 'MONTHLY');
        if (column) {
          column.tasks.push({
            ...task,
            specialFrequency: '2x mesačne'
          });
        }
      } else if (periodicityType === 'MONTHLY' && task.periodicity?.interval === 4) {
        // 1x za 4 mesiace - add to quarterly column
        const column = kanbanColumns.find(col => col.periodicityType === 'QUARTERLY');
        if (column) {
          column.tasks.push({
            ...task,
            specialFrequency: '1x za 4 mesiace'
          });
        }
      } else {
        // Standard periodicity
        const column = kanbanColumns.find(col => col.periodicityType === periodicityType);
        if (column) {
          column.tasks.push(task);
        } else {
          // Fallback to custom column
          const customColumn = kanbanColumns.find(col => col.periodicityType === 'CUSTOM');
          if (customColumn) {
            customColumn.tasks.push(task);
          }
        }
      }
    });

    // Add task counts to column titles
    kanbanColumns.forEach(column => {
      column.title = `${column.title} (${column.tasks.length})`;
    });

    return NextResponse.json({
      columns: kanbanColumns,
      totalTasks: projectTasks.length
    });
  } catch (error) {
    console.error('Error fetching kanban data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kanban data' },
      { status: 500 }
    );
  }
}

