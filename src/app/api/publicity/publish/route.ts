import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validačná schéma pre publikovanie
const publishSchema = z.object({
  contentId: z.string().min(1, 'Content ID je povinné'),
  platforms: z.array(z.enum(['WEB', 'FACEBOOK', 'WHATSAPP', 'LINKEDIN', 'TWITTER', 'INSTAGRAM'])),
  scheduledFor: z.string().datetime().optional(),
  publishNow: z.boolean().default(false),
  userId: z.string().min(1, 'User ID je povinné')
});

// POST /api/publicity/publish - Publikovanie obsahu na platformy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = publishSchema.parse(body);

    // Kontrola existencie obsahu
    const content = await prisma.publicityContent.findUnique({
      where: { id: validatedData.contentId },
      include: {
        approvals: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!content) {
      return NextResponse.json(
        { error: 'Obsah nebol nájdený' },
        { status: 404 }
      );
    }

    // Kontrola, či je obsah schválený
    if (content.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Obsah musí byť schválený pred publikovaním' },
        { status: 400 }
      );
    }

    // Kontrola, či sú platformy povolené pre tento obsah
    const invalidPlatforms = validatedData.platforms.filter(
      platform => !content.platforms.includes(platform)
    );
    
    if (invalidPlatforms.length > 0) {
      return NextResponse.json(
        { error: `Platformy nie sú povolené pre tento obsah: ${invalidPlatforms.join(', ')}` },
        { status: 400 }
      );
    }

    const publications = [];
    const errors = [];

    // Publikovanie na každú platformu
    for (const platform of validatedData.platforms) {
      try {
        const publicationResult = await publishToPlatform({
          content,
          platform,
          scheduledFor: validatedData.scheduledFor,
          publishNow: validatedData.publishNow
        });

        // Uloženie publikácie do databázy
        const publication = await prisma.publicityPublication.create({
          data: {
            contentId: validatedData.contentId,
            platform,
            status: publicationResult.success ? 'SUCCESS' : 'FAILED',
            publishedAt: publicationResult.success ? new Date() : null,
            scheduledFor: validatedData.scheduledFor ? new Date(validatedData.scheduledFor) : null,
            externalId: publicationResult.externalId,
            externalUrl: publicationResult.externalUrl,
            errorMessage: publicationResult.error,
            metadata: publicationResult.metadata
          }
        });

        publications.push({
          ...publication,
          platformName: getPlatformName(platform),
          result: publicationResult
        });

      } catch (error) {
        console.error(`Chyba pri publikovaní na ${platform}:`, error);
        
        // Uloženie neúspešnej publikácie
        const publication = await prisma.publicityPublication.create({
          data: {
            contentId: validatedData.contentId,
            platform,
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Neznáma chyba',
            scheduledFor: validatedData.scheduledFor ? new Date(validatedData.scheduledFor) : null
          }
        });

        errors.push({
          platform,
          error: error instanceof Error ? error.message : 'Neznáma chyba'
        });

        publications.push({
          ...publication,
          platformName: getPlatformName(platform),
          result: { success: false, error: error instanceof Error ? error.message : 'Neznáma chyba' }
        });
      }
    }

    // Aktualizácia stavu obsahu
    const successfulPublications = publications.filter(p => p.status === 'SUCCESS');
    if (successfulPublications.length > 0) {
      await prisma.publicityContent.update({
        where: { id: validatedData.contentId },
        data: {
          status: successfulPublications.length === validatedData.platforms.length ? 'PUBLISHED' : 'PARTIALLY_PUBLISHED',
          publishedAt: new Date()
        }
      });
    }

    // Vytvorenie aktivity
    await prisma.activity.create({
      data: {
        type: 'PUBLICITY_CONTENT_PUBLISHED',
        description: `Publikovaný obsah "${content.title}" na ${successfulPublications.length}/${validatedData.platforms.length} platformách`,
        userId: validatedData.userId
      }
    });

    const response = {
      contentId: validatedData.contentId,
      publications,
      summary: {
        total: validatedData.platforms.length,
        successful: successfulPublications.length,
        failed: publications.length - successfulPublications.length,
        errors
      }
    };

    return NextResponse.json(response, { 
      status: errors.length === 0 ? 200 : 207 // 207 Multi-Status pre čiastočný úspech
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatné údaje', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Chyba pri publikovaní obsahu:', error);
    return NextResponse.json(
      { error: 'Chyba pri publikovaní obsahu' },
      { status: 500 }
    );
  }
}

