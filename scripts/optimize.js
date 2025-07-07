/**
 * Optimalizačný skript pre INTERREG HUSKROUA Project Management System
 * 
 * Tento skript vykonáva nasledujúce optimalizácie:
 * 1. Analýza veľkosti balíčkov
 * 2. Optimalizácia obrázkov
 * 3. Kontrola výkonu komponentov
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Konfigurácia
const config = {
  srcDir: path.join(__dirname, '../src'),
  publicDir: path.join(__dirname, '../public'),
  componentsDir: path.join(__dirname, '../src/components'),
  outputFile: path.join(__dirname, '../optimization-report.md')
};

// Hlavná funkcia
async function main() {
  console.log('🚀 Spúšťam optimalizáciu INTERREG HUSKROUA Project Management System...');
  
  // Vytvorenie reportu
  let report = `# Optimalizačný report - INTERREG HUSKROUA Project Management System\n\n`;
  report += `Dátum: ${new Date().toLocaleString()}\n\n`;
  
  // 1. Analýza veľkosti balíčkov
  console.log('📦 Analyzujem veľkosť balíčkov...');
  report += `## Analýza veľkosti balíčkov\n\n`;
  
  try {
    // Spustenie next build s analýzou
    execSync('npx next build --analyze', { stdio: 'inherit' });
    report += `✅ Build analýza bola úspešne dokončená. Skontrolujte .next/analyze výstup.\n\n`;
  } catch (error) {
    report += `❌ Chyba pri analýze buildu: ${error.message}\n\n`;
  }
  
  // 2. Kontrola výkonu komponentov
  console.log('🔍 Kontrolujem výkon komponentov...');
  report += `## Kontrola výkonu komponentov\n\n`;
  
  const componentStats = analyzeComponents(config.componentsDir);
  report += `Celkový počet komponentov: ${componentStats.total}\n`;
  report += `Počet client komponentov: ${componentStats.clientComponents}\n`;
  report += `Počet server komponentov: ${componentStats.serverComponents}\n\n`;
  
  if (componentStats.largeComponents.length > 0) {
    report += `### Veľké komponenty (viac ako 100 riadkov)\n\n`;
    componentStats.largeComponents.forEach(comp => {
      report += `- ${comp.name}: ${comp.lines} riadkov\n`;
    });
    report += `\n`;
  }
  
  // 3. Odporúčania pre optimalizáciu
  console.log('💡 Generujem odporúčania pre optimalizáciu...');
  report += `## Odporúčania pre optimalizáciu\n\n`;
  
  report += `1. **Lazy loading komponentov**: Implementujte lazy loading pre komponenty, ktoré nie sú potrebné pri prvom načítaní.\n`;
  report += `2. **Optimalizácia obrázkov**: Používajte Next.js Image komponent pre automatickú optimalizáciu obrázkov.\n`;
  report += `3. **Memoizácia komponentov**: Používajte React.memo pre komponenty, ktoré sa často prerenderujú.\n`;
  report += `4. **Redukcia JavaScript bundle size**: Minimalizujte používanie veľkých knižníc a implementujte code splitting.\n`;
  report += `5. **Optimalizácia CSS**: Odstráňte nepoužívané CSS pomocou PurgeCSS.\n\n`;
  
  // Uloženie reportu
  fs.writeFileSync(config.outputFile, report);
  console.log(`✅ Optimalizačný report bol uložený do: ${config.outputFile}`);
}

// Analýza komponentov
function analyzeComponents(dir) {
  const stats = {
    total: 0,
    clientComponents: 0,
    serverComponents: 0,
    largeComponents: []
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
        const lines = content.split('\n').length;
        
        if (content.includes('"use client"') || content.includes("'use client'")) {
          stats.clientComponents++;
        } else {
          stats.serverComponents++;
        }
        
        if (lines > 100) {
          stats.largeComponents.push({
            name: path.relative(dir, filePath),
            lines
          });
        }
      }
    });
  }
  
  try {
    processDir(dir);
  } catch (error) {
    console.error(`Chyba pri analýze komponentov: ${error.message}`);
  }
  
  return stats;
}

// Spustenie hlavnej funkcie
main().catch(error => {
  console.error('❌ Chyba pri optimalizácii:', error);
  process.exit(1);
});

