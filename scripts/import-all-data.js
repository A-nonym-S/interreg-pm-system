const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Mapovanie priority
function mapPriorityToEnum(priority) {
  const priorityMap = {
    'Vysoká': 'VYSOKA',
    'Stredná': 'STREDNA',
    'Nízka': 'NIZKA'
  };
  return priorityMap[priority] || 'STREDNA';
}

// Mapovanie periodicity
function mapRecurrenceToEnum(recurrence) {
  const recurrenceMap = {
    'Priebežne': 'PRIEBEZNE',
    'Priebežne (aktualizácia)': 'PRIEBEZNE',
    '2x mesačne': 'DVAKRAT_MESACNE',
    '1x kvartálne': 'KVARTALNE',
    'Jednorazovo': 'JEDNORAZOVO',
    'Jednorazovo (nastavenie) + Priebežne': 'PRIEBEZNE',
    'Podľa potreby': 'PODLA_POTREBY',
    'Periodicky (podľa harmonogramu)': 'PERIODICKY',
    'Počas stavebných prác': 'POCAS_STAVBY',
    'Po ukončení prác': 'PO_UKONCENI'
  };
  return recurrenceMap[recurrence] || 'PODLA_POTREBY';
}

// Parsovanie CSV
function parseCSV(content) {
  const lines = content.split('\n');
  const headers = lines[0].split(';');
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(';');
    const row = {};

    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });

    rows.push(row);
  }

  return rows;
}

// Parsovanie dátumu
function parseDate(dateStr) {
  if (!dateStr || dateStr === 'N/A') return null;
  
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
    /^(\d{2})\.(\d{2})\.(\d{4})$/, // DD.MM.YYYY
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/ // D.M.YYYY
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format === formats[0]) {
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      } else {
        return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
      }
    }
  }

  return null;
}

