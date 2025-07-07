import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { agent } from '@/lib/agent';

// Validation schema for agent assignment suggestion request
const assignmentRequestSchema = z.object({
  taskId: z.string(),
});

// POST /api/agent/assign - Suggest task assignments using the agent system
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = assignmentRequestSchema.parse(body);
    
    // Get assignment suggestions
    const suggestions = await agent.suggestAssignment(validatedData.taskId);
    
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error suggesting assignments:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to suggest assignments' },
      { status: 500 }
    );
  }
}

