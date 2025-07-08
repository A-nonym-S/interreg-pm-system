import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validačná schéma pre kontrolu súladu
const complianceCheckSchema = z.object({
  contentId: z.string().optional(),
  title: z.string().optional(),
  content: z.string().min(1, 'Obsah je povinný'),
  contentType: z.enum(['POST', 'NEWS', 'EVENT', 'MILESTONE', 'ANNOUNCEMENT', 'PRESS_RELEASE', 'SOCIAL_MEDIA_POST']),
  platforms: z.array(z.enum(['WEB', 'FACEBOOK', 'WHATSAPP', 'LINKEDIN', 'TWITTER', 'INSTAGRAM'])),
  checklistIds: z.array(z.string()).optional().default([]),
  userId: z.string().min(1, 'User ID je povinné')
});

// POST /api/publicity/compliance-check - Kontrola súladu obsahu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = complianceCheckSchema.parse(body);

    // Získanie relevantných kontrolných listov
    let checklists = [];
    if (validatedData.checklistIds.length > 0) {
      checklists = await prisma.publicityChecklist.findMany({
        where: {
          id: { in: validatedData.checklistIds },
          isActive: true
        }
      });
    } else {
      // Automatické získanie kontrolných listov pre daný typ obsahu
      checklists = await prisma.publicityChecklist.findMany({
        where: {
          contentType: validatedData.contentType,
          isActive: true
        }
      });
    }

    // Získanie vizuálnych štandardov
    const visualStandards = await getVisualStandards();

    // Vykonanie kontroly súladu
    const complianceResult = await performComplianceCheck({
      title: validatedData.title || '',
      content: validatedData.content,
      contentType: validatedData.contentType,
      platforms: validatedData.platforms,
      checklists,
      visualStandards
    });

    // Uloženie výsledku kontroly (ak je zadané contentId)
    if (validatedData.contentId) {
      await prisma.publicityContent.update({
        where: { id: validatedData.contentId },
        data: {
          complianceCheck: complianceResult,
          complianceScore: complianceResult.overallScore
        }
      });

      // Vytvorenie aktivity
      await prisma.activity.create({
        data: {
          type: 'PUBLICITY_COMPLIANCE_CHECK',
          description: `Kontrola súladu pre obsah: ${validatedData.title || 'Bez názvu'} (skóre: ${complianceResult.overallScore}%)`,
          userId: validatedData.userId
        }
      });
    }

    return NextResponse.json(complianceResult);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatné údaje', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Chyba pri kontrole súladu:', error);
    return NextResponse.json(
      { error: 'Chyba pri kontrole súladu' },
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
      documentType: true,
      originalName: true
    }
  });

  return {
    documents: documents.map(doc => ({
      name: doc.originalName,
      type: doc.documentType,
      standards: doc.visualStandards
    })),
    mandatoryElements: [
      {
        id: 'programme_logo',
        name: 'Logo programu s akronymom projektu',
        required: true,
        reference: 'VIM, časť 1, strana 21',
        keywords: ['logo', 'program', 'akronym', 'projekt']
      },
      {
        id: 'programme_slogan',
        name: 'Slogan programu',
        required: true,
        reference: 'VIM, časť 9, strana 18',
        keywords: ['slogan', 'program']
      },
      {
        id: 'funding_acknowledgment',
        name: 'Štandardné uznanie financovania',
        required: true,
        reference: 'Príručka informácií a publicity',
        keywords: ['finančn', 'podpor', 'európsk', 'úni']
      }
    ],
    disclaimers: {
      SK: {
        publication: 'Táto publikácia bola vytvorená s finančnou podporou Európskej únie. Za jej obsah nesie výhradnú zodpovednosť [meno autora/partnera] a nemusí nevyhnutne odrážať názory Európskej únie.',
        website: 'Táto webová stránka bola vytvorená a udržiavaná s finančnou podporou Európskej únie. Za jej obsah nesie výhradnú zodpovednosť [meno autora/partnera] a nemusí nevyhnutne odrážať názory Európskej únie.'
      },
      EN: {
        publication: 'This publication was created with the financial support of the European Union. [Author/partner name] is solely responsible for its content and it does not necessarily reflect the views of the European Union.',
        website: 'This website was created and maintained with the financial support of the European Union. [Author/partner name] is solely responsible for its content and it does not necessarily reflect the views of the European Union.'
      }
    }
  };
}

