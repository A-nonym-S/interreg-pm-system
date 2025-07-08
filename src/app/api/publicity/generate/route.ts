import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validačná schéma pre generovanie obsahu
const generateContentSchema = z.object({
  prompt: z.string().min(10, 'Prompt musí mať aspoň 10 znakov'),
  contentType: z.enum(['POST', 'NEWS', 'EVENT', 'MILESTONE', 'ANNOUNCEMENT', 'PRESS_RELEASE', 'SOCIAL_MEDIA_POST']),
  platforms: z.array(z.enum(['WEB', 'FACEBOOK', 'WHATSAPP', 'LINKEDIN', 'TWITTER', 'INSTAGRAM'])),
  sourceDocuments: z.array(z.string()).optional().default([]),
  tone: z.enum(['FORMAL', 'INFORMAL', 'PROFESSIONAL', 'FRIENDLY']).default('PROFESSIONAL'),
  language: z.enum(['SK', 'EN']).default('SK'),
  maxLength: z.number().min(50).max(5000).default(500),
  includeImages: z.boolean().default(false),
  userId: z.string().min(1, 'User ID je povinné')
});

// POST /api/publicity/generate - AI generovanie obsahu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = generateContentSchema.parse(body);

    // Kontrola existencie zdrojových dokumentov
    let sourceDocuments = [];
    if (validatedData.sourceDocuments.length > 0) {
      sourceDocuments = await prisma.publicityDocument.findMany({
        where: {
          id: { in: validatedData.sourceDocuments },
          isActive: true
        },
        select: {
          id: true,
          originalName: true,
          extractedContent: true,
          visualStandards: true,
          documentType: true
        }
      });
    }

    // Získanie všetkých aktívnych vizuálnych štandardov
    const visualStandards = await getVisualStandards();

    // Generovanie obsahu pomocou AI
    const startTime = Date.now();
    const generatedContent = await generateContentWithAI({
      prompt: validatedData.prompt,
      contentType: validatedData.contentType,
      platforms: validatedData.platforms,
      sourceDocuments,
      visualStandards,
      tone: validatedData.tone,
      language: validatedData.language,
      maxLength: validatedData.maxLength
    });

    const processingTime = Date.now() - startTime;

    // Kontrola súladu s vizuálnymi štandardmi
    const complianceCheck = await checkCompliance(generatedContent, validatedData.contentType, visualStandards);

    // Uloženie do histórie AI generovaní
    const aiHistory = await prisma.publicityAIHistory.create({
      data: {
        userId: validatedData.userId,
        prompt: validatedData.prompt,
        generatedContent: generatedContent.content,
        usedDocuments: validatedData.sourceDocuments,
        complianceScore: complianceCheck.score,
        contentType: validatedData.contentType,
        platforms: validatedData.platforms,
        processingTime
      }
    });

    // Vytvorenie draft obsahu
    const content = await prisma.publicityContent.create({
      data: {
        title: generatedContent.title,
        content: generatedContent.content,
        contentType: validatedData.contentType,
        platforms: validatedData.platforms,
        status: 'DRAFT',
        aiGenerated: true,
        sourceDocuments: validatedData.sourceDocuments,
        complianceCheck: complianceCheck,
        complianceScore: complianceCheck.score,
        createdBy: validatedData.userId
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Generovanie obrázkov (ak je požadované)
    let images = [];
    if (validatedData.includeImages) {
      images = await generateImagesForContent(content.id, generatedContent.imagePrompts || []);
    }

    const response = {
      content,
      images,
      complianceCheck,
      aiHistory: {
        id: aiHistory.id,
        processingTime
      },
      suggestions: generatedContent.suggestions || []
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatné údaje', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Chyba pri generovaní obsahu:', error);
    return NextResponse.json(
      { error: 'Chyba pri generovaní obsahu' },
      { status: 500 }
    );
  }
}

// Pomocná funkcia na získanie vizuálnych štandardov
async function getVisualStandards() {
  const documents = await prisma.publicityDocument.findMany({
    where: {
      documentType: { in: ['VISUAL_IDENTITY_MANUAL', 'COMMUNICATION_GUIDELINES'] },
      isActive: true,
      visualStandards: { not: null }
    },
    select: {
      visualStandards: true,
      documentType: true
    }
  });

  // Zlúčenie všetkých vizuálnych štandardov
  const mergedStandards = {
    mandatoryElements: [],
    recommendedElements: [],
    disclaimers: {},
    colors: [],
    fonts: [],
    dimensions: {}
  };

  documents.forEach(doc => {
    if (doc.visualStandards) {
      const standards = doc.visualStandards as any;
      if (standards.mandatoryElements) {
        mergedStandards.mandatoryElements.push(...standards.mandatoryElements);
      }
      if (standards.recommendedElements) {
        mergedStandards.recommendedElements.push(...standards.recommendedElements);
      }
      if (standards.disclaimers) {
        Object.assign(mergedStandards.disclaimers, standards.disclaimers);
      }
    }
  });

  return mergedStandards;
}

// Pomocná funkcia na generovanie obsahu pomocou AI
async function generateContentWithAI(params: any) {
  // V reálnej implementácii by tu bola integrácia s OpenAI API alebo iným LLM
  // Pre teraz vrátime simulovaný obsah
  
  const { prompt, contentType, platforms, language, tone, maxLength } = params;
  
  // Základné šablóny pre rôzne typy obsahu
  const templates = {
    POST: {
      title: 'Nový príspevok o projekte INTERREG HUSKROUA',
      content: `Na základe vašej požiadavky: "${prompt}"\n\nVytvorili sme nový príspevok o projekte INTERREG HUSKROUA. Projekt sa zameriava na cezhraničnú spoluprácu medzi Maďarskom, Slovenskom, Rumunskom a Ukrajinou.\n\n✅ Povinné prvky:\n- Logo programu s akronymom projektu\n- Slogan programu\n- Štandardné uznanie financovania EÚ\n\nTáto publikácia bola vytvorená s finančnou podporou Európskej únie. Za jej obsah nesie výhradnú zodpovednosť [meno partnera] a nemusí nevyhnutne odrážať názory Európskej únie.`
    },
    NEWS: {
      title: 'Novinky z projektu INTERREG HUSKROUA',
      content: `TLAČOVÁ SPRÁVA\n\n${prompt}\n\nProjekt INTERREG HUSKROUA pokračuje v realizácii aktivít zameraných na cezhraničnú spoluprácu. Viac informácií nájdete na https://next.huskroua-cbc.eu/\n\nKontakt:\ninfo@next.huskroua-cbc.eu\n\nTáto tlačová správa bola vytvorená s finančnou podporou Európskej únie.`
    },
    EVENT: {
      title: 'Udalosť v rámci projektu INTERREG HUSKROUA',
      content: `POZVÁNKA NA UDALOSŤ\n\n${prompt}\n\nSrdečne vás pozývame na účasť na udalosti organizovanej v rámci projektu INTERREG HUSKROUA.\n\nRegistrácia: [link]\nKontakt: info@next.huskroua-cbc.eu\n\nTáto udalosť je organizovaná s finančnou podporou Európskej únie.`
    }
  };

  const template = templates[contentType as keyof typeof templates] || templates.POST;
  
  return {
    title: template.title,
    content: template.content,
    imagePrompts: [
      'INTERREG HUSKROUA project logo with EU flag',
      'Cross-border cooperation illustration'
    ],
    suggestions: [
      'Pridajte konkrétne dátumy a čísla',
      'Zvážte pridanie citátu od projektového manažéra',
      'Pridajte call-to-action pre čitateľov'
    ]
  };
}

// Pomocná funkcia na kontrolu súladu
async function checkCompliance(content: any, contentType: string, visualStandards: any) {
  const checks = [];
  let score = 0;
  let maxScore = 0;

  // Kontrola povinných prvkov
  const mandatoryElements = [
    'Logo programu',
    'Slogan programu', 
    'Štandardné uznanie financovania'
  ];

  mandatoryElements.forEach(element => {
    maxScore += 20;
    const found = content.content.toLowerCase().includes(element.toLowerCase()) ||
                  content.content.includes('logo') ||
                  content.content.includes('európsk') ||
                  content.content.includes('finančn');
    
    if (found) {
      score += 20;
      checks.push({
        element,
        status: 'COMPLIANT',
        message: `${element} je prítomný v obsahu`
      });
    } else {
      checks.push({
        element,
        status: 'NON_COMPLIANT',
        message: `${element} chýba v obsahu`
      });
    }
  });

  // Kontrola disclaimeru
  maxScore += 40;
  if (content.content.includes('finančn') && content.content.includes('Európsk')) {
    score += 40;
    checks.push({
      element: 'Disclaimer',
      status: 'COMPLIANT',
      message: 'Disclaimer je prítomný'
    });
  } else {
    checks.push({
      element: 'Disclaimer',
      status: 'NON_COMPLIANT',
      message: 'Disclaimer chýba alebo je neúplný'
    });
  }

  const finalScore = maxScore > 0 ? (score / maxScore) * 100 : 0;

  return {
    score: Math.round(finalScore),
    checks,
    status: finalScore >= 80 ? 'COMPLIANT' : finalScore >= 60 ? 'PARTIALLY_COMPLIANT' : 'NON_COMPLIANT',
    recommendations: checks
      .filter(check => check.status === 'NON_COMPLIANT')
      .map(check => `Pridajte: ${check.element}`)
  };
}

// Pomocná funkcia na generovanie obrázkov
async function generateImagesForContent(contentId: string, imagePrompts: string[]) {
  // V reálnej implementácii by tu bola integrácia s DALL-E alebo iným AI generátorom obrázkov
  // Pre teraz vrátime prázdny array
  return [];
}

