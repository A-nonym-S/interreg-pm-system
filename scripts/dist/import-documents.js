"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.importDocuments = importDocuments;
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const prisma = new client_1.PrismaClient();
function parseCSV(content) {
    const lines = content.split('\n');
    const headers = lines[0].split(';');
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line)
            continue;
        const values = line.split(';');
        const row = {};
        headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim() || '';
        });
        rows.push(row);
    }
    return rows;
}
function mapPriorityToEnum(priority) {
    const priorityMap = {
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
            }
            catch (error) {
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
    }
    catch (error) {
        console.error('❌ Chyba pri importe dokumentov:', error);
        throw error;
    }
    finally {
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
