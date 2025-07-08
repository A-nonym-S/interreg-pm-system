import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { UserRole } from '@/types';

// Validation schema for user creation
const userCreateSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum([
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.TEAM_MEMBER,
    UserRole.STAKEHOLDER,
    UserRole.GUEST
  ]).default(UserRole.TEAM_MEMBER),
  avatar: z.string().optional(),
});

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const role = searchParams.get('role');
    
    // Build filter object
    const filter: any = {};
    
    if (role) filter.role = role;
    
    // Create mock users if no users exist
    const usersCount = await prisma.user.count();
    
    if (usersCount === 0) {
      await createMockUsers();
    }
    
    const users = await prisma.user.findMany({
      where: filter,
      orderBy: {
        name: 'asc',
      },
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', message: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = userCreateSchema.parse(body);
    
    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Create the user
    const user = await prisma.user.create({
      data: validatedData,
    });
    
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create user', message: (error as Error).message },
      { status: 500 }
    );
  }
}

// Helper function to create mock users for testing
async function createMockUsers() {
  const mockUsers = [
    {
      name: 'Mária Nováková',
      email: 'maria.novakova@example.com',
      role: UserRole.PROJECT_MANAGER,
    },
    {
      name: 'Ján Horváth',
      email: 'jan.horvath@example.com',
      role: UserRole.TEAM_MEMBER,
    },
    {
      name: 'Peter Kováč',
      email: 'peter.kovac@example.com',
      role: UserRole.TEAM_MEMBER,
    },
    {
      name: 'Anna Veselá',
      email: 'anna.vesela@example.com',
      role: UserRole.STAKEHOLDER,
    },
  ];

  for (const user of mockUsers) {
    await prisma.user.create({
      data: user,
    });
  }
}

