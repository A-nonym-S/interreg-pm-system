import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/project-documents - Získanie všetkých projektových dokumentov
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskType = searchParams.get('taskType');
    const isDirectSource = searchParams.get('isDirectSource');
    const includeTasks = searchParams.get('includeTasks') === 'true';

    const where: any = {};
    
    if (taskType) {
      where.taskType = taskType;
    }
    
    if (isDirectSource !== null) {
      where.isDirectSource = isDirectSource === 'true';
    }

    const include: any = {};

    if (includeTasks) {
      include.projectTasks = {
        orderBy: { taskNumber: 'asc' }
      };
    }

    const projectDocuments = await prisma.projectDocument.findMany({
      where,
      include,
      orderBy: [
        { internalNumber: 'asc' }
      ]
    });

    return NextResponse.json(projectDocuments);
  } catch (error) {
    console.error('Error fetching project documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project documents' },
      { status: 500 }
    );
  }
}

// POST /api/project-documents - Vytvorenie nového projektového dokumentu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      internalNumber,
      originalName,
      taskType,
      isDirectSource,
      notes,
      filePath
    } = body;

    // Validácia povinných polí
    if (!internalNumber || !originalName || !taskType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Kontrola, či internalNumber už existuje
    const existingDocument = await prisma.projectDocument.findUnique({
      where: { internalNumber }
    });

    if (existingDocument) {
      return NextResponse.json(
        { error: 'Internal number already exists' },
        { status: 400 }
      );
    }

    const projectDocument = await prisma.projectDocument.create({
      data: {
        internalNumber,
        originalName,
        taskType,
        isDirectSource: isDirectSource || false,
        notes,
        filePath
      },
      include: {
        projectTasks: true
      }
    });

    return NextResponse.json(projectDocument, { status: 201 });
  } catch (error) {
    console.error('Error creating project document:', error);
    return NextResponse.json(
      { error: 'Failed to create project document' },
      { status: 500 }
    );
  }
}

// PUT /api/project-documents/[id] - Aktualizácia projektového dokumentu
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Kontrola, či dokument existuje
    const existingDocument = await prisma.projectDocument.findUnique({
      where: { id }
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Project document not found' },
        { status: 404 }
      );
    }

    const {
      internalNumber,
      originalName,
      taskType,
      isDirectSource,
      notes,
      filePath
    } = body;

    // Ak sa mení internalNumber, skontrolujeme, či už neexistuje
    if (internalNumber && internalNumber !== existingDocument.internalNumber) {
      const duplicateDocument = await prisma.projectDocument.findUnique({
        where: { internalNumber }
      });

      if (duplicateDocument) {
        return NextResponse.json(
          { error: 'Internal number already exists' },
          { status: 400 }
        );
      }
    }

    const updatedDocument = await prisma.projectDocument.update({
      where: { id },
      data: {
        ...(internalNumber && { internalNumber }),
        ...(originalName && { originalName }),
        ...(taskType && { taskType }),
        ...(isDirectSource !== undefined && { isDirectSource }),
        ...(notes !== undefined && { notes }),
        ...(filePath !== undefined && { filePath })
      },
      include: {
        projectTasks: true
      }
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Error updating project document:', error);
    return NextResponse.json(
      { error: 'Failed to update project document' },
      { status: 500 }
    );
  }
}

// DELETE /api/project-documents/[id] - Vymazanie projektového dokumentu
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Kontrola, či dokument existuje
    const existingDocument = await prisma.projectDocument.findUnique({
      where: { id },
      include: {
        projectTasks: true
      }
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Project document not found' },
        { status: 404 }
      );
    }

    // Kontrola, či dokument nie je prepojený s úlohami
    if (existingDocument.projectTasks.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete document that is linked to project tasks' },
        { status: 400 }
      );
    }

    await prisma.projectDocument.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Project document deleted successfully' });
  } catch (error) {
    console.error('Error deleting project document:', error);
    return NextResponse.json(
      { error: 'Failed to delete project document' },
      { status: 500 }
    );
  }
}

