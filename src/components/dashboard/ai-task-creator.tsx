"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { TaskCategory, Priority } from '@/types';
import { 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  X
} from 'lucide-react';

interface TaskClassification {
  category: TaskCategory;
  priority: Priority;
  suggestedTitle?: string;
  suggestedDeadline?: string;
  suggestedAssignee?: string;
  confidence: number;
}

// Priority color mapping
const priorityColors = {
  [Priority.LOW]: 'bg-green-500/10 text-green-500 border-green-500/20',
  [Priority.MEDIUM]: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  [Priority.HIGH]: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  [Priority.CRITICAL]: 'bg-red-500/10 text-red-500 border-red-500/20',
};

// Category color mapping
const categoryColors = {
  [TaskCategory.PUBLICITA]: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  [TaskCategory.FINANCIE]: 'bg-green-500/10 text-green-500 border-green-500/20',
  [TaskCategory.REPORTING]: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  [TaskCategory.COMPLIANCE]: 'bg-red-500/10 text-red-500 border-red-500/20',
  [TaskCategory.MONITORING]: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  [TaskCategory.OBSTARAVANIE]: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  [TaskCategory.PARTNERSTVO]: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  [TaskCategory.GENERAL]: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

interface AITaskCreatorProps {
  onTaskCreated?: (task: any) => void;
}

export function AITaskCreator({ onTaskCreated }: AITaskCreatorProps) {
  const [description, setDescription] = useState('');
  const [classification, setClassification] = useState<TaskClassification | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Classify task description using AI
  const classifyTask = async () => {
    if (!description.trim()) {
      setError('Prosím zadajte popis úlohy');
      return;
    }
    
    try {
      setIsClassifying(true);
      setError(null);
      
      const response = await fetch('/api/ai/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });
      
      if (!response.ok) {
        throw new Error('Nepodarilo sa klasifikovať úlohu');
      }
      
      const result = await response.json();
      setClassification(result);
    } catch (error) {
      console.error('Error classifying task:', error);
      setError('Nepodarilo sa klasifikovať úlohu. Skúste to znova neskôr.');
    } finally {
      setIsClassifying(false);
    }
  };
  
  // Create task using agent system
  const createTask = async () => {
    if (!description.trim()) {
      setError('Prosím zadajte popis úlohy');
      return;
    }
    
    try {
      setIsCreating(true);
      setError(null);
      
      const response = await fetch('/api/agent/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          description,
          userId: 'system' // In a real app, use the current user ID
        }),
      });
      
      if (!response.ok) {
        throw new Error('Nepodarilo sa vytvoriť úlohu');
      }
      
      const task = await response.json();
      
      // Reset form
      setDescription('');
      setClassification(null);
      
      // Notify parent component
      if (onTaskCreated) {
        onTaskCreated(task);
      }
      
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Nepodarilo sa vytvoriť úlohu. Skúste to znova neskôr.');
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI-powered Vytvorenie úlohy
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Task description input */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Popis úlohy
          </label>
          <Textarea
            placeholder="Opíšte úlohu, ktorú chcete vytvoriť. AI automaticky klasifikuje kategóriu a prioritu..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {/* Classification result */}
        {classification && (
          <div className="bg-muted/30 border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">AI Klasifikácia</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3" />
                Spoľahlivosť: {Math.round(classification.confidence * 100)}%
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge className={`${categoryColors[classification.category]}`}>
                {classification.category}
              </Badge>
              <Badge className={`${priorityColors[classification.priority]}`}>
                {classification.priority}
              </Badge>
            </div>
            
            {classification.suggestedTitle && (
              <div>
                <span className="text-xs text-muted-foreground">Navrhovaný názov:</span>
                <p className="text-sm font-medium">{classification.suggestedTitle}</p>
              </div>
            )}
            
            {classification.suggestedDeadline && (
              <div>
                <span className="text-xs text-muted-foreground">Navrhovaný deadline:</span>
                <p className="text-sm">{new Date(classification.suggestedDeadline).toLocaleDateString('sk-SK')}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            onClick={classifyTask}
            disabled={isClassifying || !description.trim()}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isClassifying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Klasifikovať
          </Button>
          
          <Button
            onClick={createTask}
            disabled={isCreating || !description.trim()}
            className="flex items-center gap-2"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Vytvoriť úlohu
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

