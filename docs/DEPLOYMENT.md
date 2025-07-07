# Deployment Guide - INTERREG HUSKROUA Project Management System

Tento dokument popisuje proces nasadenia INTERREG HUSKROUA Project Management System do produkčného prostredia.

## Požiadavky

- Node.js 18+ a npm
- PostgreSQL databáza
- Vercel, Netlify alebo iná Next.js kompatibilná platforma
- GitHub účet

## Možnosti nasadenia

### 1. Vercel (odporúčané)

Vercel je najjednoduchší spôsob nasadenia Next.js aplikácií.

#### Kroky:

1. Vytvorte účet na [Vercel](https://vercel.com)
2. Prepojte svoj GitHub účet
3. Importujte repozitár `interreg-pm-system`
4. Nastavte premenné prostredia:
   - `DATABASE_URL` - URL k PostgreSQL databáze
   - `NEXTAUTH_SECRET` - tajný kľúč pre Next-Auth
   - `NEXTAUTH_URL` - URL vašej aplikácie
   - `OPENAI_API_KEY` - API kľúč pre OpenAI (pre AI klasifikáciu)
5. Kliknite na "Deploy"

Vercel automaticky detekuje Next.js projekt a nakonfiguruje build proces.

### 2. Netlify

Netlify je ďalšia populárna platforma pre nasadenie Next.js aplikácií.

#### Kroky:

1. Vytvorte účet na [Netlify](https://netlify.com)
2. Prepojte svoj GitHub účet
3. Importujte repozitár `interreg-pm-system`
4. Nastavte build konfiguráciu:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Nastavte premenné prostredia (rovnaké ako pre Vercel)
6. Kliknite na "Deploy"

### 3. Vlastný server

Pre nasadenie na vlastný server:

#### Kroky:

1. Klonovanie repozitára:
   ```bash
   git clone https://github.com/A-nonym-S/interreg-pm-system.git
   cd interreg-pm-system
   ```

2. Inštalácia závislostí:
   ```bash
   npm install
   ```

3. Vytvorenie produkčného buildu:
   ```bash
   npm run build
   ```

4. Spustenie aplikácie:
   ```bash
   npm start
   ```

5. Použitie process managera (napr. PM2):
   ```bash
   npm install -g pm2
   pm2 start npm --name "interreg-pm" -- start
   ```

## Databáza

### PostgreSQL setup

1. Vytvorte novú PostgreSQL databázu
2. Aplikujte migrácie:
   ```bash
   npx prisma migrate deploy
   ```
3. (Voliteľné) Naplňte databázu testovacími dátami:
   ```bash
   npx prisma db seed
   ```

### Pripojenie k databáze

Aplikácia používa Prisma ORM pre pripojenie k databáze. Nastavte `DATABASE_URL` v `.env` súbore alebo v premenných prostredia:

```
DATABASE_URL="postgresql://username:password@localhost:5432/interreg_db"
```

## Konfigurácia

### Premenné prostredia

Vytvorte `.env` súbor v koreňovom adresári projektu:

```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/interreg_db"

# Next Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# App Config
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## Monitoring a údržba

### Monitoring

Odporúčame použiť nasledujúce nástroje pre monitoring:

- **Vercel Analytics** - pre monitoring výkonu a používania
- **Sentry** - pre sledovanie chýb
- **Uptime Robot** - pre monitoring dostupnosti

### Zálohovanie

Pravidelne zálohujte PostgreSQL databázu:

```bash
pg_dump -U username -d interreg_db > backup_$(date +%Y%m%d).sql
```

### Aktualizácie

Pre aktualizáciu aplikácie:

1. Pull najnovších zmien:
   ```bash
   git pull origin main
   ```

2. Inštalácia závislostí:
   ```bash
   npm install
   ```

3. Aplikovanie migrácií:
   ```bash
   npx prisma migrate deploy
   ```

4. Reštart aplikácie:
   ```bash
   npm run build
   npm start
   ```

## Troubleshooting

### Bežné problémy

1. **Chyba pripojenia k databáze**
   - Skontrolujte `DATABASE_URL` a prístupové údaje
   - Overte, či je PostgreSQL server spustený
   - Skontrolujte firewall nastavenia

2. **Chyba pri buildovaní**
   - Vyčistite cache: `npm run clean`
   - Odstráňte node_modules a znovu nainštalujte: `rm -rf node_modules && npm install`

3. **Chyba pri migrácii databázy**
   - Skontrolujte, či má používateľ dostatočné oprávnenia
   - Skúste resetovať Prisma: `npx prisma migrate reset`

## Kontakt a podpora

Pre pomoc s nasadením kontaktujte:
- Email: support@example.com
- GitHub Issues: https://github.com/A-nonym-S/interreg-pm-system/issues

