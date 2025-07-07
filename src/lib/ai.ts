// src/lib/ai.ts
import { TaskCategory, Priority } from '@/types';

// OpenAI API URL
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Interface for task classification result
export interface TaskClassification {
  category: TaskCategory;
  priority: Priority;
  suggestedTitle?: string;
  suggestedDeadline?: string;
  suggestedAssignee?: string;
  confidence: number;
}

/**
 * Classifies a task based on its description using OpenAI GPT-4
 * @param description The task description to classify
 * @returns Classification result with category, priority, and confidence
 */
export async function classifyTask(description: string): Promise<TaskClassification> {
  try {
    // Check if API key is available
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return fallbackClassification(description);
    }
    
    // Prepare the prompt for OpenAI
    const prompt = `
      Analyze the following task description for an INTERREG HUSKROUA project management system and classify it:
      
      Task description: "${description}"
      
      Provide a JSON response with the following fields:
      1. category: One of [PUBLICITA, FINANCIE, REPORTING, COMPLIANCE, MONITORING, OBSTARAVANIE, PARTNERSTVO, GENERAL]
      2. priority: One of [LOW, MEDIUM, HIGH, CRITICAL]
      3. suggestedTitle: A concise title for this task (optional)
      4. suggestedDeadline: A reasonable deadline for this task in ISO format (optional)
      5. suggestedAssignee: A role that would be appropriate to assign this task to (optional)
      6. confidence: A number between 0 and 1 indicating your confidence in this classification
      
      Base your classification on these guidelines:
      - PUBLICITA: Tasks related to publicity, communication, website updates, social media
      - FINANCIE: Financial tasks, budgeting, payments, financial reporting
      - REPORTING: Progress reports, status updates, documentation for EU
      - COMPLIANCE: Tasks related to ensuring compliance with EU regulations, GDPR, sanctions checks
      - MONITORING: Monitoring project progress, indicators, milestones
      - OBSTARAVANIE: Procurement, tenders, supplier selection
      - PARTNERSTVO: Partner coordination, meetings, agreements
      - GENERAL: General administrative tasks
      
      Priority should be based on:
      - CRITICAL: Legal deadlines, compliance issues, or tasks blocking project progress
      - HIGH: Important tasks with approaching deadlines
      - MEDIUM: Regular tasks with normal deadlines
      - LOW: Tasks that are not time-sensitive
      
      JSON response only, no additional text.
    `;
    
    // Call OpenAI API
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that specializes in project management for EU INTERREG projects. You analyze task descriptions and classify them accurately.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in OpenAI response');
    }
    
    // Parse the JSON response
    try {
      const result = JSON.parse(content);
      
      // Validate the result
      if (!Object.values(TaskCategory).includes(result.category)) {
        result.category = TaskCategory.GENERAL;
      }
      
      if (!Object.values(Priority).includes(result.priority)) {
        result.priority = Priority.MEDIUM;
      }
      
      return result as TaskClassification;
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return fallbackClassification(description);
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return fallbackClassification(description);
  }
}

/**
 * Fallback classification when AI is not available
 * Uses simple keyword matching for basic classification
 */
function fallbackClassification(description: string): TaskClassification {
  const lowerDesc = description.toLowerCase();
  
  // Simple keyword matching for categories
  let category = TaskCategory.GENERAL;
  
  if (lowerDesc.includes('web') || lowerDesc.includes('social') || lowerDesc.includes('komunikácia') || lowerDesc.includes('publicity')) {
    category = TaskCategory.PUBLICITA;
  } else if (lowerDesc.includes('budget') || lowerDesc.includes('finance') || lowerDesc.includes('payment') || lowerDesc.includes('platba')) {
    category = TaskCategory.FINANCIE;
  } else if (lowerDesc.includes('report') || lowerDesc.includes('správa') || lowerDesc.includes('documentation')) {
    category = TaskCategory.REPORTING;
  } else if (lowerDesc.includes('compliance') || lowerDesc.includes('gdpr') || lowerDesc.includes('regulation') || lowerDesc.includes('sanction')) {
    category = TaskCategory.COMPLIANCE;
  } else if (lowerDesc.includes('monitor') || lowerDesc.includes('progress') || lowerDesc.includes('milestone')) {
    category = TaskCategory.MONITORING;
  } else if (lowerDesc.includes('procurement') || lowerDesc.includes('tender') || lowerDesc.includes('supplier') || lowerDesc.includes('obstarávanie')) {
    category = TaskCategory.OBSTARAVANIE;
  } else if (lowerDesc.includes('partner') || lowerDesc.includes('meeting') || lowerDesc.includes('coordination')) {
    category = TaskCategory.PARTNERSTVO;
  }
  
  // Simple keyword matching for priority
  let priority = Priority.MEDIUM;
  
  if (lowerDesc.includes('urgent') || lowerDesc.includes('immediately') || lowerDesc.includes('critical') || lowerDesc.includes('asap')) {
    priority = Priority.CRITICAL;
  } else if (lowerDesc.includes('high') || lowerDesc.includes('important') || lowerDesc.includes('soon')) {
    priority = Priority.HIGH;
  } else if (lowerDesc.includes('low') || lowerDesc.includes('when possible') || lowerDesc.includes('not urgent')) {
    priority = Priority.LOW;
  }
  
  return {
    category,
    priority,
    confidence: 0.6, // Medium confidence for fallback
  };
}

/**
 * Generates a task summary using OpenAI GPT-4
 * @param taskDescription The full task description
 * @returns A concise summary of the task
 */
export async function generateTaskSummary(taskDescription: string): Promise<string> {
  try {
    // Check if API key is available
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return taskDescription.substring(0, 100) + (taskDescription.length > 100 ? '...' : '');
    }
    
    // Prepare the prompt for OpenAI
    const prompt = `
      Summarize the following task description for an INTERREG HUSKROUA project management system:
      
      "${taskDescription}"
      
      Provide a concise summary in 1-2 sentences, maximum 100 characters.
      Response should be in the same language as the original text.
    `;
    
    // Call OpenAI API
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that specializes in summarizing text concisely.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 100,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in OpenAI response');
    }
    
    return content.trim();
  } catch (error) {
    console.error('Error generating task summary:', error);
    return taskDescription.substring(0, 100) + (taskDescription.length > 100 ? '...' : '');
  }
}

// Export the AI module
export const ai = {
  classifyTask,
  generateTaskSummary,
};

