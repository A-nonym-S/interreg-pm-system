import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { ComplianceStatus, ComplianceType } from '@/types';

// Validation schema for compliance check creation
const complianceCheckCreateSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  type: z.enum([
    ComplianceType.VISUAL_IDENTITY,
    ComplianceType.SANCTIONS_LIST,
    ComplianceType.GDPR,
    ComplianceType.PROCUREMENT,
    ComplianceType.FINANCIAL,
    ComplianceType.REPORTING
  ]),
  status: z.enum([
    ComplianceStatus.COMPLIANT,
    ComplianceStatus.NON_COMPLIANT,
    ComplianceStatus.PENDING
  ]).default(ComplianceStatus.PENDING),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});

// GET /api/compliance - Get all compliance checks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const assigneeId = searchParams.get('assigneeId');
    
    // Build filter object
    const filter: any = {};
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (assigneeId) filter.assigneeId = assigneeId;
    
    // Check if we have compliance checks
    const checksCount = await prisma.complianceCheck.count();
    
    if (checksCount === 0) {
      // Create mock compliance checks
      await createMockComplianceChecks();
    }
    
    const checks = await prisma.complianceCheck.findMany({
      where: filter,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(checks);
  } catch (error) {
    console.error('Error fetching compliance checks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance checks', message: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/compliance - Create a new compliance check
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = complianceCheckCreateSchema.parse(body);
    
    // Create the compliance check
    const check = await prisma.complianceCheck.create({
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
    
    // Create activity record
    await prisma.activity.create({
      data: {
        type: 'COMPLIANCE_CHECK',
        description: `Compliance kontrola '${check.title}' bola vytvorená`,
        userId: validatedData.assigneeId || 'system',
      },
    });
    
    return NextResponse.json(check, { status: 201 });
  } catch (error) {
    console.error('Error creating compliance check:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create compliance check', message: (error as Error).message },
      { status: 500 }
    );
  }
}

// Helper function to create mock compliance checks
async function createMockComplianceChecks() {
  // Get users for assignment
  const users = await prisma.user.findMany();
  
  if (users.length === 0) {
    console.error('No users found for compliance check assignment');
    return;
  }
  
  const mockChecks = [
    {
      title: 'Vizuálna identita',
      description: 'Všetky materiály spĺňajú požiadavky INTERREG vizuálnej identity',
      type: ComplianceType.VISUAL_IDENTITY,
      status: ComplianceStatus.COMPLIANT,
      assigneeId: users[0].id,
    },
    {
      title: 'Sankčné zoznamy',
      description: 'Všetci partneri boli skontrolovaní voči sankčným zoznamom EU',
      type: ComplianceType.SANCTIONS_LIST,
      status: ComplianceStatus.COMPLIANT,
      assigneeId: users[1].id,
    },
    {
      title: 'GDPR',
      description: 'Čaká sa na kontrolu GDPR dokumentácie',
      type: ComplianceType.GDPR,
      status: ComplianceStatus.PENDING,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      assigneeId: users[2].id,
    },
  ];
  
  for (const check of mockChecks) {
    const createdCheck = await prisma.complianceCheck.create({
      data: check,
    });
    
    // Create activity for compliance check
    await prisma.activity.create({
      data: {
        type: 'COMPLIANCE_CHECK',
        description: `vytvoril compliance kontrolu '${createdCheck.title}'`,
        userId: check.assigneeId,
      },
    });
  }
}

