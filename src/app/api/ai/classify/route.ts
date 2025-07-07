import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ai } from '@/lib/ai';

// Validation schema for task classification request
const classifyRequestSchema = z.object({
  description: z.string().min(10).max(5000),
});

// POST /api/ai/classify - Classify a task using AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = classifyRequestSchema.parse(body);
    
    // Classify the task
    const classification = await ai.classifyTask(validatedData.description);
    
    return NextResponse.json(classification);
  } catch (error) {
    console.error('Error classifying task:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to classify task' },
      { status: 500 }
    );
  }
}

