const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Konštanty pre projekt
const PROJECT_START = new Date('2025-01-01');
const PROJECT_END = new Date('2026-12-31');

// Funkcia pre generovanie termínov podľa periodicity
function generateDueDates(recurrence, startDate, endDate) {
  const dates = [];
  const start = startDate || PROJECT_START;
  const end = endDate || PROJECT_END;

  switch (recurrence) {
    case 'DVAKRAT_MESACNE':
      // 2x mesačne - 1. a 15. deň každého mesiaca
      for (let date = new Date(start); date <= end; date.setMonth(date.getMonth() + 1)) {
        // 1. deň mesiaca
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        if (firstDay >= start && firstDay <= end) {
          dates.push(new Date(firstDay));
        }
        
        // 15. deň mesiaca
        const fifteenthDay = new Date(date.getFullYear(), date.getMonth(), 15);
        if (fifteenthDay >= start && fifteenthDay <= end) {
          dates.push(new Date(fifteenthDay));
        }
      }
      break;

    case 'KVARTALNE':
      // 1x kvartálne - 1. deň každého štvrťroka (január, apríl, júl, október)
      for (let year = start.getFullYear(); year <= end.getFullYear(); year++) {
        const quarters = [0, 3, 6, 9]; // január, apríl, júl, október
        for (const month of quarters) {
          const quarterDate = new Date(year, month, 1);
          if (quarterDate >= start && quarterDate <= end) {
            dates.push(new Date(quarterDate));
          }
        }
      }
      break;

    case 'PRIEBEZNE':
      // Priebežne - mesačné kontrolné body (1. deň mesiaca)
      for (let date = new Date(start); date <= end; date.setMonth(date.getMonth() + 1)) {
        const monthlyDate = new Date(date.getFullYear(), date.getMonth(), 1);
        if (monthlyDate >= start && monthlyDate <= end) {
          dates.push(new Date(monthlyDate));
        }
      }
      break;

    case 'JEDNORAZOVO':
      // Jednorazovo - jeden termín na začiatku alebo podľa špecifikácie
      if (start <= end) {
        dates.push(new Date(start));
      }
      break;

    case 'PODLA_POTREBY':
      // Podľa potreby - štvrťročné pripomienky
      for (let year = start.getFullYear(); year <= end.getFullYear(); year++) {
        const quarters = [0, 3, 6, 9]; // január, apríl, júl, október
        for (const month of quarters) {
          const quarterDate = new Date(year, month, 1);
          if (quarterDate >= start && quarterDate <= end) {
            dates.push(new Date(quarterDate));
          }
        }
      }
      break;

    case 'PERIODICKY':
      // Periodicky - mesačné kontrolné body
      for (let date = new Date(start); date <= end; date.setMonth(date.getMonth() + 1)) {
        const monthlyDate = new Date(date.getFullYear(), date.getMonth(), 1);
        if (monthlyDate >= start && monthlyDate <= end) {
          dates.push(new Date(monthlyDate));
        }
      }
      break;

    case 'POCAS_STAVBY':
      // Počas stavebných prác - mesačné kontroly počas celého projektu
      for (let date = new Date(start); date <= end; date.setMonth(date.getMonth() + 1)) {
        const monthlyDate = new Date(date.getFullYear(), date.getMonth(), 1);
        if (monthlyDate >= start && monthlyDate <= end) {
          dates.push(new Date(monthlyDate));
        }
      }
      break;

    case 'PO_UKONCENI':
      // Po ukončení prác - termín na konci projektu
      dates.push(new Date(end));
      break;

    default:
      // Pre neznáme typy periodicity - štvrťročné kontroly
      for (let year = start.getFullYear(); year <= end.getFullYear(); year++) {
        const quarters = [0, 3, 6, 9];
        for (const month of quarters) {
          const quarterDate = new Date(year, month, 1);
          if (quarterDate >= start && quarterDate <= end) {
            dates.push(new Date(quarterDate));
          }
        }
      }
      break;
  }

  return dates.sort((a, b) => a - b);
}

