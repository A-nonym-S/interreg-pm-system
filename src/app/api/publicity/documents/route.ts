import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

// Validačná schéma pre upload dokumentu
const uploadDocumentSchema = z.object({
  originalName: z.string().min(1, 'Názov súboru je povinný'),
  documentType: z.enum(['VISUAL_IDENTITY_MANUAL', 'COMMUNICATION_GUIDELINES', 'CHECKLIST', 'TEMPLATE', 'BRAND_MANUAL', 'IMPLEMENTATION_MANUAL', 'OTHER']),
  language: z.string().default('SK'),
  version: z.string().optional(),
  tags: z.array(z.string()).default([])
});

// GET /api/publicity/documents - Zoznam publicity dokumentov
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const documentType = searchParams.get('documentType');
    const language = searchParams.get('language');
    const search = searchParams.get('search');
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    // Filtrovanie
    const where: any = {};
    if (documentType) where.documentType = documentType;
    if (language) where.language = language;
    if (isActive !== null) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { extractedContent: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }

    const [documents, total] = await Promise.all([
      prisma.publicityDocument.findMany({
        where,
        include: {
          checklists: {
            select: {
              id: true,
              name: true,
              contentType: true
            }
          }
        },
        orderBy: { uploadedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.publicityDocument.count({ where })
    ]);

    // Štatistiky
    const stats = await prisma.publicityDocument.groupBy({
      by: ['documentType'],
      _count: true,
      where: { isActive: true }
    });

    const response = {
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats.reduce((acc, stat) => {
        acc[stat.documentType] = stat._count;
        return acc;
      }, {} as Record<string, number>)
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Chyba pri získavaní publicity dokumentov:', error);
    return NextResponse.json(
      { error: 'Chyba pri získavaní dokumentov' },
      { status: 500 }
    );
  }
}

// POST /api/publicity/documents - Upload nového dokumentu
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadata = formData.get('metadata') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Súbor je povinný' },
        { status: 400 }
      );
    }

    // Validácia metadát
    let validatedMetadata;
    try {
      const parsedMetadata = JSON.parse(metadata || '{}');
      validatedMetadata = uploadDocumentSchema.parse({
        ...parsedMetadata,
        originalName: file.name
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Neplatné metadáta', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }

    // Kontrola typu súboru
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Nepodporovaný typ súboru. Povolené sú: PDF, DOC, DOCX' },
        { status: 400 }
      );
    }

    // Kontrola veľkosti súboru (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Súbor je príliš veľký. Maximálna veľkosť je 50MB' },
        { status: 400 }
      );
    }

    // Vytvorenie priečinka pre súbory
    const uploadsDir = join(process.cwd(), 'uploads', 'publicity');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generovanie jedinečného názvu súboru
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(uploadsDir, filename);

    // Uloženie súboru
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Uloženie do databázy
    const document = await prisma.publicityDocument.create({
      data: {
        filename,
        originalName: validatedMetadata.originalName,
        fileType: file.type,
        filePath: filePath,
        fileSize: file.size,
        documentType: validatedMetadata.documentType,
        language: validatedMetadata.language,
        version: validatedMetadata.version,
        tags: validatedMetadata.tags
      },
      include: {
        checklists: true
      }
    });

    // Vytvorenie aktivity
    // await prisma.activity.create({
    //   data: {
    //     type: 'PUBLICITY_DOCUMENT_UPLOADED',
    //     description: `Nahraný publicity dokument: ${validatedMetadata.originalName}`,
    //     userId: 'system' // TODO: získať z autentifikácie
    //   }
    // });

    return NextResponse.json(document, { status: 201 });

  } catch (error) {
    console.error('Chyba pri upload dokumentu:', error);
    return NextResponse.json(
      { error: 'Chyba pri nahrávaní dokumentu' },
      { status: 500 }
    );
  }
}

