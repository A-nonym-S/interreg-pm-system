# API Dokumentácia - INTERREG HUSKROUA Project Management System

Táto dokumentácia popisuje dostupné API endpointy v INTERREG HUSKROUA Project Management System.

## Základné informácie

- **Base URL**: `/api`
- **Formát**: JSON
- **Autentifikácia**: JWT token v hlavičke `Authorization: Bearer <token>`

## Autentifikácia

### Prihlásenie

```
POST /api/auth/login
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "name": "Mária Novák",
      "email": "user@example.com",
      "role": "PROJECT_MANAGER"
    }
  }
}
```

### Odhlásenie

```
POST /api/auth/logout
```

**Response**:
```json
{
  "success": true,
  "message": "Úspešne odhlásený"
}
```

## Úlohy (Tasks)

### Získanie zoznamu úloh

```
GET /api/tasks
```

**Query Parameters**:
- `status` - filtrovanie podľa stavu (TODO, IN_PROGRESS, DONE, BLOCKED)
- `priority` - filtrovanie podľa priority (LOW, MEDIUM, HIGH, URGENT)
- `category` - filtrovanie podľa kategórie
- `assigneeId` - filtrovanie podľa priradeného používateľa
- `search` - vyhľadávanie v názve a popise
- `page` - číslo stránky (predvolené: 1)
- `pageSize` - počet položiek na stránku (predvolené: 10)

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "1",
        "title": "Mesačný report pre INTERREG+",
        "description": "Pripraviť mesačný report pre INTERREG+ program",
        "status": "DONE",
        "priority": "HIGH",
        "category": "REPORTING",
        "assigneeId": "2",
        "assignee": {
          "id": "2",
          "name": "Mária Novák"
        },
        "createdById": "1",
        "dueDate": "2025-07-15T00:00:00Z",
        "createdAt": "2025-07-01T10:00:00Z",
        "updatedAt": "2025-07-05T14:30:00Z"
      }
    ],
    "total": 37,
    "page": 1,
    "pageSize": 10,
    "totalPages": 4
  }
}
```

### Získanie detailu úlohy

```
GET /api/tasks/{id}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Mesačný report pre INTERREG+",
    "description": "Pripraviť mesačný report pre INTERREG+ program",
    "status": "DONE",
    "priority": "HIGH",
    "category": "REPORTING",
    "assigneeId": "2",
    "assignee": {
      "id": "2",
      "name": "Mária Novák",
      "email": "maria.novak@example.com",
      "role": "PROJECT_MANAGER"
    },
    "createdById": "1",
    "createdBy": {
      "id": "1",
      "name": "Admin User"
    },
    "dueDate": "2025-07-15T00:00:00Z",
    "createdAt": "2025-07-01T10:00:00Z",
    "updatedAt": "2025-07-05T14:30:00Z",
    "tags": ["report", "monthly", "interreg"],
    "attachments": ["report.pdf", "data.xlsx"],
    "comments": [
      {
        "id": "1",
        "content": "Report je pripravený na kontrolu",
        "userId": "2",
        "user": {
          "id": "2",
          "name": "Mária Novák"
        },
        "createdAt": "2025-07-03T09:15:00Z"
      }
    ]
  }
}
```

### Vytvorenie úlohy

```
POST /api/tasks
```

**Request Body**:
```json
{
  "title": "Kontrola sankčných zoznamov",
  "description": "Skontrolovať partnerov voči sankčným zoznamom EU",
  "status": "TODO",
  "priority": "HIGH",
  "category": "COMPLIANCE",
  "assigneeId": "2",
  "dueDate": "2025-07-20T00:00:00Z",
  "tags": ["compliance", "sanctions"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "2",
    "title": "Kontrola sankčných zoznamov",
    "description": "Skontrolovať partnerov voči sankčným zoznamom EU",
    "status": "TODO",
    "priority": "HIGH",
    "category": "COMPLIANCE",
    "assigneeId": "2",
    "createdById": "1",
    "dueDate": "2025-07-20T00:00:00Z",
    "createdAt": "2025-07-07T11:30:00Z",
    "updatedAt": "2025-07-07T11:30:00Z",
    "tags": ["compliance", "sanctions"]
  }
}
```

### Aktualizácia úlohy

```
PUT /api/tasks/{id}
```

**Request Body**:
```json
{
  "status": "IN_PROGRESS",
  "priority": "URGENT",
  "assigneeId": "3"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "2",
    "title": "Kontrola sankčných zoznamov",
    "status": "IN_PROGRESS",
    "priority": "URGENT",
    "assigneeId": "3",
    "updatedAt": "2025-07-07T12:15:00Z"
  }
}
```

### Vymazanie úlohy

```
DELETE /api/tasks/{id}
```

**Response**:
```json
{
  "success": true,
  "message": "Úloha bola úspešne vymazaná"
}
```

## Compliance

### Získanie zoznamu compliance kontrol

```
GET /api/compliance
```

**Query Parameters**:
- `category` - filtrovanie podľa kategórie
- `status` - filtrovanie podľa stavu
- `search` - vyhľadávanie v popise
- `page` - číslo stránky (predvolené: 1)
- `pageSize` - počet položiek na stránku (predvolené: 10)

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "1",
        "category": "VISUAL_IDENTITY",
        "status": "COMPLIANT",
        "description": "Všetky materiály spĺňajú požiadavky INTERREG vizuálnej identity",
        "createdAt": "2025-01-01T10:00:00Z",
        "updatedAt": "2025-01-15T14:30:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

### Vytvorenie compliance kontroly

```
POST /api/compliance
```

**Request Body**:
```json
{
  "category": "GDPR",
  "status": "PENDING_REVIEW",
  "description": "Kontrola GDPR dokumentácie"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "6",
    "category": "GDPR",
    "status": "PENDING_REVIEW",
    "description": "Kontrola GDPR dokumentácie",
    "createdAt": "2025-07-07T13:00:00Z",
    "updatedAt": "2025-07-07T13:00:00Z"
  }
}
```

## Používatelia

### Získanie zoznamu používateľov

```
GET /api/users
```

**Query Parameters**:
- `role` - filtrovanie podľa role
- `search` - vyhľadávanie v mene a emaile
- `page` - číslo stránky (predvolené: 1)
- `pageSize` - počet položiek na stránku (predvolené: 10)

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "1",
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "ADMIN",
        "createdAt": "2025-01-01T00:00:00Z"
      },
      {
        "id": "2",
        "name": "Mária Novák",
        "email": "maria.novak@example.com",
        "role": "PROJECT_MANAGER",
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

### Získanie detailu používateľa

```
GET /api/users/{id}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "2",
    "name": "Mária Novák",
    "email": "maria.novak@example.com",
    "role": "PROJECT_MANAGER",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

