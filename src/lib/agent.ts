// src/lib/agent.ts
import { prisma } from '@/lib/db';
import { ai } from '@/lib/ai';
import { 
  Task, 
  TaskStatus, 
  Priority, 
  TaskCategory, 
  ComplianceCategory,
  ComplianceStatus,
  ActivityType
} from '@/types';

/**
 * Agent system for automating tasks in the INTERREG HUSKROUA Project Management System
 */
export class AgentSystem {
  /**
   * Creates a new task based on AI classification
   * @param description The task description
   * @param userId The ID of the user creating the task
   */
  static async createTask(description: string, userId: string): Promise<Task> {
    try {
      // Classify the task using AI
      const classification = await ai.classifyTask(description);
      
      // Generate a title if not provided
      const title = classification.suggestedTitle || 
        await ai.generateTaskSummary(description);
      
      // Generate external ID
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      
      // Get the count of tasks for this month to generate sequential number
      const tasksThisMonth = await prisma.task.count({
        where: {
          externalId: {
            startsWith: `TASK-${year}-${month}`,
          },
        },
      });
      
      const sequentialNumber = String(tasksThisMonth + 1).padStart(4, '0');
      const externalId = `TASK-${year}-${month}-${sequentialNumber}`;
      
      // Parse deadline if provided
      let deadline = undefined;
      if (classification.suggestedDeadline) {
        try {
          deadline = new Date(classification.suggestedDeadline);
        } catch (error) {
          console.error('Error parsing deadline:', error);
        }
      }
      
      // Create the task
      const task = await prisma.task.create({
        data: {
          title,
          description,
          status: TaskStatus.PENDING,
          priority: classification.priority,
          category: classification.category,
          externalId,
          deadline,
          progress: 0,
        },
        include: {
          assignee: true,
        },
      });
      
      // Create activity record
      await prisma.activity.create({
        data: {
          type: ActivityType.TASK_CREATED,
          description: `AI Agent vytvoril novú úlohu '${task.title}'`,
          userId,
          taskId: task.id,
          metadata: {
            confidence: classification.confidence,
            aiClassified: true,
          },
        },
      });
      
      // Check if compliance-related task
      if (task.category === TaskCategory.COMPLIANCE) {
        await this.createComplianceCheck(task.id, userId);
      }
      
      return task;
    } catch (error) {
      console.error('Error in agent task creation:', error);
      throw error;
    }
  }
  
  /**
   * Creates a compliance check for a task
   * @param taskId The ID of the task
   * @param userId The ID of the user
   */
  static async createComplianceCheck(taskId: string, userId: string) {
    try {
      // Get the task
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });
      
      if (!task) {
        throw new Error('Task not found');
      }
      
      // Determine compliance category based on task description
      let complianceCategory = ComplianceCategory.VISUAL_IDENTITY;
      const description = task.description?.toLowerCase() || '';
      
      if (description.includes('gdpr') || description.includes('osobné údaje') || description.includes('personal data')) {
        complianceCategory = ComplianceCategory.GDPR;
      } else if (description.includes('sankcie') || description.includes('sanctions') || description.includes('blacklist')) {
        complianceCategory = ComplianceCategory.SANCTIONS_CHECK;
      } else if (description.includes('report') || description.includes('správa')) {
        complianceCategory = ComplianceCategory.REPORTING;
      } else if (description.includes('finance') || description.includes('budget') || description.includes('payment')) {
        complianceCategory = ComplianceCategory.FINANCIAL;
      }
      
