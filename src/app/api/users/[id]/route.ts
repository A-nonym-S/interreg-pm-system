import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { UserRole } from '@/types';

// Validation schema for user update
const userUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum([
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.TEAM_MEMBER,
    UserRole.STAKEHOLDER,
    UserRole.GUEST
  ]).optional(),
  avatar: z.string().optional(),
});

// GET /api/users/[id] - Get a user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      include: {
        assignedTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            category: true,
            deadline: true,
          },
        },
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Update a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = userUpdateSchema.parse(body);
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if email is being updated and if it's already in use
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const userWithEmail = await prisma.user.findUnique({
        where: {
          email: validatedData.email,
        },
      });
      
      if (userWithEmail) {
        return NextResponse.json(
          { error: 'Email is already in use' },
          { status: 400 }
        );
      }
    }
    
    // Update the user
    const user = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: validatedData,
    });
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Delete the user
    await prisma.user.delete({
      where: {
        id: params.id,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

