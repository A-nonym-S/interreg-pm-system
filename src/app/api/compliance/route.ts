import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema for compliance check creation
const complianceCheckSchema = z.object({
  category: z.enum(['VISUAL_IDENTITY', 'SANCTIONS_CHECK', 'GDPR', 'REPORTING', 'FINANCIAL']),
  status: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'PENDING_REVIEW', 'NEEDS_ACTION']),
  description: z.string().optional(),
  details: z.record(z.any()).optional(),
  nextCheck: z.string().optional(),
  taskId: z.string().optional(),
});

// GET /api/compliance - Get all compliance checks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    
    // Build filter object
    const filter: any = {};
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    
    const complianceChecks = await prisma.complianceCheck.findMany({
      where: filter,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            externalId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(complianceChecks);
  } catch (error) {
    console.error('Error fetching compliance checks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance checks' },
      { status: 500 }
    );
  }
}

// POST /api/compliance - Create a new compliance check
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = complianceCheckSchema.parse(body);
    
    // Create the compliance check
    const complianceCheck = await prisma.complianceCheck.create({
      data: {
        ...validatedData,
        nextCheck: validatedData.nextCheck ? new Date(validatedData.nextCheck) : undefined,
        lastCheck: new Date(),
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            externalId: true,
          },
        },
      },
    });
    
    // Create activity record
    await prisma.activity.create({
      data: {
        type: 'COMPLIANCE_CHECK',
        description: `Compliance kontrola '${validatedData.category}' bola vytvorená so statusom '${validatedData.status}'`,
        userId: 'system', // Use actual user ID in production
        taskId: validatedData.taskId,
        metadata: {
          complianceCheckId: complianceCheck.id,
          category: validatedData.category,
          status: validatedData.status,
        },
      },
    });
    
    return NextResponse.json(complianceCheck, { status: 201 });
  } catch (error) {
    console.error('Error creating compliance check:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create compliance check' },
      { status: 500 }
    );
  }
}

