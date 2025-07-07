import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { agent } from '@/lib/agent';

// Validation schema for agent task creation request
const agentTaskRequestSchema = z.object({
  description: z.string().min(10).max(5000),
  userId: z.string(),
});

// POST /api/agent/task - Create a task using the agent system
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = agentTaskRequestSchema.parse(body);
    
    // Create the task using the agent
    const task = await agent.createTask(
      validatedData.description,
      validatedData.userId
    );
    
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task with agent:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create task with agent' },
      { status: 500 }
    );
  }
}