// Import dokumentov
async function importDocuments() {
  console.log('🚀 Začínam import dokumentov...');

  const csvPath = path.join(__dirname, '..', '..', 'upload', 'Prehlad_dokumentov.csv');
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV súbor nebol nájdený: ${csvPath}`);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const documentRows = parseCSV(csvContent);

  console.log(`📄 Načítaných ${documentRows.length} dokumentov z CSV`);

  await prisma.projectDocument.deleteMany();
  console.log('🗑️ Vymazané existujúce dokumenty');

  let importedCount = 0;
  let skippedCount = 0;

  for (const row of documentRows) {
    try {
      const internalNumber = parseInt(row['Interné P.č.']);
      
      if (isNaN(internalNumber)) {
        console.log(`⚠️ Preskakujem riadok s neplatným interným číslom: ${row['Interné P.č.']}`);
        skippedCount++;
        continue;
      }

      const isDirectSource = row['Priamy zdroj pre úlohu v Projektove_ulohy.csv?'] === 'ÁNO';

      const document = await prisma.projectDocument.create({
        data: {
          internalNumber,
          originalName: row['Názov dokumentu (originálny)'],
          taskType: row['Typ úlohy (hlavná kategória)'],
          isDirectSource,
          notes: row['Poznámky (Duplicita/Kontext)'] || null,
          filePath: null
        }
      });

      console.log(`✅ Importovaný dokument: ${document.internalNumber} - ${document.originalName}`);
      importedCount++;

    } catch (error) {
      console.error(`❌ Chyba pri importe dokumentu ${row['Interné P.č.']}:`, error);
      skippedCount++;
    }
  }

  console.log(`\n📊 Súhrn importu dokumentov:`);
  console.log(`   ✅ Úspešne importované: ${importedCount}`);
  console.log(`   ⚠️ Preskočené: ${skippedCount}`);

  return { importedCount, skippedCount };
}

// Hľadanie dokumentu podľa zdroja
async function findDocumentBySource(source) {
  try {
    const documentNameMatch = source.match(/^([^(]+)/);
    if (!documentNameMatch) return null;

    const documentName = documentNameMatch[1].trim();
    
    const document = await prisma.projectDocument.findFirst({
      where: {
        originalName: {
          contains: documentName,
          mode: 'insensitive'
        }
      }
    });

    return document?.id || null;
  } catch (error) {
    console.warn(`Nepodarilo sa nájsť dokument pre zdroj: ${source}`);
    return null;
  }
}

// Získanie parent task number
function getParentTaskNumber(taskNumber) {
  const parts = taskNumber.split('.');
  if (parts.length <= 1) return null;
  
  return parts.slice(0, -1).join('.');
}

// Import projektových úloh
async function importProjectTasks() {
  console.log('🚀 Začínam import projektových úloh...');

  const csvPath = path.join(__dirname, '..', '..', 'upload', 'Projektove_ulohy.csv');
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV súbor nebol nájdený: ${csvPath}`);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const taskRows = parseCSV(csvContent);

  console.log(`📋 Načítaných ${taskRows.length} úloh z CSV`);

  await prisma.projectSubtask.deleteMany();
  await prisma.projectTask.deleteMany();
  console.log('🗑️ Vymazané existujúce projektové úlohy');

  let importedCount = 0;
  let skippedCount = 0;
  const taskMap = new Map();

  // Prvý prechod - vytvorenie všetkých úloh
  for (const row of taskRows) {
    try {
      const taskNumber = row['P.č.'];
      
      if (!taskNumber) {
        console.log(`⚠️ Preskakujem riadok bez čísla úlohy`);
        skippedCount++;
        continue;
      }

      const startDate = parseDate(row['Začiatok']);
      const endDate = parseDate(row['Ukončenie']);
      const fulfillsKC = row['Plní KC?'] === 'ÁNO';
      const priority = mapPriorityToEnum(row['Priorita']);
      const recurrence = mapRecurrenceToEnum(row['Opakovanie']);

      const documentId = await findDocumentBySource(row['Zdroj (dokument, strana)']);

      const task = await prisma.projectTask.create({
        data: {
          taskNumber,
          taskType: row['Typ úlohy'],
          title: row['Názov úlohy'],
          description: row['Detailný popis'],
          source: row['Zdroj (dokument, strana)'],
          priority,
          recurrence,
          startDate,
          endDate,
          duration: row['Trvanie'] || null,
          responsiblePerson: row['Zodpovedná osoba'] || null,
          expectedResult: row['Očakávaný výsledok'] || null,
          fulfillsKC,
          notes: row['Poznámky'] || null,
          documentId
        }
      });

      taskMap.set(taskNumber, task.id);
      console.log(`✅ Vytvorená úloha: ${taskNumber} - ${task.title}`);
      importedCount++;

    } catch (error) {
      console.error(`❌ Chyba pri vytváraní úlohy ${row['P.č.']}:`, error);
      skippedCount++;
    }
  }

  // Druhý prechod - nastavenie parent referencií
  console.log('\n🔗 Nastavujem hierarchické vzťahy...');
  let hierarchyCount = 0;

  for (const row of taskRows) {
    try {
      const taskNumber = row['P.č.'];
      const parentTaskNumber = getParentTaskNumber(taskNumber);
      
      if (parentTaskNumber && taskMap.has(parentTaskNumber) && taskMap.has(taskNumber)) {
        const taskId = taskMap.get(taskNumber);
        const parentId = taskMap.get(parentTaskNumber);

        await prisma.projectTask.update({
          where: { id: taskId },
          data: { parentId }
        });

        console.log(`🔗 Nastavený parent: ${taskNumber} -> ${parentTaskNumber}`);
        hierarchyCount++;
      }
    } catch (error) {
      console.error(`❌ Chyba pri nastavovaní hierarchie pre ${row['P.č.']}:`, error);
    }
  }

  console.log(`\n📊 Súhrn importu projektových úloh:`);
  console.log(`   ✅ Úspešne importované: ${importedCount}`);
  console.log(`   🔗 Hierarchické vzťahy: ${hierarchyCount}`);
  console.log(`   ⚠️ Preskočené: ${skippedCount}`);

  return { importedCount, skippedCount, hierarchyCount };
}

// Hlavná funkcia
async function importAllData() {
  console.log('🚀 Začínam kompletný import projektových dát...\n');
  
  try {
    // 1. Import dokumentov
    console.log('📄 FÁZA 1: Import dokumentov');
    console.log('='.repeat(50));
    const documentsResult = await importDocuments();
    console.log('\n✅ Fáza 1 dokončená\n');

    // 2. Import projektových úloh
    console.log('📋 FÁZA 2: Import projektových úloh');
    console.log('='.repeat(50));
    const tasksResult = await importProjectTasks();
    console.log('\n✅ Fáza 2 dokončená\n');

    console.log('🎉 KOMPLETNÝ IMPORT ÚSPEŠNE DOKONČENÝ!');
    console.log('='.repeat(50));
    console.log(`📄 Dokumenty: ${documentsResult.importedCount} importovaných`);
    console.log(`📋 Úlohy: ${tasksResult.importedCount} importovaných`);
    console.log(`🔗 Hierarchie: ${tasksResult.hierarchyCount} nastavených`);

  } catch (error) {
    console.error('\n💥 CHYBA PRI IMPORTE:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Spustenie
if (require.main === module) {
  importAllData()
    .then(() => {
      console.log('✅ Import dokončený!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Import zlyhal:', error);
      process.exit(1);
    });
}