## Aktivity

### Získanie zoznamu aktivít

```
GET /api/activities
```

**Query Parameters**:
- `type` - filtrovanie podľa typu
- `userId` - filtrovanie podľa používateľa
- `taskId` - filtrovanie podľa úlohy
- `page` - číslo stránky (predvolené: 1)
- `pageSize` - počet položiek na stránku (predvolené: 10)

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "1",
        "type": "TASK_COMPLETED",
        "userId": "2",
        "user": {
          "id": "2",
          "name": "Mária Novák"
        },
        "taskId": "1",
        "task": {
          "id": "1",
          "title": "Mesačný report pre INTERREG+"
        },
        "description": "Mária Novák dokončila úlohu 'Mesačný report pre INTERREG+'",
        "createdAt": "2025-07-05T14:30:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

## AI

### Klasifikácia úlohy

```
POST /api/ai/classify
```

**Request Body**:
```json
{
  "title": "Kontrola sankčných zoznamov",
  "description": "Skontrolovať partnerov voči sankčným zoznamom EU"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "category": "COMPLIANCE",
    "priority": "HIGH",
    "suggestedAssigneeId": "2",
    "confidence": 0.92
  }
}
```

### Sumarizácia úlohy

```
POST /api/ai/summarize
```

**Request Body**:
```json
{
  "taskId": "1"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": "Mesačný report pre INTERREG+ program bol úspešne dokončený a odovzdaný.",
    "keyPoints": [
      "Report obsahuje finančné údaje za jún 2025",
      "Všetky požadované prílohy boli priložené",
      "Report bol schválený projektovým manažérom"
    ],
    "suggestedActions": [
      "Pripraviť report za júl 2025",
      "Aktualizovať finančné údaje"
    ]
  }
}
```

## Chybové kódy

- `400` - Bad Request - neplatné parametre alebo telo požiadavky
- `401` - Unauthorized - chýbajúca alebo neplatná autentifikácia
- `403` - Forbidden - nedostatočné oprávnenia
- `404` - Not Found - požadovaný zdroj nebol nájdený
- `500` - Internal Server Error - interná chyba servera

## Príklad chybovej odpovede

```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Úloha s ID '999' nebola nájdená"
}
```

## Limity API

- Rate limit: 100 požiadaviek za minútu
- Maximálna veľkosť požiadavky: 10MB
- Timeout: 30 sekúnd

## Verzia API

Aktuálna verzia API: v1

