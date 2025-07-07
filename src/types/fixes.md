# TypeScript Opravy

Tento súbor obsahuje zoznam TypeScript chýb, ktoré boli identifikované v aplikácii a potrebujú byť opravené.

## Hlavné problémy

1. **Nekonzistentné enum hodnoty**
   - TaskStatus: Používa sa `PENDING` a `COMPLETED` namiesto `TODO` a `DONE`
   - TaskCategory: Používajú sa lokalizované hodnoty ako `PUBLICITA`, `FINANCIE`, `OBSTARAVANIE`, `PARTNERSTVO`, `GENERAL` namiesto anglických hodnôt

2. **Chýbajúce polia v Task type**
   - Chýbajú polia: `externalId`, `deadline`, `progress`, `estimatedHours`, `actualHours`, `documents`, `activities`
   - Namiesto `dueDate` sa používa `deadline`

3. **Chýbajúce typy**
   - Importuje sa `Priority` namiesto `TaskPriority`

## Riešenie

1. Aktualizovať enum hodnoty v `src/types/index.ts`:

```typescript
export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  BLOCKED = "BLOCKED",
  PENDING = "PENDING",  // Pridané pre spätnú kompatibilitu
  COMPLETED = "COMPLETED",  // Pridané pre spätnú kompatibilitu
  CANCELLED = "CANCELLED"  // Pridané pre spätnú kompatibilitu
}

export enum TaskCategory {
  REPORTING = "REPORTING",
  FINANCIAL = "FINANCIAL",
  TECHNICAL = "TECHNICAL",
  ADMINISTRATIVE = "ADMINISTRATIVE",
  COMPLIANCE = "COMPLIANCE",
  COMMUNICATION = "COMMUNICATION",
  PROCUREMENT = "PROCUREMENT",
  MONITORING = "MONITORING",
  EVALUATION = "EVALUATION",
  OTHER = "OTHER",
  PUBLICITA = "PUBLICITA",  // Pridané pre spätnú kompatibilitu
  FINANCIE = "FINANCIE",  // Pridané pre spätnú kompatibilitu
  OBSTARAVANIE = "OBSTARAVANIE",  // Pridané pre spätnú kompatibilitu
  PARTNERSTVO = "PARTNERSTVO",  // Pridané pre spätnú kompatibilitu
  GENERAL = "GENERAL"  // Pridané pre spätnú kompatibilitu
}

export enum ActivityType {
  TASK_CREATED = "TASK_CREATED",
  TASK_UPDATED = "TASK_UPDATED",
  TASK_COMPLETED = "TASK_COMPLETED",
  TASK_ASSIGNED = "TASK_ASSIGNED",
  COMMENT_ADDED = "COMMENT_ADDED",
  COMPLIANCE_CHECK = "COMPLIANCE_CHECK",
  DOCUMENT_UPLOADED = "DOCUMENT_UPLOADED",  // Pridané pre spätnú kompatibilitu
  STATUS_CHANGED = "STATUS_CHANGED"  // Pridané pre spätnú kompatibilitu
}
```

2. Aktualizovať Task interface v `src/types/index.ts`:

```typescript
export interface Task {
  id: string;
  externalId?: string;  // Pridané pre spätnú kompatibilitu
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  assigneeId?: string;
  assignee?: User;
  createdById: string;
  createdBy?: User;
  dueDate?: string;
  deadline?: string;  // Pridané pre spätnú kompatibilitu
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  attachments?: string[];
  comments?: Comment[];
  progress?: number;  // Pridané pre spätnú kompatibilitu
  estimatedHours?: number;  // Pridané pre spätnú kompatibilitu
  actualHours?: number;  // Pridané pre spätnú kompatibilitu
  documents?: any[];  // Pridané pre spätnú kompatibilitu
  activities?: Activity[];  // Pridané pre spätnú kompatibilitu
}
```

3. Pridať alias pre TaskPriority v `src/types/index.ts`:

```typescript
export type Priority = TaskPriority;  // Alias pre spätnú kompatibilitu
```

4. Opraviť importy v súboroch:
   - Zmeniť `import { Priority } from '@/types';` na `import { TaskPriority } from '@/types';`
   - Alebo pridať alias do importov: `import { TaskPriority as Priority } from '@/types';`

5. Opraviť použitie enum hodnôt v kóde:
   - Zmeniť `TaskStatus.PENDING` na `TaskStatus.TODO`
   - Zmeniť `TaskStatus.COMPLETED` na `TaskStatus.DONE`
   - Atď.

## Ďalšie kroky

1. Implementovať jednotné testy pre kritické komponenty a API routes
2. Pridať end-to-end testy pomocou Cypress alebo Playwright
3. Zabezpečiť dôkladnú validáciu vstupov na všetkých API endpointoch
4. Vylepšiť error handling v celej aplikácii
5. Vytvoriť dokumentáciu API pomocou Swagger alebo podobného nástroja

