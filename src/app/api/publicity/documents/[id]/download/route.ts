import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

// GET /api/publicity/documents/[id]/download - Stiahnutie dokumentu
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Získanie dokumentu z databázy
    const document = await prisma.publicityDocument.findUnique({
      where: { id }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Dokument nebol nájdený' },
        { status: 404 }
      );
    }

    // Kontrola existencie súboru
    if (!existsSync(document.filePath)) {
      return NextResponse.json(
        { error: 'Súbor nebol nájdený na disku' },
        { status: 404 }
      );
    }

    // Čítanie súboru
    const fileBuffer = await readFile(document.filePath);

    // Nastavenie správnych headerov
    const headers = new Headers();
    headers.set('Content-Type', document.fileType);
    headers.set('Content-Disposition', `attachment; filename="${document.originalName}"`);
    headers.set('Content-Length', document.fileSize.toString());

    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Chyba pri sťahovaní dokumentu:', error);
    return NextResponse.json(
      { error: 'Chyba pri sťahovaní dokumentu' },
      { status: 500 }
    );
  }
}

