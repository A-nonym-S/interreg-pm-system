import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validačná schéma pre opakovanie publikácie
const retryPublicationSchema = z.object({
  publicationId: z.string().min(1, 'Publication ID je povinné'),
  userId: z.string().min(1, 'User ID je povinné')
});

// POST /api/publicity/publications/retry - Opakovanie neúspešnej publikácie
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = retryPublicationSchema.parse(body);

    // Získanie publikácie
    const publication = await prisma.publicityPublication.findUnique({
      where: { id: validatedData.publicationId },
      include: {
        content: true
      }
    });

    if (!publication) {
      return NextResponse.json(
        { error: 'Publikácia nebola nájdená' },
        { status: 404 }
      );
    }

    // Kontrola, či publikácia môže byť opakovaná
    if (publication.status !== 'FAILED') {
      return NextResponse.json(
        { error: 'Môžu byť opakované len neúspešné publikácie' },
        { status: 400 }
      );
    }

    // Kontrola, či obsah je stále schválený
    if (publication.content.status !== 'APPROVED' && publication.content.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Obsah musí byť schválený pre opakovanie publikácie' },
        { status: 400 }
      );
    }

    // Aktualizácia stavu na PENDING
    await prisma.publicityPublication.update({
      where: { id: validatedData.publicationId },
      data: {
        status: 'PENDING',
        errorMessage: null,
        updatedAt: new Date()
      }
    });

    try {
      // Pokus o opätovnú publikáciu
      const publicationResult = await retryPublishToPlatform({
        content: publication.content,
        platform: publication.platform
      });

      // Aktualizácia výsledku
      const updatedPublication = await prisma.publicityPublication.update({
        where: { id: validatedData.publicationId },
        data: {
          status: publicationResult.success ? 'SUCCESS' : 'FAILED',
          publishedAt: publicationResult.success ? new Date() : null,
          externalId: publicationResult.externalId,
          externalUrl: publicationResult.externalUrl,
          errorMessage: publicationResult.error,
          metadata: publicationResult.metadata,
          updatedAt: new Date()
        },
        include: {
          content: {
            select: {
              id: true,
              title: true,
              contentType: true
            }
          }
        }
      });

      // Vytvorenie aktivity
      await prisma.activity.create({
        data: {
          type: publicationResult.success ? 'PUBLICITY_PUBLICATION_RETRY_SUCCESS' : 'PUBLICITY_PUBLICATION_RETRY_FAILED',
          description: `Opakovanie publikácie "${publication.content.title}" na ${getPlatformName(publication.platform)}: ${publicationResult.success ? 'úspešné' : 'neúspešné'}`,
          userId: validatedData.userId
        }
      });

      const response = {
        publication: updatedPublication,
        result: publicationResult,
        message: publicationResult.success 
          ? 'Publikácia bola úspešne opakovaná'
          : 'Opakovanie publikácie bolo neúspešné'
      };

      return NextResponse.json(response, { 
        status: publicationResult.success ? 200 : 400
      });

    } catch (error) {
      // Aktualizácia na FAILED v prípade chyby
      await prisma.publicityPublication.update({
        where: { id: validatedData.publicationId },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Neznáma chyba pri opakovaní',
          updatedAt: new Date()
        }
      });

      throw error;
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatné údaje', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Chyba pri opakovaní publikácie:', error);
    return NextResponse.json(
      { error: 'Chyba pri opakovaní publikácie' },
      { status: 500 }
    );
  }
}

// Pomocná funkcia na opakovanie publikácie na konkrétnu platformu
async function retryPublishToPlatform(params: {
  content: any;
  platform: string;
}) {
  const { content, platform } = params;

  switch (platform) {
    case 'WEB':
      return await retryPublishToWebsite(content);
    case 'FACEBOOK':
      return await retryPublishToFacebook(content);
    case 'WHATSAPP':
      return await retryPublishToWhatsApp(content);
    default:
      throw new Error(`Nepodporovaná platforma: ${platform}`);
  }
}

// Opakovanie publikácie na webovú stránku
async function retryPublishToWebsite(content: any) {
  try {
    // Simulácia API volania s vyššou šancou na úspech pri opakovaní
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // 85% šanca na úspech pri opakovaní
    if (Math.random() < 0.85) {
      return {
        success: true,
        externalId: `web_retry_${Date.now()}`,
        externalUrl: `https://next.huskroua-cbc.eu/news/${content.id}`,
        metadata: {
          publishedAt: new Date().toISOString(),
          platform: 'website',
          retryAttempt: true,
          contentType: content.contentType
        }
      };
    } else {
      return {
        success: false,
        error: 'Dočasná nedostupnosť CMS systému'
      };
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba pri opakovaní publikácie na web'
    };
  }
}

// Opakovanie publikácie na Facebook
async function retryPublishToFacebook(content: any) {
  try {
    // Simulácia Facebook API volania
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    // 80% šanca na úspech pri opakovaní
    if (Math.random() < 0.80) {
      const postId = `${Date.now()}_facebook_retry`;
      
      return {
        success: true,
        externalId: postId,
        externalUrl: `https://facebook.com/interreg.huskroua/posts/${postId}`,
        metadata: {
          publishedAt: new Date().toISOString(),
          platform: 'facebook',
          postType: 'status',
          retryAttempt: true,
          engagement: {
            likes: 0,
            comments: 0,
            shares: 0
          }
        }
      };
    } else {
      return {
        success: false,
        error: 'Facebook API rate limit exceeded'
      };
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba pri opakovaní publikácie na Facebook'
    };
  }
}

// Opakovanie publikácie na WhatsApp
async function retryPublishToWhatsApp(content: any) {
  try {
    // Simulácia WhatsApp API volania
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 90% šanca na úspech pri opakovaní (WhatsApp je zvyčajne spoľahlivejší)
    if (Math.random() < 0.90) {
      const messageId = `wa_retry_${Date.now()}`;
      
      return {
        success: true,
        externalId: messageId,
        metadata: {
          publishedAt: new Date().toISOString(),
          platform: 'whatsapp',
          messageType: 'text',
          retryAttempt: true,
          recipients: ['project_team', 'stakeholders'],
          deliveryStatus: 'sent'
        }
      };
    } else {
      return {
        success: false,
        error: 'WhatsApp Business API nedostupné'
      };
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba pri opakovaní publikácie na WhatsApp'
    };
  }
}

// Pomocná funkcia na získanie názvu platformy
function getPlatformName(platform: string): string {
  switch (platform) {
    case 'WEB': return 'Webová stránka';
    case 'FACEBOOK': return 'Facebook';
    case 'WHATSAPP': return 'WhatsApp';
    case 'LINKEDIN': return 'LinkedIn';
    case 'TWITTER': return 'Twitter';
    case 'INSTAGRAM': return 'Instagram';
    default: return platform;
  }
}

