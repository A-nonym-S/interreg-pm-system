"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AITaskCreator } from '@/components/dashboard/ai-task-creator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CreateTaskPage() {
  const router = useRouter();
  const [taskCreated, setTaskCreated] = useState(false);
  
  // Handle task creation
  const handleTaskCreated = (task: any) => {
    setTaskCreated(true);
    
    // Redirect to task detail page after a short delay
    setTimeout(() => {
      router.push(`/tasks/${task.id}`);
    }, 1500);
  };
  
  return (
    <div className="space-y-8 pb-10">
      {/* Back button */}
      <div className="flex items-center">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Späť
        </Button>
      </div>
      
      <h1 className="text-3xl font-bold">Vytvoriť novú úlohu</h1>
      
      {/* Success message */}
      {taskCreated && (
        <div className="bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 p-4 rounded-md">
          <p className="font-medium">Úloha bola úspešne vytvorená!</p>
          <p className="text-sm">Presmerovanie na detail úlohy...</p>
        </div>
      )}
      
      {/* AI Task Creator */}
      <div className="max-w-2xl">
        <AITaskCreator onTaskCreated={handleTaskCreated} />
      </div>
      
      {/* Instructions */}
      <div className="max-w-2xl bg-muted/30 border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Ako to funguje?</h2>
        
        <div className="space-y-2">
          <h3 className="font-medium">1. Opíšte úlohu</h3>
          <p className="text-muted-foreground">
            Zadajte detailný popis úlohy. Čím viac informácií poskytnete, tým presnejšie bude AI klasifikácia.
          </p>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">2. AI klasifikácia</h3>
          <p className="text-muted-foreground">
            AI analyzuje popis a automaticky určí kategóriu, prioritu a ďalšie parametre úlohy.
            Môžete si prezrieť klasifikáciu pred vytvorením úlohy.
          </p>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">3. Vytvorenie úlohy</h3>
          <p className="text-muted-foreground">
            Po kliknutí na tlačidlo "Vytvoriť úlohu" sa úloha automaticky vytvorí s parametrami
            určenými AI. Systém tiež automaticky vytvorí príslušné compliance kontroly, ak je to potrebné.
          </p>
        </div>
      </div>
    </div>
  );
}