      // Create compliance check
      const complianceCheck = await prisma.complianceCheck.create({
        data: {
          category: complianceCategory,
          status: ComplianceStatus.PENDING_REVIEW,
          description: `Automaticky vytvorená kontrola pre úlohu: ${task.title}`,
          taskId,
          nextCheck: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      });
      
      // Create activity record
      await prisma.activity.create({
        data: {
          type: ActivityType.COMPLIANCE_CHECK,
          description: `AI Agent vytvoril novú compliance kontrolu '${complianceCategory}'`,
          userId,
          taskId,
          metadata: {
            complianceCheckId: complianceCheck.id,
            category: complianceCategory,
            status: ComplianceStatus.PENDING_REVIEW,
          },
        },
      });
      
      return complianceCheck;
    } catch (error) {
      console.error('Error creating compliance check:', error);
      throw error;
    }
  }
  
  /**
   * Suggests task assignments based on user workload and expertise
   * @param taskId The ID of the task to assign
   */
  static async suggestAssignment(taskId: string): Promise<string[]> {
    try {
      // Get the task
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });
      
      if (!task) {
        throw new Error('Task not found');
      }
      
      // Get all users
      const users = await prisma.user.findMany({
        include: {
          _count: {
            select: {
              assignedTasks: {
                where: {
                  status: {
                    in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS],
                  },
                },
              },
            },
          },
        },
      });
      
      // Calculate user scores based on workload and task category expertise
      const userScores = users.map(user => {
        // Base score - inverse of current workload
        const workloadScore = 10 - Math.min(user._count.assignedTasks, 10);
        
        // Expertise score - based on completed tasks in the same category
        let expertiseScore = 0;
        
        // In a real system, we would analyze past tasks to determine expertise
        // For now, we'll use a simple heuristic based on user role
        if (user.role === 'PROJECT_MANAGER') {
          expertiseScore = 5;
        } else if (user.role === 'ADMIN') {
          expertiseScore = 3;
        } else {
          expertiseScore = 1;
        }
        
        // Total score
        const totalScore = workloadScore + expertiseScore;
        
        return {
          userId: user.id,
          name: user.name,
          score: totalScore,
        };
      });
      
      // Sort by score (descending)
      userScores.sort((a, b) => b.score - a.score);
      
      // Return top 3 user IDs
      return userScores.slice(0, 3).map(user => user.userId);
    } catch (error) {
      console.error('Error suggesting assignment:', error);
      throw error;
    }
  }
  
  /**
   * Monitors tasks for approaching deadlines and sends notifications
   */
  static async monitorDeadlines(): Promise<void> {
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Find tasks with deadlines approaching in the next 24 hours
      const tasks = await prisma.task.findMany({
        where: {
          deadline: {
            gte: today,
            lt: tomorrow,
          },
          status: {
            in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS],
          },
        },
        include: {
          assignee: true,
        },
      });
      
      // Process each task
      for (const task of tasks) {
        // In a real system, we would send notifications to users
        console.log(`Deadline approaching for task: ${task.title}`);
        
        // Create activity record
        await prisma.activity.create({
          data: {
            type: ActivityType.TASK_UPDATED,
            description: `AI Agent upozorňuje na blížiaci sa deadline pre úlohu '${task.title}'`,
            userId: 'system',
            taskId: task.id,
            metadata: {
              deadline: task.deadline,
              status: task.status,
            },
          },
        });
      }
    } catch (error) {
      console.error('Error monitoring deadlines:', error);
      throw error;
    }
  }
  
  /**
   * Performs regular compliance checks
   */
  static async performComplianceChecks(): Promise<void> {
    try {
      const today = new Date();
      
      // Find compliance checks due for review
      const complianceChecks = await prisma.complianceCheck.findMany({
        where: {
          nextCheck: {
            lte: today,
          },
          status: {
            not: ComplianceStatus.COMPLIANT,
          },
        },
        include: {
          task: true,
        },
      });
      
      // Process each compliance check
      for (const check of complianceChecks) {
        console.log(`Compliance check due for: ${check.category}`);
        
        // In a real system, we would perform actual compliance checks
        // For now, we'll just update the next check date
        await prisma.complianceCheck.update({
          where: { id: check.id },
          data: {
            lastCheck: today,
            nextCheck: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          },
        });
        
        // Create activity record
        await prisma.activity.create({
          data: {
            type: ActivityType.COMPLIANCE_CHECK,
            description: `AI Agent vykonal kontrolu compliance '${check.category}'`,
            userId: 'system',
            taskId: check.task?.id,
            metadata: {
              complianceCheckId: check.id,
              category: check.category,
              status: check.status,
            },
          },
        });
      }
    } catch (error) {
      console.error('Error performing compliance checks:', error);
      throw error;
    }
  }
}

// Export the agent system
export const agent = {
  createTask: AgentSystem.createTask,
  createComplianceCheck: AgentSystem.createComplianceCheck,
  suggestAssignment: AgentSystem.suggestAssignment,
  monitorDeadlines: AgentSystem.monitorDeadlines,
  performComplianceChecks: AgentSystem.performComplianceChecks,
};

