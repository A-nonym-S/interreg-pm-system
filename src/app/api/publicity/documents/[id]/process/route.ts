import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

// POST /api/publicity/documents/[id]/process - Spracovanie dokumentu AI
export async function POST(
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

    // Kontrola, či dokument už bol spracovaný
    if (document.processedAt) {
      return NextResponse.json(
        { error: 'Dokument už bol spracovaný' },
        { status: 400 }
      );
    }

    // Kontrola existencie súboru
    if (!existsSync(document.filePath)) {
      return NextResponse.json(
        { error: 'Súbor nebol nájdený na disku' },
        { status: 404 }
      );
    }

    // Spracovanie dokumentu podľa typu
    let extractedContent = '';
    let visualStandards = null;
    let checklistItems = null;
    let tags: string[] = [];

    if (document.fileType === 'application/pdf') {
      // Pre PDF súbory - extrakcia textu pomocou pdftotext alebo podobného nástroja
      try {
        // Simulácia extrakcie obsahu - v reálnej implementácii by tu bol PDF parser
        extractedContent = await extractPDFContent(document.filePath);
        
        // Analýza obsahu AI
        const analysis = await analyzeDocumentContent(extractedContent, document.documentType);
        visualStandards = analysis.visualStandards;
        checklistItems = analysis.checklistItems;
        tags = analysis.tags;
        
      } catch (error) {
        console.error('Chyba pri spracovaní PDF:', error);
        return NextResponse.json(
          { error: 'Chyba pri spracovaní PDF súboru' },
          { status: 500 }
        );
      }
    } else {
      // Pre DOC/DOCX súbory
      extractedContent = 'Spracovanie DOC/DOCX súborov bude implementované neskôr';
    }

    // Aktualizácia dokumentu v databáze
    const updatedDocument = await prisma.publicityDocument.update({
      where: { id },
      data: {
        extractedContent,
        visualStandards,
        checklistItems,
        tags,
        processedAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Automatické vytvorenie kontrolných listov na základe extrahovaného obsahu
    if (checklistItems && Array.isArray(checklistItems)) {
      for (const checklist of checklistItems) {
        await prisma.publicityChecklist.create({
          data: {
            name: checklist.name,
            description: checklist.description,
            contentType: checklist.contentType || 'POST',
            items: checklist.items,
            documentId: id
          }
        });
      }
    }

    return NextResponse.json({
      document: updatedDocument,
      message: 'Dokument bol úspešne spracovaný'
    });

  } catch (error) {
    console.error('Chyba pri spracovaní dokumentu:', error);
    return NextResponse.json(
      { error: 'Chyba pri spracovaní dokumentu' },
      { status: 500 }
    );
  }
}

// Pomocná funkcia na extrakciu obsahu z PDF
async function extractPDFContent(filePath: string): Promise<string> {
  // V reálnej implementácii by tu bol PDF parser (pdf-parse, pdf2pic, atď.)
  // Pre teraz vrátime prázdny string
  return '';
}

// Pomocná funkcia na analýzu obsahu AI
async function analyzeDocumentContent(content: string, documentType: string) {
  // V reálnej implementácii by tu bola integrácia s AI/LLM
  // Pre teraz vrátime základnú štruktúru
  
  const analysis = {
    visualStandards: {
      mandatoryElements: [
        'Logo programu s akronymom projektu',
        'Slogan programu',
        'Štandardné uznanie financovania'
      ],
      recommendedElements: [
        'Programový emblém',
        'Logo partnera'
      ],
      colors: [],
      fonts: [],
      dimensions: {}
    },
    checklistItems: [],
    tags: []
  };

  // Základné tagy podľa typu dokumentu
  switch (documentType) {
    case 'VISUAL_IDENTITY_MANUAL':
      analysis.tags = ['vizuálna identita', 'logo', 'farby', 'fonty'];
      break;
    case 'COMMUNICATION_GUIDELINES':
      analysis.tags = ['komunikácia', 'pokyny', 'publicity'];
      break;
    case 'CHECKLIST':
      analysis.tags = ['kontrolný zoznam', 'viditeľnosť'];
      break;
    default:
      analysis.tags = ['dokument'];
  }

  return analysis;
}

