import { importDocuments } from './import-documents';
import { importProjectTasks } from './import-project-tasks';

async function importAllData() {
  console.log('🚀 Začínam kompletný import projektových dát...\n');
  
  try {
    // 1. Import dokumentov
    console.log('📄 FÁZA 1: Import dokumentov');
    console.log('=' .repeat(50));
    await importDocuments();
    console.log('\n✅ Fáza 1 dokončená\n');

    // 2. Import projektových úloh
    console.log('📋 FÁZA 2: Import projektových úloh');
    console.log('=' .repeat(50));
    await importProjectTasks();
    console.log('\n✅ Fáza 2 dokončená\n');

    console.log('🎉 KOMPLETNÝ IMPORT ÚSPEŠNE DOKONČENÝ!');
    console.log('=' .repeat(50));
    console.log('✅ Všetky projektové dáta boli úspešne importované do databázy.');
    console.log('📊 Môžete teraz pokračovať s generovaním podúloh a testovaním aplikácie.');

  } catch (error) {
    console.error('\n💥 CHYBA PRI IMPORTE:', error);
    console.log('\n❌ Import bol prerušený kvôli chybe.');
    console.log('🔧 Skontrolujte chybové hlásenia vyššie a opravte problémy.');
    throw error;
  }
}

// Spustenie kompletného importu
if (require.main === module) {
  importAllData()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Import zlyhal:', error);
      process.exit(1);
    });
}

export { importAllData };

