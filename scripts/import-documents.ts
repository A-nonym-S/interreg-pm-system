import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface DocumentRow {
  'Interné P.č.': string;
  'Názov dokumentu (originálny)': string;
  'Typ úlohy (hlavná kategória)': string;
  'Priamy zdroj pre úlohu v Projektove_ulohy.csv?': string;
  'Poznámky (Duplicita/Kontext)': string;
}

function parseCSV(content: string): DocumentRow[] {
  const lines = content.split('\n');
  const headers = lines[0].split(';');
  const rows: DocumentRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(';');
    const row: any = {};

    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });

    rows.push(row);
  }

  return rows;
}

function mapPriorityToEnum(priority: string): string {
  const priorityMap: { [key: string]: string } = {
    'ÁNO': 'true',
    'NIE': 'false'
  };

  return priorityMap[priority] || 'false';
}

async function importDocuments() {
  try {
    console.log('🚀 Začínam import dokumentov...');

    // Načítanie CSV súboru
    const csvPath = path.join(process.cwd(), '..', 'upload', 'Prehlad_dokumentov.csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV súbor nebol nájdený: ${csvPath}`);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const documentRows = parseCSV(csvContent);

    console.log(`📄 Načítaných ${documentRows.length} dokumentov z CSV`);

    // Vymazanie existujúcich dokumentov
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

        const isDirectSource = mapPriorityToEnum(row['Priamy zdroj pre úlohu v Projektove_ulohy.csv?']) === 'true';

        const document = await prisma.projectDocument.create({
          data: {
            internalNumber,
            originalName: row['Názov dokumentu (originálny)'],
            taskType: row['Typ úlohy (hlavná kategória)'],
            isDirectSource,
            notes: row['Poznámky (Duplicita/Kontext)'] || null,
            filePath: null // Bude nastavené neskôr, ak budú súbory dostupné
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
    console.log(`   📄 Celkom spracované: ${documentRows.length}`);

    // Zobrazenie štatistík
    const totalDocuments = await prisma.projectDocument.count();
    const directSourceDocuments = await prisma.projectDocument.count({
      where: { isDirectSource: true }
    });

    console.log(`\n📈 Štatistiky dokumentov v databáze:`);
    console.log(`   📄 Celkom dokumentov: ${totalDocuments}`);
    console.log(`   🎯 Priame zdroje: ${directSourceDocuments}`);
    console.log(`   📋 Ostatné dokumenty: ${totalDocuments - directSourceDocuments}`);

    // Zobrazenie dokumentov podľa typu úlohy
    const documentsByType = await prisma.projectDocument.groupBy({
      by: ['taskType'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    console.log(`\n📊 Dokumenty podľa typu úlohy:`);
    documentsByType.forEach(group => {
      console.log(`   ${group.taskType}: ${group._count.id} dokumentov`);
    });

  } catch (error) {
    console.error('❌ Chyba pri importe dokumentov:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Spustenie importu
if (require.main === module) {
  importDocuments()
    .then(() => {
      console.log('🎉 Import dokumentov úspešne dokončený!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Import dokumentov zlyhal:', error);
      process.exit(1);
    });
}

export { importDocuments };

