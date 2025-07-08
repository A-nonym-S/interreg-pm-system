import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { readFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

// Validačná schéma pre úpravu dokumentu
const updateDocumentSchema = z.object({
  documentType: z.enum(['VISUAL_IDENTITY_MANUAL', 'COMMUNICATION_GUIDELINES', 'CHECKLIST', 'TEMPLATE', 'BRAND_MANUAL', 'IMPLEMENTATION_MANUAL', 'OTHER']).optional(),
  language: z.string().optional(),
  version: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  extractedContent: z.string().optional(),
  visualStandards: z.any().optional(),
  checklistItems: z.any().optional()
});

// GET /api/publicity/documents/[id] - Získanie konkrétneho dokumentu
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const document = await prisma.publicityDocument.findUnique({
      where: { id },
      include: {
        checklists: {
          include: {
            _count: {
              select: {
                // Počet použití kontrolného listu
              }
            }
          }
        }
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Dokument nebol nájdený' },
        { status: 404 }
      );
    }

    // Pridanie informácií o súbore
    const fileExists = existsSync(document.filePath);
    const documentWithFileInfo = {
      ...document,
      fileExists,
      downloadUrl: fileExists ? `/api/publicity/documents/${id}/download` : null
    };

    return NextResponse.json(documentWithFileInfo);

  } catch (error) {
    console.error('Chyba pri získavaní dokumentu:', error);
    return NextResponse.json(
      { error: 'Chyba pri získavaní dokumentu' },
      { status: 500 }
    );
  }
}

// PUT /api/publicity/documents/[id] - Úprava dokumentu
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateDocumentSchema.parse(body);

    // Kontrola existencie dokumentu
    const existingDocument = await prisma.publicityDocument.findUnique({
      where: { id }
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Dokument nebol nájdený' },
        { status: 404 }
      );
    }

    // Aktualizácia dokumentu
    const document = await prisma.publicityDocument.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
      include: {
        checklists: true
      }
    });

    return NextResponse.json(document);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatné údaje', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Chyba pri úprave dokumentu:', error);
    return NextResponse.json(
      { error: 'Chyba pri úprave dokumentu' },
      { status: 500 }
    );
  }
}

// DELETE /api/publicity/documents/[id] - Zmazanie dokumentu
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Kontrola existencie dokumentu
    const existingDocument = await prisma.publicityDocument.findUnique({
      where: { id },
      include: {
        checklists: true
      }
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Dokument nebol nájdený' },
        { status: 404 }
      );
    }

    // Kontrola, či dokument nie je používaný
    if (existingDocument.checklists.length > 0) {
      return NextResponse.json(
        { error: 'Nemožno zmazať dokument, ktorý má priradené kontrolné listy' },
        { status: 400 }
      );
    }

    // Zmazanie súboru z disku
    if (existsSync(existingDocument.filePath)) {
      try {
        await unlink(existingDocument.filePath);
      } catch (fileError) {
        console.warn('Chyba pri mazaní súboru z disku:', fileError);
      }
    }

    // Zmazanie z databázy
    await prisma.publicityDocument.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Dokument bol úspešne zmazaný' });

  } catch (error) {
    console.error('Chyba pri mazaní dokumentu:', error);
    return NextResponse.json(
      { error: 'Chyba pri mazaní dokumentu' },
      { status: 500 }
    );
  }
}

