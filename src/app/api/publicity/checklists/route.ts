import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validačná schéma pre vytvorenie kontrolného listu
const createChecklistSchema = z.object({
  name: z.string().min(1, 'Názov je povinný'),
  description: z.string().optional(),
  contentType: z.enum(['POST', 'NEWS', 'EVENT', 'MILESTONE', 'ANNOUNCEMENT', 'PRESS_RELEASE', 'SOCIAL_MEDIA_POST']),
  items: z.array(z.object({
    id: z.string(),
    text: z.string(),
    required: z.boolean().default(true),
    category: z.string().optional(),
    reference: z.string().optional() // Referencia na VIM, strana, atď.
  })),
  documentId: z.string().optional()
});

// GET /api/publicity/checklists - Zoznam kontrolných listov
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('contentType');
    const documentId = searchParams.get('documentId');
    const isActive = searchParams.get('isActive');

    // Filtrovanie
    const where: any = {};
    if (contentType) where.contentType = contentType;
    if (documentId) where.documentId = documentId;
    if (isActive !== null) where.isActive = isActive === 'true';

    const checklists = await prisma.publicityChecklist.findMany({
      where,
      include: {
        document: {
          select: {
            id: true,
            originalName: true,
            documentType: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Štatistiky
    const stats = await prisma.publicityChecklist.groupBy({
      by: ['contentType'],
      _count: true,
      where: { isActive: true }
    });

    const response = {
      checklists,
      stats: stats.reduce((acc, stat) => {
        acc[stat.contentType] = stat._count;
        return acc;
      }, {} as Record<string, number>)
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Chyba pri získavaní kontrolných listov:', error);
    return NextResponse.json(
      { error: 'Chyba pri získavaní kontrolných listov' },
      { status: 500 }
    );
  }
}

// POST /api/publicity/checklists - Vytvorenie nového kontrolného listu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createChecklistSchema.parse(body);

    // Kontrola existencie dokumentu (ak je zadaný)
    if (validatedData.documentId) {
      const document = await prisma.publicityDocument.findUnique({
        where: { id: validatedData.documentId }
      });

      if (!document) {
        return NextResponse.json(
          { error: 'Dokument nebol nájdený' },
          { status: 404 }
        );
      }
    }

    // Vytvorenie kontrolného listu
    const checklist = await prisma.publicityChecklist.create({
      data: validatedData,
      include: {
        document: {
          select: {
            id: true,
            originalName: true,
            documentType: true
          }
        }
      }
    });

    return NextResponse.json(checklist, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatné údaje', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Chyba pri vytváraní kontrolného listu:', error);
    return NextResponse.json(
      { error: 'Chyba pri vytváraní kontrolného listu' },
      { status: 500 }
    );
  }
}