// Funkcia pre generovanie názvu podúlohy
function generateSubtaskTitle(taskTitle, dueDate, index, totalCount) {
  const dateStr = dueDate.toLocaleDateString('sk-SK', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  if (totalCount === 1) {
    return `${taskTitle} (${dateStr})`;
  } else {
    return `${taskTitle} - ${index + 1}/${totalCount} (${dateStr})`;
  }
}

// Funkcia pre generovanie popisu podúlohy
function generateSubtaskDescription(task, dueDate, index, totalCount) {
  const dateStr = dueDate.toLocaleDateString('sk-SK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let description = `Realizácia úlohy "${task.title}" na termín ${dateStr}.\n\n`;
  
  if (task.description) {
    description += `Popis úlohy: ${task.description}\n\n`;
  }

  if (task.expectedResult) {
    description += `Očakávaný výsledok: ${task.expectedResult}\n\n`;
  }

  if (task.responsiblePerson) {
    description += `Zodpovedná osoba: ${task.responsiblePerson}\n\n`;
  }

  description += `Periodicita: ${task.recurrence}\n`;
  description += `Priorita: ${task.priority}\n`;

  if (totalCount > 1) {
    description += `Poradie: ${index + 1} z ${totalCount} plánovaných realizácií`;
  }

  return description;
}

// Hlavná funkcia pre generovanie podúloh
async function generateSubtasksForTask(task) {
  try {
    console.log(`🔄 Generujem podúlohy pre: ${task.taskNumber} - ${task.title}`);

    // Vymazanie existujúcich podúloh pre túto úlohu
    await prisma.projectSubtask.deleteMany({
      where: { projectTaskId: task.id }
    });

    // Generovanie termínov podľa periodicity
    const dueDates = generateDueDates(task.recurrence, task.startDate, task.endDate);

    if (dueDates.length === 0) {
      console.log(`⚠️ Žiadne termíny pre úlohu ${task.taskNumber}`);
      return 0;
    }

    console.log(`📅 Generujem ${dueDates.length} podúloh pre periodicitu ${task.recurrence}`);

    // Vytvorenie podúloh
    let createdCount = 0;
    for (let i = 0; i < dueDates.length; i++) {
      const dueDate = dueDates[i];
      const title = generateSubtaskTitle(task.title, dueDate, i, dueDates.length);
      const description = generateSubtaskDescription(task, dueDate, i, dueDates.length);

      await prisma.projectSubtask.create({
        data: {
          projectTaskId: task.id,
          title,
          description,
          dueDate,
          status: 'PENDING',
          notes: `Automaticky generované pre periodicitu: ${task.recurrence}`
        }
      });

      createdCount++;
    }

    console.log(`✅ Vytvorených ${createdCount} podúloh pre úlohu ${task.taskNumber}`);
    return createdCount;

  } catch (error) {
    console.error(`❌ Chyba pri generovaní podúloh pre úlohu ${task.taskNumber}:`, error);
    return 0;
  }
}

// Hlavná funkcia pre generovanie všetkých podúloh
async function generateAllSubtasks() {
  try {
    console.log('🚀 Začínam generovanie podúloh pre všetky projektové úlohy...');
    console.log(`📅 Obdobie projektu: ${PROJECT_START.toLocaleDateString('sk-SK')} - ${PROJECT_END.toLocaleDateString('sk-SK')}`);

    // Získanie všetkých projektových úloh
    const tasks = await prisma.projectTask.findMany({
      orderBy: { taskNumber: 'asc' }
    });

    console.log(`📋 Načítaných ${tasks.length} projektových úloh`);

    let totalSubtasks = 0;
    let processedTasks = 0;

    for (const task of tasks) {
      const subtaskCount = await generateSubtasksForTask(task);
      totalSubtasks += subtaskCount;
      processedTasks++;

      // Progress update každých 10 úloh
      if (processedTasks % 10 === 0) {
        console.log(`📊 Spracovaných ${processedTasks}/${tasks.length} úloh...`);
      }
    }

    console.log(`\n🎉 GENEROVANIE PODÚLOH DOKONČENÉ!`);
    console.log(`📊 Súhrn:`);
    console.log(`   📋 Spracovaných úloh: ${processedTasks}`);
    console.log(`   📅 Vytvorených podúloh: ${totalSubtasks}`);
    console.log(`   📈 Priemer podúloh na úlohu: ${(totalSubtasks / processedTasks).toFixed(1)}`);

    // Štatistiky podľa periodicity
    const statsByRecurrence = await prisma.projectTask.groupBy({
      by: ['recurrence'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    console.log(`\n📊 Úlohy podľa periodicity:`);
    for (const stat of statsByRecurrence) {
      const subtaskCount = await prisma.projectSubtask.count({
        where: {
          projectTask: {
            recurrence: stat.recurrence
          }
        }
      });
      console.log(`   ${stat.recurrence}: ${stat._count.id} úloh → ${subtaskCount} podúloh`);
    }

    // Štatistiky podľa mesiacov
    const subtasksByMonth = await prisma.projectSubtask.groupBy({
      by: ['dueDate'],
      _count: {
        id: true
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    const monthlyStats = {};
    subtasksByMonth.forEach(item => {
      const month = item.dueDate.toISOString().substring(0, 7); // YYYY-MM
      monthlyStats[month] = (monthlyStats[month] || 0) + item._count.id;
    });

    console.log(`\n📅 Rozloženie podúloh podľa mesiacov:`);
    Object.entries(monthlyStats).forEach(([month, count]) => {
      console.log(`   ${month}: ${count} podúloh`);
    });

  } catch (error) {
    console.error('❌ Chyba pri generovaní podúloh:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Spustenie generovania
if (require.main === module) {
  generateAllSubtasks()
    .then(() => {
      console.log('✅ Generovanie podúloh dokončené!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Generovanie podúloh zlyhalo:', error);
      process.exit(1);
    });
}

module.exports = { generateAllSubtasks, generateSubtasksForTask };

