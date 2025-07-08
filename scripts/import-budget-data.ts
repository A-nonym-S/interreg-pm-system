import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

interface BudgetRowData {
  'P.č.': string;
  'Rozpočtové položky': string;
  'Project activity': string;
  'Aktivity projektu': string;
  'Unit': string;
  'Počet': number;
  'Jednotková cena v EUR': number;
  'Celková cena v EUR': number;
  'Popis': string;
  'Detail': string;
  'Cena v EUR finálna': number;
  'Obodbie 24 mes.': number;
  'Poznámka': string;
}

interface ResponsiblePersonData {
  'P.č.': number;
  'Role (pozícia)': string;
  'Interný (s odôvodnením)': string;
  'Náplň činností (popis úloh)': string;
  'Požadované kompetencie/skúsenosti': string;
  'Súvisiace aktivity projektu (zdroj)': string;
  'Zodpovedná osoba': string;
}

async function importBudgetData() {
  console.log('🚀 Začínam import rozpočtových dát...');

  try {
    // Načítanie Excel súboru
    const workbook = XLSX.readFile('/home/ubuntu/upload/HMG+Budget-SK.xlsx');
    
    // 1. Vytvorenie hlavného rozpočtu
    console.log('📊 Vytváram hlavný rozpočet...');
    const budget = await prisma.budget.create({
      data: {
        projectName: 'INTERREG HUSKROUA - Nemocnica Kráľovský Chlmec',
        totalAmount: new Decimal(416052),
        startDate: new Date('2025-01-01'),
        endDate: new Date('2026-12-31'),
        currency: 'EUR',
        status: 'ACTIVE',
        createdBy: 'system'
      }
    });

    // 2. Vytvorenie rozpočtových kategórií
    console.log('📂 Vytváram rozpočtové kategórie...');
    const categories = [
      { name: 'Personálne náklady', code: 'PERSONAL', maxLimit: new Decimal(15.00) },
      { name: 'Kancelárske a administratívne výdavky', code: 'ADMIN', maxLimit: new Decimal(15.00) },
      { name: 'Cestovanie a ubytovanie', code: 'TRAVEL', maxLimit: new Decimal(15.00) },
      { name: 'Školenia a vzdelávanie', code: 'TRAINING', maxLimit: null },
      { name: 'Komunikácia a PR', code: 'COMMUNICATION', maxLimit: null },
      { name: 'Investície do vybavenia', code: 'EQUIPMENT', maxLimit: null }
    ];

    const createdCategories = await Promise.all(
      categories.map(cat => 
        prisma.budgetCategory.create({
          data: {
            budgetId: budget.id,
            name: cat.name,
            code: cat.code,
            maxLimit: cat.maxLimit
          }
        })
      )
    );

    // 3. Vytvorenie partnera
    console.log('🤝 Vytváram partnera...');
    const partner = await prisma.budgetPartner.create({
      data: {
        budgetId: budget.id,
        partnerName: 'Nemocnica Kráľovský Chlmec',
        allocation: new Decimal(416052)
      }
    });

    // 4. Import rozpočtových položiek z Budget_SK háru
    console.log('💰 Importujem rozpočtové položky...');
    const budgetSheet = workbook.Sheets['Budget_SK'];
    const budgetData: BudgetRowData[] = XLSX.utils.sheet_to_json(budgetSheet);

    let itemCount = 0;
    for (const row of budgetData) {
      if (!row['P.č.'] || !row['Rozpočtové položky']) continue;

      // Určenie kategórie na základe názvu položky
      let categoryId = createdCategories[0].id; // default
      const itemName = row['Rozpočtové položky'].toLowerCase();
      
      if (itemName.includes('personálne')) {
        categoryId = createdCategories.find(c => c.code === 'PERSONAL')?.id || categoryId;
      } else if (itemName.includes('kancelárske') || itemName.includes('administratívne')) {
        categoryId = createdCategories.find(c => c.code === 'ADMIN')?.id || categoryId;
      } else if (itemName.includes('cestovanie') || itemName.includes('ubytovanie')) {
        categoryId = createdCategories.find(c => c.code === 'TRAVEL')?.id || categoryId;
      } else if (itemName.includes('školenie') || row['P.č.'].startsWith('4.2')) {
        categoryId = createdCategories.find(c => c.code === 'TRAINING')?.id || categoryId;
      } else if (itemName.includes('komunikácia') || itemName.includes('tlačová') || row['P.č.'].startsWith('4.6') || row['P.č.'].startsWith('4.7')) {
        categoryId = createdCategories.find(c => c.code === 'COMMUNICATION')?.id || categoryId;
      } else if (row['P.č.'].startsWith('5.1')) {
        categoryId = createdCategories.find(c => c.code === 'EQUIPMENT')?.id || categoryId;
      }

      await prisma.budgetItem.create({
        data: {
          budgetId: budget.id,
          partnerId: partner.id,
          categoryId: categoryId,
          itemNumber: row['P.č.'],
          name: row['Rozpočtové položky'],
          projectActivity: row['Project activity'] || null,
          activityDescription: row['Aktivity projektu'] || null,
          unit: row['Unit'] || null,
          quantity: row['Počet'] ? new Decimal(row['Počet']) : null,
          unitPrice: row['Jednotková cena v EUR'] ? new Decimal(row['Jednotková cena v EUR']) : null,
          totalPrice: new Decimal(row['Celková cena v EUR'] || 0),
          description: row['Popis'] || null,
          detail: row['Detail'] || null,
          finalPrice: row['Cena v EUR finálna'] ? new Decimal(row['Cena v EUR finálna']) : null,
          period24Months: row['Obodbie 24 mes.'] ? new Decimal(row['Obodbie 24 mes.']) : null,
          notes: row['Poznámka'] || null,
          plannedAmount: new Decimal(row['Celková cena v EUR'] || 0),
          spentAmount: new Decimal(0)
        }
      });

      itemCount++;
    }

    // 5. Import zodpovedných osôb
    console.log('👥 Importujem zodpovedné osoby...');
    const responsibleSheet = workbook.Sheets['Zodpovedné osoby'];
    const responsibleData: ResponsiblePersonData[] = XLSX.utils.sheet_to_json(responsibleSheet);

    let personCount = 0;
    for (const row of responsibleData) {
      if (!row['P.č.'] || !row['Role (pozícia)']) continue;

      await prisma.responsiblePerson.create({
        data: {
          orderNumber: row['P.č.'],
          role: row['Role (pozícia)'],
          isInternal: true,
          internalReason: row['Interný (s odôvodnením)'] || null,
          responsibilities: row['Náplň činností (popis úloh)'] || '',
          competencies: row['Požadované kompetencie/skúsenosti'] || '',
          relatedActivities: row['Súvisiace aktivity projektu (zdroj)'] || null,
          personName: row['Zodpovedná osoba'] || null
        }
      });

      personCount++;
    }

    // 6. Vytvorenie záznamu o importe
    await prisma.budgetImportHistory.create({
      data: {
        budgetId: budget.id,
        filename: 'HMG+Budget-SK.xlsx',
        importedBy: 'system',
        itemsCount: itemCount,
        totalAmount: new Decimal(416052),
        status: 'SUCCESS'
      }
    });

    console.log('✅ Import úspešne dokončený!');
    console.log(`📊 Rozpočet: ${budget.projectName}`);
    console.log(`💰 Celková suma: ${budget.totalAmount} EUR`);
    console.log(`📂 Kategórie: ${categories.length}`);
    console.log(`💼 Rozpočtové položky: ${itemCount}`);
    console.log(`👥 Zodpovedné osoby: ${personCount}`);

  } catch (error) {
    console.error('❌ Chyba pri importe:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Spustenie importu
if (require.main === module) {
  importBudgetData()
    .then(() => {
      console.log('🎉 Import rozpočtových dát dokončený!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Import zlyhal:', error);
      process.exit(1);
    });
}

export { importBudgetData };

