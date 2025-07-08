# Modul Publicity a Marketingového Obsahu - INTERREG HUSKROUA

## Prehľad

Kompletný modul pre správu publicity a marketingového obsahu s AI asistentom, ktorý zabezpečí súlad s INTERREG požiadavkami a automatizuje proces tvorby a publikovania obsahu.

## Požiadavky

### Funkcionálne požiadavky
1. **Správa dokumentácie**
   - Upload a analýza 43+ PDF dokumentov
   - Extrakcia vizuálnych štandardov a pravidiel
   - Implementácia kontrolných listov

2. **AI generovanie obsahu**
   - Tvorba príspevkov na základe projektovej dokumentácie
   - Kontrola súladu s vizuálnymi štandardmi
   - Adaptácia obsahu pre rôzne platformy

3. **Workflow schvaľovania**
   - Schvaľovanie používateľom a partnerom
   - Email notifikácie pre partnera
   - Dokumentácia schvaľovacieho procesu

4. **Publikovanie**
   - Automatické publikovanie po schválení
   - Manuálne publikovanie na požiadanie
   - Podpora pre web, Facebook, WhatsApp

### Technické požiadavky
- Integrácia s existujúcim INTERREG PM systémom
- PDF parsing a analýza
- AI/LLM integrácia pre generovanie obsahu
- API integrácie s publikačnými platformami
- Email systém pre notifikácie

## Architektúra modulu

### Databázový model

#### Nové tabuľky:
```sql
-- Projektová dokumentácia
PublicityDocument {
  id: String @id
  filename: String
  originalName: String
  fileType: String
  uploadedAt: DateTime
  processedAt: DateTime?
  extractedContent: String?
  visualStandards: Json?
  checklistItems: Json?
  tags: String[]
}

-- Kontrolné listy
PublicityChecklist {
  id: String @id
  name: String
  description: String
  items: Json // Array of checklist items
  documentId: String?
  isActive: Boolean
}

-- Obsah na publikovanie
PublicityContent {
  id: String @id
  title: String
  content: String
  contentType: PublicityContentType // POST, NEWS, EVENT, MILESTONE
  platforms: PublicityPlatform[] // WEB, FACEBOOK, WHATSAPP
  status: PublicityStatus // DRAFT, PENDING_APPROVAL, APPROVED, PUBLISHED, REJECTED
  createdBy: String
  createdAt: DateTime
  approvedBy: String?
  approvedAt: DateTime?
  publishedAt: DateTime?
  scheduledFor: DateTime?
  
  // AI metadata
  aiGenerated: Boolean
  sourceDocuments: String[] // IDs of source documents
  complianceCheck: Json // Results of compliance checking
  
  // Media
  images: PublicityImage[]
  
  // Relations
  approvals: PublicityApproval[]
  publications: PublicityPublication[]
}

-- Obrázky a média
PublicityImage {
  id: String @id
  filename: String
  originalName: String
  altText: String
  contentId: String
  generatedByAI: Boolean
  complianceChecked: Boolean
}

-- Schvaľovanie
PublicityApproval {
  id: String @id
  contentId: String
  approverId: String
  approverEmail: String
  status: ApprovalStatus // PENDING, APPROVED, REJECTED
  comment: String?
  approvedAt: DateTime?
  emailSent: Boolean
  emailToken: String? // For email-based approval
}

-- Publikovanie
PublicityPublication {
  id: String @id
  contentId: String
  platform: PublicityPlatform
  platformPostId: String?
  publishedAt: DateTime
  status: PublicationStatus // SUCCESS, FAILED, PENDING
  errorMessage: String?
  metrics: Json? // Engagement metrics
}

-- História AI generovaní
PublicityAIHistory {
  id: String @id
  prompt: String
  generatedContent: String
  usedDocuments: String[]
  complianceScore: Float
  createdAt: DateTime
  userId: String
}
```

#### Enums:
```sql
enum PublicityContentType {
  POST
  NEWS
  EVENT
  MILESTONE
  ANNOUNCEMENT
}

enum PublicityPlatform {
  WEB
  FACEBOOK
  WHATSAPP
}

enum PublicityStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  PUBLISHED
  REJECTED
  SCHEDULED
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}

enum PublicationStatus {
  SUCCESS
  FAILED
  PENDING
}
```

### API Endpoints

#### Dokumentácia
- `POST /api/publicity/documents` - Upload PDF dokumentov
- `GET /api/publicity/documents` - Zoznam dokumentov
- `GET /api/publicity/documents/[id]` - Detail dokumentu
- `POST /api/publicity/documents/[id]/process` - Spracovanie dokumentu AI
- `GET /api/publicity/standards` - Extrahované vizuálne štandardy