// Pomocná funkcia na publikovanie na konkrétnu platformu
async function publishToPlatform(params: {
  content: any;
  platform: string;
  scheduledFor?: string;
  publishNow: boolean;
}) {
  const { content, platform, scheduledFor, publishNow } = params;

  switch (platform) {
    case 'WEB':
      return await publishToWebsite(content, scheduledFor, publishNow);
    case 'FACEBOOK':
      return await publishToFacebook(content, scheduledFor, publishNow);
    case 'WHATSAPP':
      return await publishToWhatsApp(content, scheduledFor, publishNow);
    default:
      throw new Error(`Nepodporovaná platforma: ${platform}`);
  }
}

// Publikovanie na webovú stránku
async function publishToWebsite(content: any, scheduledFor?: string, publishNow: boolean = false) {
  try {
    // V reálnej implementácii by tu bola integrácia s CMS alebo API webstránky
    // Pre teraz simulujeme úspešnú publikáciu
    
    if (!publishNow && scheduledFor) {
      // Naplánovanie publikácie
      return {
        success: true,
        scheduled: true,
        externalId: `web_${Date.now()}`,
        externalUrl: `https://next.huskroua-cbc.eu/news/${content.id}`,
        metadata: {
          scheduledFor,
          platform: 'website'
        }
      };
    }

    // Okamžitá publikácia
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulácia API volania

    return {
      success: true,
      externalId: `web_${Date.now()}`,
      externalUrl: `https://next.huskroua-cbc.eu/news/${content.id}`,
      metadata: {
        publishedAt: new Date().toISOString(),
        platform: 'website',
        contentType: content.contentType
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba pri publikovaní na web'
    };
  }
}

// Publikovanie na Facebook
async function publishToFacebook(content: any, scheduledFor?: string, publishNow: boolean = false) {
  try {
    // V reálnej implementácii by tu bola integrácia s Facebook Graph API
    // Potrebné by boli access tokeny a page ID
    
    if (!publishNow && scheduledFor) {
      // Facebook podporuje naplánovanie príspevkov
      return {
        success: true,
        scheduled: true,
        externalId: `fb_scheduled_${Date.now()}`,
        metadata: {
          scheduledFor,
          platform: 'facebook'
        }
      };
    }

    // Simulácia Facebook API volania
    await new Promise(resolve => setTimeout(resolve, 1500));

    const postId = `${Date.now()}_facebook_post`;
    
    return {
      success: true,
      externalId: postId,
      externalUrl: `https://facebook.com/interreg.huskroua/posts/${postId}`,
      metadata: {
        publishedAt: new Date().toISOString(),
        platform: 'facebook',
        postType: 'status',
        engagement: {
          likes: 0,
          comments: 0,
          shares: 0
        }
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba pri publikovaní na Facebook'
    };
  }
}

// Publikovanie na WhatsApp
async function publishToWhatsApp(content: any, scheduledFor?: string, publishNow: boolean = false) {
  try {
    // V reálnej implementácii by tu bola integrácia s WhatsApp Business API
    // Alebo WhatsApp Web API pre automatické odosielanie
    
    if (!publishNow && scheduledFor) {
      // WhatsApp nepodporuje natívne naplánovanie, ale môžeme to simulovať
      return {
        success: true,
        scheduled: true,
        externalId: `wa_scheduled_${Date.now()}`,
        metadata: {
          scheduledFor,
          platform: 'whatsapp',
          note: 'Bude odoslané manuálne v naplánovanom čase'
        }
      };
    }

    // Simulácia WhatsApp API volania
    await new Promise(resolve => setTimeout(resolve, 800));

    const messageId = `wa_${Date.now()}`;
    
    return {
      success: true,
      externalId: messageId,
      metadata: {
        publishedAt: new Date().toISOString(),
        platform: 'whatsapp',
        messageType: 'text',
        recipients: ['project_team', 'stakeholders'], // Zoznamy príjemcov
        deliveryStatus: 'sent'
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba pri publikovaní na WhatsApp'
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

