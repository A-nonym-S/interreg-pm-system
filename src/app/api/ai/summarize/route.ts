import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ai } from '@/lib/ai';

// Validation schema for task summarization request
const summarizeRequestSchema = z.object({
  description: z.string().min(10).max(5000),
});

// POST /api/ai/summarize - Summarize a task description using AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = summarizeRequestSchema.parse(body);
    
    // Generate summary
    const summary = await ai.generateTaskSummary(validatedData.description);
    
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error summarizing task:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to summarize task' },
      { status: 500 }
    );
  }
}

