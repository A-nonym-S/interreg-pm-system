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
exports.importProjectTasks = importProjectTasks;
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
        'Vysoká': client_1.TaskPriority.VYSOKA,
        'Stredná': client_1.TaskPriority.STREDNA,
        'Nízka': client_1.TaskPriority.NIZKA
    };
    return priorityMap[priority] || client_1.TaskPriority.STREDNA;
}
function mapRecurrenceToEnum(recurrence) {
    const recurrenceMap = {
        'Priebežne': client_1.TaskRecurrence.PRIEBEZNE,
        'Priebežne (aktualizácia)': client_1.TaskRecurrence.PRIEBEZNE,
        '2x mesačne': client_1.TaskRecurrence.DVAKRAT_MESACNE,
        '1x kvartálne': client_1.TaskRecurrence.KVARTALNE,
        'Jednorazovo': client_1.TaskRecurrence.JEDNORAZOVO,
        'Jednorazovo (nastavenie) + Priebežne': client_1.TaskRecurrence.PRIEBEZNE,
        'Podľa potreby': client_1.TaskRecurrence.PODLA_POTREBY,
        'Periodicky (podľa harmonogramu)': client_1.TaskRecurrence.PERIODICKY,
        'Počas stavebných prác': client_1.TaskRecurrence.POCAS_STAVBY,
        'Po ukončení prác': client_1.TaskRecurrence.PO_UKONCENI
    };
    return recurrenceMap[recurrence] || client_1.TaskRecurrence.PODLA_POTREBY;
}
function parseDate(dateStr) {
    if (!dateStr || dateStr === 'N/A')
        return null;
    // Pokus o parsovanie rôznych formátov dátumu
    const formats = [
        /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
        /^(\d{2})\.(\d{2})\.(\d{4})$/, // DD.MM.YYYY
        /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/ // D.M.YYYY
    ];
    for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
            if (format === formats[0]) {
                // YYYY-MM-DD
                return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
            }
            else {
                // DD.MM.YYYY alebo D.M.YYYY
                return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
            }
        }
    }
    return null;
}
function getParentTaskNumber(taskNumber) {
    const parts = taskNumber.split('.');
    if (parts.length <= 1)
        return null;
    // Odstránime posledný segment pre získanie parent task number
    return parts.slice(0, -1).join('.');
}
async function findDocumentBySource(source) {
    try {
        // Extrakcia názvu dokumentu zo zdroja
        const documentNameMatch = source.match(/^([^(]+)/);
        if (!documentNameMatch)
            return null;
        const documentName = documentNameMatch[1].trim();
        // Hľadanie dokumentu podľa názvu
        const document = await prisma.projectDocument.findFirst({
            where: {
                originalName: {
                    contains: documentName,
                    mode: 'insensitive'
                }
            }
        });
        return document?.id || null;
    }
    catch (error) {
        console.warn(`Nepodarilo sa nájsť dokument pre zdroj: ${source}`);
        return null;
    }
}
async function importProjectTasks() {
    try {
        console.log('🚀 Začínam import projektových úloh...');
        // Načítanie CSV súboru
        const csvPath = path.join(process.cwd(), '..', 'upload', 'Projektove_ulohy.csv');
        if (!fs.existsSync(csvPath)) {
            throw new Error(`CSV súbor nebol nájdený: ${csvPath}`);
        }
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const taskRows = parseCSV(csvContent);
        console.log(`📋 Načítaných ${taskRows.length} úloh z CSV`);
        // Vymazanie existujúcich projektových úloh
        await prisma.projectSubtask.deleteMany();
        await prisma.projectTask.deleteMany();
        console.log('🗑️ Vymazané existujúce projektové úlohy');
        let importedCount = 0;
        let skippedCount = 0;
        const taskMap = new Map(); // taskNumber -> id
        // Prvý prechod - vytvorenie všetkých úloh bez parent referencií
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
                // Hľadanie dokumentu
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
            }
            catch (error) {
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
            }
            catch (error) {
                console.error(`❌ Chyba pri nastavovaní hierarchie pre ${row['P.č.']}:`, error);
            }
        }
        console.log(`\n📊 Súhrn importu projektových úloh:`);
        console.log(`   ✅ Úspešne importované: ${importedCount}`);
        console.log(`   🔗 Hierarchické vzťahy: ${hierarchyCount}`);
        console.log(`   ⚠️ Preskočené: ${skippedCount}`);
        console.log(`   📋 Celkom spracované: ${taskRows.length}`);
        // Zobrazenie štatistík
        const totalTasks = await prisma.projectTask.count();
        const mainTasks = await prisma.projectTask.count({
            where: { parentId: null }
        });
        const subTasks = totalTasks - mainTasks;
        console.log(`\n📈 Štatistiky úloh v databáze:`);
        console.log(`   📋 Celkom úloh: ${totalTasks}`);
        console.log(`   🎯 Hlavné úlohy: ${mainTasks}`);
        console.log(`   📝 Podúlohy: ${subTasks}`);
        // Zobrazenie úloh podľa typu
        const tasksByType = await prisma.projectTask.groupBy({
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
        console.log(`\n📊 Úlohy podľa typu:`);
        tasksByType.forEach(group => {
            console.log(`   ${group.taskType}: ${group._count.id} úloh`);
        });
        // Zobrazenie úloh podľa periodicity
        const tasksByRecurrence = await prisma.projectTask.groupBy({
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
        console.log(`\n🔄 Úlohy podľa periodicity:`);
        tasksByRecurrence.forEach(group => {
            console.log(`   ${group.recurrence}: ${group._count.id} úloh`);
        });
    }
    catch (error) {
        console.error('❌ Chyba pri importe projektových úloh:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
// Spustenie importu
if (require.main === module) {
    importProjectTasks()
        .then(() => {
        console.log('🎉 Import projektových úloh úspešne dokončený!');
        process.exit(0);
    })
        .catch((error) => {
        console.error('💥 Import projektových úloh zlyhal:', error);
        process.exit(1);
    });
}