// Hlavná funkcia na kontrolu súladu
async function performComplianceCheck(params: any) {
  const { title, content, contentType, platforms, checklists, visualStandards } = params;
  
  const results = {
    overallScore: 0,
    status: 'NON_COMPLIANT',
    checks: [] as any[],
    recommendations: [] as string[],
    criticalIssues: [] as string[],
    warnings: [] as string[],
    summary: {
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      criticalFailures: 0
    }
  };

  let totalScore = 0;
  let maxScore = 0;

  // 1. Kontrola povinných vizuálnych prvkov
  for (const element of visualStandards.mandatoryElements) {
    maxScore += element.required ? 25 : 10;
    const found = checkElementPresence(content, element.keywords);
    
    if (found) {
      totalScore += element.required ? 25 : 10;
      results.checks.push({
        category: 'Vizuálne prvky',
        element: element.name,
        status: 'PASSED',
        score: element.required ? 25 : 10,
        message: `${element.name} je prítomný v obsahu`,
        reference: element.reference
      });
    } else {
      results.checks.push({
        category: 'Vizuálne prvky',
        element: element.name,
        status: 'FAILED',
        score: 0,
        message: `${element.name} chýba v obsahu`,
        reference: element.reference
      });
      
      if (element.required) {
        results.criticalIssues.push(`Chýba povinný prvok: ${element.name}`);
        results.recommendations.push(`Pridajte ${element.name} podľa ${element.reference}`);
      } else {
        results.warnings.push(`Odporúčame pridať: ${element.name}`);
      }
    }
  }

  // 2. Kontrola disclaimeru
  maxScore += 30;
  const disclaimerCheck = checkDisclaimer(content, contentType, platforms);
  if (disclaimerCheck.found) {
    totalScore += 30;
    results.checks.push({
      category: 'Disclaimer',
      element: 'Štandardný disclaimer',
      status: 'PASSED',
      score: 30,
      message: disclaimerCheck.message,
      foundText: disclaimerCheck.foundText
    });
  } else {
    results.checks.push({
      category: 'Disclaimer',
      element: 'Štandardný disclaimer',
      status: 'FAILED',
      score: 0,
      message: disclaimerCheck.message,
      suggestedText: disclaimerCheck.suggestedText
    });
    results.criticalIssues.push('Chýba povinný disclaimer');
    results.recommendations.push('Pridajte štandardný disclaimer podľa typu obsahu');
  }

  // 3. Kontrola špecifických kontrolných listov
  for (const checklist of checklists) {
    const checklistItems = checklist.items as any[];
    for (const item of checklistItems) {
      maxScore += item.required ? 15 : 5;
      const itemCheck = checkChecklistItem(content, item);
      
      if (itemCheck.passed) {
        totalScore += item.required ? 15 : 5;
        results.checks.push({
          category: checklist.name,
          element: item.text,
          status: 'PASSED',
          score: item.required ? 15 : 5,
          message: itemCheck.message
        });
      } else {
        results.checks.push({
          category: checklist.name,
          element: item.text,
          status: 'FAILED',
          score: 0,
          message: itemCheck.message
        });
        
        if (item.required) {
          results.criticalIssues.push(`Kontrolný list: ${item.text}`);
        } else {
          results.warnings.push(`Kontrolný list: ${item.text}`);
        }
      }
    }
  }

  // 4. Výpočet celkového skóre
  results.overallScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  
  // 5. Určenie celkového stavu
  if (results.overallScore >= 90 && results.criticalIssues.length === 0) {
    results.status = 'COMPLIANT';
  } else if (results.overallScore >= 70 && results.criticalIssues.length <= 1) {
    results.status = 'PARTIALLY_COMPLIANT';
  } else {
    results.status = 'NON_COMPLIANT';
  }

  // 6. Súhrn
  results.summary = {
    totalChecks: results.checks.length,
    passedChecks: results.checks.filter(c => c.status === 'PASSED').length,
    failedChecks: results.checks.filter(c => c.status === 'FAILED').length,
    criticalFailures: results.criticalIssues.length
  };

  return results;
}

// Pomocné funkcie
function checkElementPresence(content: string, keywords: string[]): boolean {
  const lowerContent = content.toLowerCase();
  return keywords.some(keyword => lowerContent.includes(keyword.toLowerCase()));
}

function checkDisclaimer(content: string, contentType: string, platforms: string[]) {
  const lowerContent = content.toLowerCase();
  
  // Kľúčové slová pre disclaimer
  const disclaimerKeywords = ['finančn', 'podpor', 'európsk', 'úni', 'zodpovednosť'];
  const foundKeywords = disclaimerKeywords.filter(keyword => 
    lowerContent.includes(keyword)
  );

  if (foundKeywords.length >= 3) {
    return {
      found: true,
      message: 'Disclaimer je prítomný v obsahu',
      foundText: 'Nájdené kľúčové slová disclaimeru'
    };
  }

  // Navrhnutý disclaimer podľa typu obsahu a platformy
  let suggestedText = '';
  if (platforms.includes('WEB')) {
    suggestedText = 'Táto webová stránka bola vytvorená a udržiavaná s finančnou podporou Európskej únie...';
  } else {
    suggestedText = 'Táto publikácia bola vytvorená s finančnou podporou Európskej únie...';
  }

  return {
    found: false,
    message: 'Disclaimer chýba alebo je neúplný',
    suggestedText
  };
}

function checkChecklistItem(content: string, item: any) {
  // Základná kontrola prítomnosti textu
  const lowerContent = content.toLowerCase();
  const lowerItemText = item.text.toLowerCase();
  
  // Jednoduché hľadanie kľúčových slov
  const keywords = lowerItemText.split(' ').filter(word => word.length > 3);
  const foundKeywords = keywords.filter(keyword => 
    lowerContent.includes(keyword)
  );

  const passed = foundKeywords.length > 0;
  
  return {
    passed,
    message: passed 
      ? `Kontrolný bod splnený: ${item.text}`
      : `Kontrolný bod nesplnený: ${item.text}`
  };
}

