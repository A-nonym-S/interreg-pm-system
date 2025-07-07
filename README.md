# INTERREG HUSKROUA Project Management System

![INTERREG HUSKROUA](https://github.com/A-nonym-S/interreg-pm-system/raw/main/public/eu-logo.png)

Centralizovaný systém pre riadenie projektov INTERREG HUSKROUA s AI-powered klasifikáciou úloh a compliance monitoringom.

## 🌟 Hlavné funkcie

- **Centralizované riadenie úloh** - správa 37+ úloh v 10 kategóriách
- **AI-powered klasifikácia** - automatická kategorizácia a prioritizácia úloh
- **INTERREG compliance monitoring** - automatické kontroly súladu s pravidlami programu
- **Multi-jazyčná podpora** - SK/EN/HU/UK
- **Moderný tmavý dizajn** - plne responzívny UI s EU compliance
- **Real-time monitoring** - sledovanie pokroku a aktivít v reálnom čase

## 🛠️ Technický stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + PostgreSQL
- **AI**: OpenAI GPT-4 pre klasifikáciu úloh
- **UI**: Moderný tmavý dizajn s EU compliance
- **Deployment**: Vercel/Netlify

## 📋 Štruktúra projektu

```
interreg-pm-system/
├── prisma/               # Databázová schéma a migrácie
├── public/               # Statické súbory
├── scripts/              # Skripty pre testovanie a optimalizáciu
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API Routes
│   │   ├── dashboard/    # Dashboard stránky
│   │   ├── tasks/        # Task management stránky
│   │   ├── compliance/   # Compliance monitoring stránky
│   │   └── ...
│   ├── components/       # React komponenty
│   │   ├── ui/           # UI komponenty
│   │   ├── dashboard/    # Dashboard komponenty
│   │   └── layout/       # Layout komponenty
│   ├── lib/              # Utility funkcie a API klienty
│   └── types/            # TypeScript typy
└── ...
```

## 🚀 Inštalácia a spustenie

### Požiadavky

- Node.js 18+ a npm
- PostgreSQL databáza

### Inštalácia

1. Klonovanie repozitára:
   ```bash
   git clone https://github.com/A-nonym-S/interreg-pm-system.git
   cd interreg-pm-system
   ```

2. Inštalácia závislostí:
   ```bash
   npm install
   ```

3. Konfigurácia prostredia:
   - Vytvorte `.env` súbor podľa `.env.example`
   - Nastavte pripojenie k databáze a API kľúče

4. Inicializácia databázy:
   ```bash
   npx prisma migrate dev
   ```

### Spustenie

1. Vývojový server:
   ```bash
   npm run dev
   ```

2. Produkčný build:
   ```bash
   npm run build
   npm start
   ```

## 🧪 Testovanie

```bash
# Spustenie testov
node scripts/test.js

# Optimalizácia
node scripts/optimize.js
```

## 🌐 Multi-jazyčná podpora

Aplikácia podporuje nasledujúce jazyky:
- 🇸🇰 Slovenčina (predvolený)
- 🇬🇧 Angličtina
- 🇭🇺 Maďarčina
- 🇺🇦 Ukrajinčina

## 📊 INTERREG Compliance

Systém automaticky kontroluje súlad s pravidlami INTERREG programu:
- Vizuálna identita
- Sankčné zoznamy
- GDPR
- Reporting
- Finančné aspekty

## 🤖 AI Klasifikácia

Systém používa OpenAI GPT-4 pre:
- Automatickú klasifikáciu úloh do kategórií
- Určenie priority úloh
- Návrhy priradenia úloh
- Automatické vytvorenie compliance kontrol

## 📱 Responzívny dizajn

Aplikácia je plne responzívna a optimalizovaná pre:
- Desktop počítače
- Tablety
- Mobilné zariadenia

## 📄 Licencia

Tento projekt je licencovaný pod MIT licenciou - pozrite si [LICENSE](LICENSE) súbor pre detaily.

## 🙏 Poďakovanie

Projekt je spolufinancovaný Európskou úniou.

*Tento obsah reprezentuje názory autora. Európska komisia nenesie žiadnu zodpovednosť za použitie informácií, ktoré obsahuje.*

