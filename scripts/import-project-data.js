const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(';').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';').map(v => v.trim());
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    data.push(row);
  }
  
  return data;
}

function parseDate(dateStr) {
  if (!dateStr || dateStr === 'N/A') return null;
  
  // Handle different date formats
  if (dateStr === '2025-01-01') return new Date('2025-01-01');
  if (dateStr === '2026-12-31') return new Date('2026-12-31');
  if (dateStr.includes('2025-01-01')) return new Date('2025-01-01');
  if (dateStr.includes('2026-12-31')) return new Date('2026-12-31');
  
  return null;
}

function parseRepetition(repetition) {
  const rep = repetition.toLowerCase();
  
  if (rep.includes('jednorazovo') || rep.includes('once')) {
    return { type: 'ONCE', frequency: 1, interval: 1 };
  }
  
  if (rep.includes('priebežne') || rep.includes('continuous')) {
    return { type: 'MONTHLY', frequency: 1, interval: 1 };
  }
  
  if (rep.includes('2x mesačne') || rep.includes('twice monthly')) {
    return { type: 'MONTHLY', frequency: 2, interval: 1 };
  }
  
  if (rep.includes('1x za 4 mes') || rep.includes('quarterly')) {
    return { type: 'MONTHLY', frequency: 1, interval: 4 };
  }
  
  if (rep.includes('kvartálne')) {
    return { type: 'QUARTERLY', frequency: 1, interval: 1 };
  }
  
  if (rep.includes('ročne') || rep.includes('annually')) {
    return { type: 'ANNUALLY', frequency: 1, interval: 1 };
  }
  
  if (rep.includes('podľa potreby') || rep.includes('as needed')) {
    return { type: 'CUSTOM', frequency: 1, interval: 1 };
  }
  
  // Default to monthly for continuous tasks
  return { type: 'MONTHLY', frequency: 1, interval: 1 };
}

async function importProjectDocuments() {
  console.log('Importing project documents...');
  
  const csvPath = '/home/ubuntu/upload/Prehlad_dokumentov.csv';
  const content = fs.readFileSync(csvPath, 'utf-8');
  const documents = parseCSV(content);
  
  for (const doc of documents) {
    const internalNumber = parseInt(doc['Interné P.č.']);
    if (isNaN(internalNumber)) continue;
    
    const isDirectSource = doc['Priamy zdroj pre úlohu v Projektove_ulohy.csv?'].toUpperCase() === 'ÁNO';
    
    try {
      await prisma.projectDocument.upsert({
        where: { internalNumber },
        update: {
          originalName: doc['Názov dokumentu (originálny)'],
          taskType: doc['Typ úlohy (hlavná kategória)'],
          isDirectSource,
          notes: doc['Poznámky (Duplicita/Kontext)'] || null,
        },
        create: {
          internalNumber,
          originalName: doc['Názov dokumentu (originálny)'],
          taskType: doc['Typ úlohy (hlavná kategória)'],
          isDirectSource,
          notes: doc['Poznámky (Duplicita/Kontext)'] || null,
        },
      });
    } catch (error) {
      console.error(`Error importing document ${internalNumber}:`, error.message);
    }
  }
  
  console.log(`Imported ${documents.length} project documents`);
}

async function importProjectTasks() {
  console.log('Importing project tasks...');
  
  const csvPath = '/home/ubuntu/upload/Projektove_ulohy.csv';
  const content = fs.readFileSync(csvPath, 'utf-8');
  const tasks = parseCSV(content);
  
  for (const task of tasks) {
    const sequenceNumber = task['P.č.'];
    if (!sequenceNumber) continue;
    
    const startDate = parseDate(task['Začiatok']);
    const endDate = parseDate(task['Ukončenie']);
    const fulfillsKC = task['Plní KC?'].toUpperCase() === 'ÁNO';
    
    // Find related document
    const source = task['Zdroj (dokument, strana)'];
    let documentId = null;
    
    if (source) {
      try {
        // Try to match document by name in source
        const documents = await prisma.projectDocument.findMany();
        const matchedDoc = documents.find(doc => 
          source.toLowerCase().includes(doc.originalName.toLowerCase().substring(0, 20))
        );
        if (matchedDoc) {
          documentId = matchedDoc.id;
        }
      } catch (error) {
        console.error('Error finding document:', error.message);
      }
    }
    
    try {
      // Create project task
      const projectTask = await prisma.projectTask.upsert({
        where: { sequenceNumber },
        update: {
          taskType: task['Typ úlohy'],
          title: task['Názov úlohy'],
          detailedDescription: task['Detailný popis'],
          source: task['Zdroj (dokument, strana)'],
          priority: task['Priorita'],
          repetition: task['Opakovanie'],
          startDate,
          endDate,
          duration: task['Trvanie'] || null,
          responsiblePerson: task['Zodpovedná osoba'] || null,
          expectedResult: task['Očakávaný výsledok'] || null,
          fulfillsKC,
          notes: task['Poznámky'] || null,
          documentId,
        },
        create: {
          sequenceNumber,
          taskType: task['Typ úlohy'],
          title: task['Názov úlohy'],
          detailedDescription: task['Detailný popis'],
          source: task['Zdroj (dokument, strana)'],
          priority: task['Priorita'],
          repetition: task['Opakovanie'],
          startDate,
          endDate,
          duration: task['Trvanie'] || null,
          responsiblePerson: task['Zodpovedná osoba'] || null,
          expectedResult: task['Očakávaný výsledok'] || null,
          fulfillsKC,
          notes: task['Poznámky'] || null,
          documentId,
        },
      });
      
      // Create periodicity
      const repetitionData = parseRepetition(task['Opakovanie']);
      
      await prisma.taskPeriodicity.upsert({
        where: { projectTaskId: projectTask.id },
        update: {
          type: repetitionData.type,
          frequency: repetitionData.frequency,
          interval: repetitionData.interval,
        },
        create: {
          projectTaskId: projectTask.id,
          type: repetitionData.type,
          frequency: repetitionData.frequency,
          interval: repetitionData.interval,
        },
      });
      
      console.log(`Imported task: ${sequenceNumber} - ${task['Názov úlohy']}`);
    } catch (error) {
      console.error(`Error importing task ${sequenceNumber}:`, error.message);
    }
  }
  
  console.log(`Imported ${tasks.length} project tasks`);
}

async function main() {
  try {
    await importProjectDocuments();
    await importProjectTasks();
    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

