# Analýza Excel súboru s rozpočtom - HMG+Budget-SK.xlsx

## Prehľad hárov v Excel súbore

### 1. **Budget_SK** (Hlavný rozpočtový hárok)
- **24 riadkov, 14 stĺpcov**
- **Štruktúra:**
  - P.č. - Poradové číslo
  - Rozpočtové položky - Názov položky
  - Project activity - Kód aktivity
  - Aktivity projektu - Popis aktivity v slovenčine
  - Unit - Jednotka merania
  - Počet - Množstvo jednotiek
  - Jednotková cena v EUR - Cena za jednotku
  - Celková cena v EUR - Celková suma
  - Popis - Detailný popis
  - Detail - Ďalšie detaily
  - Cena v EUR finálna - Finálna cena
  - Obdobie 24 mes. - Rozdelenie na 24 mesiacov
  - Poznámka - Dodatočné poznámky

### 2. **Budget_ANJ** (Anglická verzia rozpočtu)
- **11 riadkov, 9 stĺpcov**
- **Štruktúra:**
  - No. - Číslo
  - Budget lines - Rozpočtové riadky
  - Category - Kategória
  - Project activity - Projektová aktivita
  - Unit - Jednotka
  - # of units - Počet jednotiek
  - Unit rate (in EUR) - Jednotková cena
  - Costs (in EUR) - Náklady
  - Description - Popis

### 3. **Zodpovedné osoby** (Roly a zodpovednosti)
- **28 riadkov, 8 stĺpcov**
- **Štruktúra:**
  - P.č. - Poradové číslo
  - Role (pozícia) - Pozícia v projekte
  - Interný (s odôvodnením) - Či je interný pracovník
  - Náplň činností - Popis úloh
  - Požadované kompetencie - Potrebné skúsenosti
  - Súvisiace aktivity - Prepojenie na aktivity
  - Zodpovedná osoba - Meno zodpovednej osoby

### 4. **GANTT** (Časový harmonogram)
- **9 riadkov, 11 stĺpcov**
- Obsahuje časové rozloženie aktivít

### 5. **HMG** (Dodatočné informácie)
- **44 riadkov, 9 stĺpcov**
- Obsahuje ďalšie projektové informácie

### 6. **Hárok1** (Pomocný hárok)
- **14 riadkov, 9 stĺpcov**
- Obsahuje pomocné údaje

## Kľúčové kategórie rozpočtu

### Hlavné kategórie z Budget_SK:
1. **Personálne náklady** - 66,040 EUR (paušálna sadzba 15%)
2. **Kancelárske a administratívne výdavky** - 9,906 EUR (paušálna sadzba 15%)
3. **Cestovanie a ubytovanie** - 9,906 EUR (paušálna sadzba 15%)
4. **Školenia a vzdelávanie:**
   - 4.2.1 Školenie o protokoloch cezhraničného prenosu pacientov - 19,700 EUR
   - 4.2.2 Cezhraničné epidemiologické štúdie - 9,000 EUR
5. **Komunikácia a PR:**
   - 4.6.1 Záverečná tlačová konferencia + prekladateľské služby - 4,000 EUR
   - 4.7.1 Komunikačný balík - 9,500 EUR
6. **Investície do vybavenia:**
   - 5.1.1 Sterilizátor horúcim vzduchom (2 ks) - 7,500 EUR
   - 5.1.2 Parný sterilizátor (1 ks) - 59,000 EUR
   - 5.1.3 Laparoskopická súprava s príslušenstvom - 221,500 EUR

**Celková suma rozpočtu: 416,052 EUR**

## Zodpovedné osoby a roly

### Kľúčové pozície:
1. **Štatutár projektu** - Klára Hencelová
2. **Projektový manažér** - Zuzana Bučeková
3. **Finančný koordinátor** - Peter Hrinda
4. **Koordinátor školení** - Klára Lakatošová
5. **Koordinátor verejného obstarávania** - Zuzana Bučeková, Klára Lakatošová, Peter Hrinda
6. **Interný právnik** - (nie je špecifikovaný)
7. **Odborný koordinátor výskumu** - (nie je špecifikovaný)

## Požiadavky na databázový model

Na základe analýzy Excel súboru je potrebné implementovať:

### 1. **Rozpočtové kategórie:**
- Personálne náklady
- Administratívne výdavky
- Cestovanie
- Školenia a vzdelávanie
- Komunikácia a PR
- Investície do vybavenia

### 2. **Rozpočtové položky s atribútmi:**
- Poradové číslo
- Názov položky
- Kód aktivity
- Jednotka merania
- Počet jednotiek
- Jednotková cena
- Celková cena
- Detailný popis
- Obdobie realizácie
- Poznámky

### 3. **Zodpovedné osoby:**
- Meno a priezvisko
- Pozícia/rola
- Náplň činností
- Kompetencie
- Prepojenie na aktivity

### 4. **Časový harmonogram:**
- Rozloženie aktivít na 24 mesiacov
- Míľniky projektu
- Termíny realizácie

### 5. **Výdavky a schvaľovanie:**
- Prepojenie na rozpočtové položky
- Viacúrovňové schvaľovanie
- Dokumentácia výdavkov
- Sledovanie čerpania rozpočtu