#### Kontrolné listy
- `GET /api/publicity/checklists` - Zoznam kontrolných listov
- `POST /api/publicity/checklists` - Vytvorenie kontrolného listu
- `GET /api/publicity/checklists/[id]` - Detail kontrolného listu

#### Generovanie obsahu
- `POST /api/publicity/generate` - AI generovanie obsahu
- `POST /api/publicity/generate/ideas` - Generovanie nápadov na obsah
- `POST /api/publicity/compliance-check` - Kontrola súladu

#### Správa obsahu
- `GET /api/publicity/content` - Zoznam obsahu
- `POST /api/publicity/content` - Vytvorenie obsahu
- `GET /api/publicity/content/[id]` - Detail obsahu
- `PUT /api/publicity/content/[id]` - Úprava obsahu
- `DELETE /api/publicity/content/[id]` - Zmazanie obsahu

#### Schvaľovanie
- `POST /api/publicity/content/[id]/submit` - Odoslanie na schválenie
- `POST /api/publicity/content/[id]/approve` - Schválenie obsahu
- `GET /api/publicity/approvals/pending` - Čakajúce schválenia
- `GET /api/publicity/approvals/token/[token]` - Schválenie cez email

#### Publikovanie
- `POST /api/publicity/content/[id]/publish` - Publikovanie obsahu
- `POST /api/publicity/content/[id]/schedule` - Naplánovanie publikovania
- `GET /api/publicity/publications` - História publikovania

### UI Komponenty

#### Stránky:
- `/publicity` - Dashboard modulu publicity
- `/publicity/documents` - Správa dokumentácie
- `/publicity/content` - Správa obsahu
- `/publicity/content/new` - Tvorba nového obsahu
- `/publicity/content/[id]` - Detail/úprava obsahu
- `/publicity/approvals` - Schvaľovanie obsahu
- `/publicity/publications` - História publikovania
- `/publicity/settings` - Nastavenia modulu

#### Komponenty:
- `DocumentUploader` - Upload PDF dokumentov
- `ContentGenerator` - AI generátor obsahu
- `ComplianceChecker` - Kontrola súladu
- `ApprovalWorkflow` - Workflow schvaľovania
- `PublicationScheduler` - Plánovanie publikovania
- `PlatformPreview` - Náhľad pre rôzne platformy

## AI Systém

### Funkcionality:
1. **Analýza dokumentácie**
   - Extrakcia vizuálnych štandardov
   - Identifikácia kontrolných listov
   - Vytvorenie knowledge base

2. **Generovanie obsahu**
   - Tvorba príspevkov na základe témy
   - Adaptácia pre rôzne platformy
   - Dodržanie vizuálnych štandardov

3. **Kontrola súladu**
   - Overenie vizuálnych prvkov
   - Kontrola podľa kontrolných listov
   - Skóre súladu

### Implementácia:
- Použitie OpenAI API alebo lokálneho LLM
- Vector database pre dokumentáciu
- Template systém pre rôzne typy obsahu

## Integrácie

### Facebook API
- Facebook Graph API
- Publikovanie príspevkov
- Upload obrázkov
- Získanie metrík

### WhatsApp Business API
- WhatsApp Business Cloud API
- Odosielanie správ
- Správa kontaktov

### Web publikovanie
- WordPress REST API (ak je web na WP)
- Custom API pre vlastný web
- FTP upload pre statické stránky

### Email systém
- SMTP konfigurácia
- Email templaty
- Tracking otvorení/klikov

## Bezpečnosť

### Autentifikácia a autorizácia
- Role-based access control
- API key management
- Email token validation

### Ochrana dát
- Šifrovanie citlivých údajov
- Audit log všetkých akcií
- Backup dokumentácie

## Implementačný plán

### Fáza 1: Analýza a návrh (aktuálna)
- Analýza projektovej dokumentácie
- Návrh databázového modelu
- Definícia API endpoints

### Fáza 2: Databáza a API
- Rozšírenie Prisma schémy
- Implementácia základných API endpoints
- Upload a správa dokumentov

### Fáza 3: AI systém
- Integrácia AI/LLM
- Analýza dokumentácie
- Generovanie obsahu

### Fáza 4: UI a workflow
- Tvorba UI komponentov
- Implementácia workflow schvaľovania
- Email systém

### Fáza 5: Publikačné integrácie
- Facebook API integrácia
- WhatsApp API integrácia
- Web publikovanie

### Fáza 6: Testovanie a finalizácia
- End-to-end testovanie
- Optimalizácia výkonu
- Dokumentácia

## Metriky úspechu

- Počet úspešne publikovaných príspevkov
- Skóre súladu s vizuálnymi štandardmi
- Čas potrebný na tvorbu obsahu
- Spokojnosť používateľov
- Engagement na sociálnych sieťach

---

**Poznámka**: Tento plán bude upresnený po analýze poskytnutej projektovej dokumentácie.

