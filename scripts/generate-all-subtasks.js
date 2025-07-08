const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Project duration: 01.01.2025 - 31.12.2026 (24 months)
const PROJECT_START = new Date('2025-01-01');
const PROJECT_END = new Date('2026-12-31');

function generateSubTaskDates(periodicity, startDate, endDate) {
  const dates = [];
  const actualStart = startDate || PROJECT_START;
  const actualEnd = endDate || PROJECT_END;
  
  console.log(`Generating dates for periodicity: ${periodicity.type}, frequency: ${periodicity.frequency}, interval: ${periodicity.interval}`);
  console.log(`Date range: ${actualStart.toLocaleDateString('sk-SK')} - ${actualEnd.toLocaleDateString('sk-SK')}`);
  
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
        } else if (periodicity.interval === 4) {
          // 1x za 4 mesiace
          currentDate.setMonth(currentDate.getMonth() + 4);
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
    
    // Safety check to prevent infinite loops
    if (dates.length > 100) {
      console.warn(`Too many dates generated for task, stopping at 100`);
      break;
    }
  }
  
  console.log(`Generated ${dates.length} dates`);
  return dates;
}

async function generateSubTasksForTask(projectTask) {
  console.log(`\n=== Processing task: ${projectTask.sequenceNumber} - ${projectTask.title} ===`);
  
  if (!projectTask.periodicity) {
    console.log('No periodicity defined, skipping...');
    return;
  }
  
  // Delete existing subtasks
  const deletedCount = await prisma.subTask.deleteMany({
    where: { projectTaskId: projectTask.id }
  });
  console.log(`Deleted ${deletedCount.count} existing subtasks`);
  
  // Generate new subtask dates
  const dates = generateSubTaskDates(
    projectTask.periodicity,
    projectTask.startDate,
    projectTask.endDate
  );
  
  if (dates.length === 0) {
    console.log('No dates generated');
    return;
  }
  
  // Create subtasks
  const subTasks = [];
  for (let i = 0; i < dates.length; i++) {
    const dueDate = dates[i];
    
    try {
      const subTask = await prisma.subTask.create({
        data: {
          projectTaskId: projectTask.id,
          title: `${projectTask.title} - ${dueDate.toLocaleDateString('sk-SK')}`,
          description: `Realizácia úlohy k termínu ${dueDate.toLocaleDateString('sk-SK')}`,
          dueDate: dueDate,
          status: 'PENDING'
        }
      });
      subTasks.push(subTask);
    } catch (error) {
      console.error(`Error creating subtask for ${dueDate.toLocaleDateString('sk-SK')}:`, error.message);
    }
  }
  
  console.log(`Created ${subTasks.length} subtasks`);
  
  // Show first few dates as example
  const exampleDates = dates.slice(0, 5).map(d => d.toLocaleDateString('sk-SK')).join(', ');
  console.log(`Example dates: ${exampleDates}${dates.length > 5 ? '...' : ''}`);
  
  return subTasks;
}

async function main() {
  try {
    console.log('Starting subtask generation for all project tasks...\n');
    
    // Get all project tasks with their periodicity
    const projectTasks = await prisma.projectTask.findMany({
      include: {
        periodicity: true,
        subTasks: true
      },
      orderBy: {
        sequenceNumber: 'asc'
      }
    });
    
    console.log(`Found ${projectTasks.length} project tasks`);
    
    let totalSubTasks = 0;
    let processedTasks = 0;
    
    for (const task of projectTasks) {
      const subTasks = await generateSubTasksForTask(task);
      if (subTasks) {
        totalSubTasks += subTasks.length;
        processedTasks++;
      }
    }
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Processed ${processedTasks} tasks`);
    console.log(`Generated ${totalSubTasks} total subtasks`);
    console.log(`Project duration: ${PROJECT_START.toLocaleDateString('sk-SK')} - ${PROJECT_END.toLocaleDateString('sk-SK')} (24 months)`);
    
    // Show some statistics
    const periodicityStats = await prisma.taskPeriodicity.groupBy({
      by: ['type'],
      _count: {
        type: true
      }
    });
    
    console.log('\nPeriodicity distribution:');
    periodicityStats.forEach(stat => {
      console.log(`- ${stat.type}: ${stat._count.type} tasks`);
    });
    
  } catch (error) {
    console.error('Error generating subtasks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

