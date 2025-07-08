# Analýza CSV súborov a návrh databázového modelu

## 📊 Analýza projektových úloh (Projektove_ulohy.csv)

### Štruktúra dát:
- **P.č.** - Poradové číslo úlohy (hierarchické: 1, 1.1, 1.1.1, atď.)
- **Typ úlohy** - Kategória úlohy (Publicita a informovanie, Finančné riadenie, atď.)
- **Názov úlohy** - Názov úlohy
- **Detailný popis** - Podrobný popis úlohy
- **Zdroj (dokument, strana)** - Odkaz na zdrojový dokument
- **Priorita** - Vysoká, Stredná, Nízka
- **Opakovanie** - Typ periodicity
- **Začiatok** - Dátum začiatku
- **Ukončenie** - Dátum ukončenia
- **Trvanie** - Trvanie úlohy
- **Zodpovedná osoba** - Zodpovedná osoba/oddelenie
- **Očakávaný výsledok** - Očakávaný výsledok
- **Plní KC?** - Plní kľúčové kritériá (ÁNO/NIE)
- **Poznámky** - Dodatočné poznámky

### Identifikované typy periodicity:
1. **Priebežne** - Kontinuálne počas celého projektu
2. **2x mesačne** - Dvakrát za mesiac (1. a 15. deň)
3. **1x kvartálne** - Raz za štvrťrok
4. **Jednorazovo** - Jednorazová úloha
5. **Podľa potreby** - Nepravidelne, podľa situácie
6. **Periodicky (podľa harmonogramu)** - Podľa špecifického harmonogramu
7. **Počas stavebných prác** - Špecifické obdobie
8. **Po ukončení prác** - Po dokončení prác

### Hierarchická štruktúra úloh:
- Hlavné úlohy: 1, 2, 3, ...
- Podúlohy: 1.1, 1.2, 1.3, ...
- Pod-podúlohy: 1.1.1, 1.1.2, ...

## 📋 Analýza dokumentov (Prehlad_dokumentov.csv)

### Štruktúra dát:
- **Interné P.č.** - Interné poradové číslo
- **Názov dokumentu** - Originálny názov dokumentu
- **Typ úlohy** - Kategória úlohy
- **Priamy zdroj pre úlohu** - Či je dokument zdrojom pre úlohy (ÁNO/NIE)
- **Poznámky** - Dodatočné informácie o duplikátoch a kontexte

### Prepojenie úloh a dokumentov:
- Každá úloha má v poli "Zdroj" odkaz na konkrétny dokument
- Dokumenty sú kategorizované podľa typu úlohy
- Niektoré dokumenty sú duplikáty v rôznych jazykoch

## 🗄️ Návrh databázového modelu

### 1. ProjectTask (Projektové úlohy)
```prisma
model ProjectTask {
  id                String   @id @default(cuid())
  taskNumber        String   @unique // P.č. (1, 1.1, 1.1.1)
  parentId          String?  // Pre hierarchickú štruktúru
  parent            ProjectTask? @relation("TaskHierarchy", fields: [parentId], references: [id])
  children          ProjectTask[] @relation("TaskHierarchy")
  
  taskType          String   // Typ úlohy
  title             String   // Názov úlohy
  description       String   @db.Text // Detailný popis
  source            String   // Zdroj (dokument, strana)
  priority          Priority // Priorita (enum)
  recurrence        Recurrence // Opakovanie (enum)
  startDate         DateTime // Začiatok
  endDate           DateTime? // Ukončenie
  duration          String?  // Trvanie
  responsiblePerson String   // Zodpovedná osoba
  expectedResult    String   @db.Text // Očakávaný výsledok
  fulfillsKC        Boolean  // Plní KC?
  notes             String?  @db.Text // Poznámky
  
  // Prepojenie s dokumentmi
  documentId        String?
  document          ProjectDocument? @relation(fields: [documentId], references: [id])
  
  // Generované podúlohy
  subtasks          ProjectSubtask[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### 2. ProjectDocument (Dokumenty)
```prisma
model ProjectDocument {
  id                String   @id @default(cuid())
  internalNumber    Int      // Interné P.č.
  originalName      String   // Názov dokumentu (originálny)
  taskType          String   // Typ úlohy (hlavná kategória)
  isDirectSource    Boolean  // Priamy zdroj pre úlohu?
  notes             String?  @db.Text // Poznámky
  filePath          String?  // Cesta k súboru (ak je dostupný)
  
  // Prepojené úlohy
  tasks             ProjectTask[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### 3. ProjectSubtask (Podúlohy s termínmi)
```prisma
model ProjectSubtask {
  id                String   @id @default(cuid())
  projectTaskId     String
  projectTask       ProjectTask @relation(fields: [projectTaskId], references: [id], onDelete: Cascade)
  
  title             String   // Názov podúlohy
  dueDate           DateTime // Termín realizácie
  status            SubtaskStatus @default(PENDING) // Stav podúlohy
  notes             String?  @db.Text // Poznámky
  completedAt       DateTime? // Dátum dokončenia
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([projectTaskId, dueDate])
}
```

### 4. Enums
```prisma
enum Priority {
  VYSOKA    // Vysoká
  STREDNA   // Stredná
  NIZKA     // Nízka
}

enum Recurrence {
  PRIEBEZNE           // Priebežne
  DVAKRAT_MESACNE     // 2x mesačne
  KVARTALNE           // 1x kvartálne
  JEDNORAZOVO         // Jednorazovo
  PODLA_POTREBY       // Podľa potreby
  PERIODICKY          // Periodicky (podľa harmonogramu)
  POCAS_STAVBY        // Počas stavebných prác
  PO_UKONCENI         // Po ukončení prác
}

enum SubtaskStatus {
  PENDING     // Čakajúca
  IN_PROGRESS // V procese
  COMPLETED   // Dokončená
  OVERDUE     // Po termíne
}
```

## 🔄 Algoritmus generovania podúloh

### Projekt trvá: 01.01.2025 - 31.12.2026 (24 mesiacov)

### Pravidlá generovania:
1. **2x mesačne**: 1. a 15. deň každého mesiaca
2. **1x kvartálne**: 1. deň každého štvrťroka (január, apríl, júl, október)
3. **Priebežne**: Mesačné kontrolné body (1. deň mesiaca)
4. **Jednorazovo**: Jeden termín podľa špecifikácie
5. **Podľa potreby**: Štvrťročné pripomienky
6. **Periodicky**: Podľa špecifického harmonogramu

### Príklad generovania pre "2x mesačne":
- 01.01.2025, 15.01.2025
- 01.02.2025, 15.02.2025
- 01.03.2025, 15.03.2025
- ... až do 31.12.2026

## 📊 Kanban board organizácia

### Stĺpce podľa periodicity:
1. **Jednorazové úlohy**
2. **Mesačné úlohy** (2x mesačne, priebežne)
3. **Štvrťročné úlohy** (kvartálne)
4. **Podľa potreby**
5. **Dokončené**

### Filtrovanie:
- Podľa typu úlohy
- Podľa priority
- Podľa zodpovednej osoby
- Podľa termínu realizácie

