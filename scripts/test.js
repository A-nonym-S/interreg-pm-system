/**
 * Testovací skript pre INTERREG HUSKROUA Project Management System
 * 
 * Tento skript vykonáva nasledujúce testy:
 * 1. Kontrola komponentov
 * 2. Kontrola API routes
 * 3. Kontrola typov
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Konfigurácia
const config = {
  srcDir: path.join(__dirname, '../src'),
  apiDir: path.join(__dirname, '../src/app/api'),
  componentsDir: path.join(__dirname, '../src/components'),
  outputFile: path.join(__dirname, '../test-report.md')
};

// Hlavná funkcia
async function main() {
  console.log('🧪 Spúšťam testy INTERREG HUSKROUA Project Management System...');
  
  // Vytvorenie reportu
  let report = `# Testovací report - INTERREG HUSKROUA Project Management System\n\n`;
  report += `Dátum: ${new Date().toLocaleString()}\n\n`;
  
  // 1. Kontrola komponentov
  console.log('🔍 Kontrolujem komponenty...');
  report += `## Kontrola komponentov\n\n`;
  
  const componentStats = testComponents(config.componentsDir);
  report += `Celkový počet komponentov: ${componentStats.total}\n`;
  report += `Počet UI komponentov: ${componentStats.uiComponents}\n`;
  report += `Počet layout komponentov: ${componentStats.layoutComponents}\n`;
  report += `Počet dashboard komponentov: ${componentStats.dashboardComponents}\n\n`;
  
  if (componentStats.errors.length > 0) {
    report += `### Chyby v komponentoch\n\n`;
    componentStats.errors.forEach(error => {
      report += `- ${error}\n`;
    });
    report += `\n`;
  } else {
    report += `✅ Žiadne chyby v komponentoch neboli nájdené.\n\n`;
  }
  
  // 2. Kontrola API routes
  console.log('🔌 Kontrolujem API routes...');
  report += `## Kontrola API routes\n\n`;
  
  const apiStats = testApiRoutes(config.apiDir);
  report += `Celkový počet API routes: ${apiStats.total}\n`;
  report += `Počet GET endpointov: ${apiStats.getEndpoints}\n`;
  report += `Počet POST endpointov: ${apiStats.postEndpoints}\n`;
  report += `Počet PUT endpointov: ${apiStats.putEndpoints}\n`;
  report += `Počet DELETE endpointov: ${apiStats.deleteEndpoints}\n\n`;
  
  if (apiStats.errors.length > 0) {
    report += `### Chyby v API routes\n\n`;
    apiStats.errors.forEach(error => {
      report += `- ${error}\n`;
    });
    report += `\n`;
  } else {
    report += `✅ Žiadne chyby v API routes neboli nájdené.\n\n`;
  }
  
  // 3. Kontrola typov
  console.log('📝 Kontrolujem TypeScript typy...');
  report += `## Kontrola TypeScript typov\n\n`;
  
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    report += `✅ Žiadne TypeScript chyby neboli nájdené.\n\n`;
  } catch (error) {
    const errorOutput = error.stdout ? error.stdout.toString() : error.message;
    report += `❌ Nájdené TypeScript chyby:\n\`\`\`\n${errorOutput}\n\`\`\`\n\n`;
  }
  
  // 4. Odporúčania pre zlepšenie
  console.log('💡 Generujem odporúčania pre zlepšenie...');
  report += `## Odporúčania pre zlepšenie\n\n`;
  
  report += `1. **Jednotné testy**: Implementujte jednotné testy pre kritické komponenty a API routes.\n`;
  report += `2. **End-to-end testy**: Pridajte end-to-end testy pomocou Cypress alebo Playwright.\n`;
  report += `3. **Validácia vstupov**: Zabezpečte dôkladnú validáciu vstupov na všetkých API endpointoch.\n`;
  report += `4. **Error handling**: Vylepšite error handling v celej aplikácii.\n`;
  report += `5. **Dokumentácia API**: Vytvorte dokumentáciu API pomocou Swagger alebo podobného nástroja.\n\n`;
  
  // Uloženie reportu
  fs.writeFileSync(config.outputFile, report);
  console.log(`✅ Testovací report bol uložený do: ${config.outputFile}`);
}

// Test komponentov
function testComponents(dir) {
  const stats = {
    total: 0,
    uiComponents: 0,
    layoutComponents: 0,
    dashboardComponents: 0,
    errors: []
  };
  
  function processDir(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    files.forEach(file => {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        processDir(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        stats.total++;
        
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Kategorizácia komponentov
        if (filePath.includes('/ui/')) {
          stats.uiComponents++;
        } else if (filePath.includes('/layout/')) {
          stats.layoutComponents++;
        } else if (filePath.includes('/dashboard/')) {
          stats.dashboardComponents++;
        }
        
        // Kontrola chýb
        if (!content.includes('export') && !content.includes('export default')) {
          stats.errors.push(`Komponent ${path.relative(dir, filePath)} nemá export.`);
        }
        
        if (content.includes('TODO') || content.includes('FIXME')) {
          stats.errors.push(`Komponent ${path.relative(dir, filePath)} obsahuje TODO alebo FIXME komentáre.`);
        }
      }
    });
  }
  
  try {
    processDir(dir);
  } catch (error) {
    stats.errors.push(`Chyba pri testovaní komponentov: ${error.message}`);
  }
  
  return stats;
}

// Test API routes
function testApiRoutes(dir) {
  const stats = {
    total: 0,
    getEndpoints: 0,
    postEndpoints: 0,
    putEndpoints: 0,
    deleteEndpoints: 0,
    errors: []
  };
  
  function processDir(currentDir) {
    try {
      const files = fs.readdirSync(currentDir);
      
      files.forEach(file => {
        const filePath = path.join(currentDir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          processDir(filePath);
        } else if (file === 'route.ts' || file === 'route.js') {
          stats.total++;
          
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Počítanie HTTP metód
          if (content.includes('export async function GET') || content.includes('export const GET')) {
            stats.getEndpoints++;
          }
          
          if (content.includes('export async function POST') || content.includes('export const POST')) {
            stats.postEndpoints++;
          }
          
          if (content.includes('export async function PUT') || content.includes('export const PUT')) {
            stats.putEndpoints++;
          }
          
          if (content.includes('export async function DELETE') || content.includes('export const DELETE')) {
            stats.deleteEndpoints++;
          }
          
          // Kontrola chýb
          if (!content.includes('try') || !content.includes('catch')) {
            stats.errors.push(`API route ${path.relative(dir, filePath)} nemá správny error handling (try/catch).`);
          }
        }
      });
    } catch (error) {
      if (error.code !== 'ENOENT') {
        stats.errors.push(`Chyba pri testovaní API routes: ${error.message}`);
      }
    }
  }
  
  processDir(dir);
  return stats;
}

// Spustenie hlavnej funkcie
main().catch(error => {
  console.error('❌ Chyba pri testovaní:', error);
  process.exit(1);
});

