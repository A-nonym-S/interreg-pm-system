# Rozpočtový modul - INTERREG HUSKROUA

## Prehľad

Rozpočtový modul je kompletné riešenie pre správu rozpočtov a výdavkov v rámci INTERREG HUSKROUA projektov. Modul umožňuje import rozpočtových dát z Excel súborov, sledovanie čerpania rozpočtu, schvaľovanie výdavkov a generovanie reportov.

## Implementované funkcionality

### 1. Databázový model

#### Nové tabuľky:
- **Budget** - Hlavné rozpočty projektov
- **BudgetPartner** - Partneri v rozpočte
- **BudgetCategory** - Kategórie rozpočtových položiek
- **BudgetItem** - Jednotlivé rozpočtové položky
- **ResponsiblePerson** - Zodpovedné osoby
- **Expense** - Výdavky
- **ExpenseDocument** - Dokumenty k výdavkom
- **ExpenseApproval** - Schvaľovanie výdavkov
- **BudgetImportHistory** - História importov

#### Rozšírené tabuľky:
- **User** - Pridané role pre schvaľovanie
- **Task** - Prepojenie s rozpočtovými položkami
- **Activity** - Nové typy aktivít pre rozpočet

### 2. API Endpoints

#### Rozpočet
- `GET /api/budget` - Zoznam rozpočtov
- `POST /api/budget` - Vytvorenie nového rozpočtu
- `GET /api/budget/[id]` - Detail rozpočtu
- `DELETE /api/budget/[id]` - Zmazanie rozpočtu
- `GET /api/budget/summary` - Súhrny a štatistiky

#### Rozpočtové položky
- `GET /api/budget/items` - Zoznam položiek
- `POST /api/budget/items` - Vytvorenie položky
- `GET /api/budget/items/[id]` - Detail položky
- `PUT /api/budget/items/[id]` - Úprava položky
- `DELETE /api/budget/items/[id]` - Zmazanie položky

#### Výdavky
- `GET /api/expenses` - Zoznam výdavkov
- `POST /api/expenses` - Vytvorenie výdavku
- `GET /api/expenses/pending` - Čakajúce na schválenie
- `POST /api/expenses/[id]/approve` - Schválenie/zamietnutie
- `GET /api/expenses/[id]/approve` - História schvaľovania

### 3. Používateľské rozhranie

#### Stránky:
- `/budget` - Hlavná stránka rozpočtového modulu
- `/expenses` - Správa výdavkov

#### Komponenty:
- Progress bary pre zobrazenie využitia
- Tabs pre organizáciu obsahu
- Filtrovanie a vyhľadávanie
- Responzívny dizajn

## Import dát z Excel

Modul podporuje import rozpočtových dát z Excel súborov s nasledujúcou štruktúrou:

### Hárok "Budget_SK"
- Číslo položky
- Názov položky
- Projektová aktivita
- Popis aktivity
- Jednotka
- Množstvo
- Jednotková cena
- Celková cena
- Kategória
- Poznámky

### Hárok "Zodpovedné_osoby"
- Meno a priezvisko
- Pozícia
- Organizácia
- Email
- Telefón

## Schvaľovací proces

### Úrovne schvaľovania:
1. **TEAM_MEMBER** (úroveň 1) - Základné schvaľovanie
2. **PROJECT_MANAGER** (úroveň 3) - Manažérske schvaľovanie
3. **ADMIN** (úroveň 3) - Administrátorské schvaľovanie

### Pravidlá schvaľovania:
- Výdavok je schválený, ak má aspoň jedno schválenie od úrovne 3
- Ak niekto zamietne, výdavok je automaticky zamietnutý
- Každý používateľ môže schváliť/zamietnuť výdavok len raz

## Štatistiky a reporty

### Prehľady:
- Celkové využitie rozpočtu
- Využitie po kategóriách
- Využitie po partneroch
- Mesačné trendy výdavkov
- Čakajúce výdavky na schválenie

### Indikátory:
- **Zelená** - Normálne využitie (0-80%)
- **Žltá** - Blízko limitu (80-90%)
- **Červená** - Prekročenie limitu (90%+)

## Bezpečnosť

### Validácia:
- Zod schémy pre všetky API endpoints
- Kontrola oprávnení pre schvaľovanie
- Validácia prekročenia rozpočtu

### Audit trail:
- Všetky akcie sú zaznamenané v Activity log
- História schvaľovania výdavkov
- História importov rozpočtových dát

## Technické detaily

### Technológie:
- **Backend**: Next.js API Routes
- **Databáza**: Prisma ORM s SQLite
- **Frontend**: React s TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Validácia**: Zod

### Štruktúra súborov:
```
src/
├── app/
│   ├── api/
│   │   ├── budget/
│   │   └── expenses/
│   ├── budget/
│   └── expenses/
├── components/
│   ├── ui/
│   └── layout/
└── prisma/
    └── schema.prisma
```

## Nasadenie a konfigurácia

### Požiadavky:
- Node.js 18+
- npm alebo yarn
- SQLite databáza

### Inštalácia:
```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Import dát:
```bash
npx tsx scripts/import-budget-data.ts
```

## Budúce rozšírenia

### Plánované funkcie:
- Export do Excel formátu
- Pokročilé reporty s grafmi
- Email notifikácie pre schvaľovanie
- Bulk operácie s výdavkami
- Integrácia s účtovnými systémami
- Mobilná aplikácia

### Optimalizácie:
- Caching pre lepší výkon
- Batch operácie pre veľké dáta
- Real-time aktualizácie
- Pokročilé filtrovanie a vyhľadávanie

## Podpora

Pre technickú podporu a otázky kontaktujte vývojový tím INTERREG HUSKROUA projektu.

---

**Verzia**: 1.0.0  
**Dátum**: 8. júl 2025  
**Autor**: Manus AI Agent

