import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validačná schéma pre úpravu publikácie
const updatePublicationSchema = z.object({
  status: z.enum(['SUCCESS', 'FAILED', 'PENDING', 'SCHEDULED']).optional(),
  errorMessage: z.string().optional(),
  externalUrl: z.string().url().optional(),
  metadata: z.any().optional()
});

// GET /api/publicity/publications/[id] - Detail publikácie
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const publication = await prisma.publicityPublication.findUnique({
      where: { id },
      include: {
        content: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            approvals: {
              include: {
                approver: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              },
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    });

    if (!publication) {
      return NextResponse.json(
        { error: 'Publikácia nebola nájdená' },
        { status: 404 }
      );
    }

    // Pridanie dodatočných informácií
    const publicationWithDetails = {
      ...publication,
      platformName: getPlatformName(publication.platform),
      statusText: getStatusText(publication.status),
      timeAgo: getTimeAgo(publication.publishedAt || publication.createdAt),
      canRetry: publication.status === 'FAILED',
      analytics: await getPublicationAnalytics(publication)
    };

    return NextResponse.json(publicationWithDetails);

  } catch (error) {
    console.error('Chyba pri získavaní publikácie:', error);
    return NextResponse.json(
      { error: 'Chyba pri získavaní publikácie' },
      { status: 500 }
    );
  }
}

// PUT /api/publicity/publications/[id] - Úprava publikácie
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updatePublicationSchema.parse(body);

    // Kontrola existencie publikácie
    const existingPublication = await prisma.publicityPublication.findUnique({
      where: { id }
    });

    if (!existingPublication) {
      return NextResponse.json(
        { error: 'Publikácia nebola nájdená' },
        { status: 404 }
      );
    }

    // Aktualizácia publikácie
    const publication = await prisma.publicityPublication.update({
      where: { id },
      data: {
        ...validatedData,
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

    return NextResponse.json(publication);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatné údaje', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Chyba pri úprave publikácie:', error);
    return NextResponse.json(
      { error: 'Chyba pri úprave publikácie' },
      { status: 500 }
    );
  }
}

// DELETE /api/publicity/publications/[id] - Zmazanie publikácie
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Kontrola existencie publikácie
    const existingPublication = await prisma.publicityPublication.findUnique({
      where: { id }
    });

    if (!existingPublication) {
      return NextResponse.json(
        { error: 'Publikácia nebola nájdená' },
        { status: 404 }
      );
    }

    // Zmazanie publikácie
    await prisma.publicityPublication.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Publikácia bola úspešne zmazaná' });

  } catch (error) {
    console.error('Chyba pri mazaní publikácie:', error);
    return NextResponse.json(
      { error: 'Chyba pri mazaní publikácie' },
      { status: 500 }
    );
  }
}

// Pomocné funkcie
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

function getStatusText(status: string): string {
  switch (status) {
    case 'SUCCESS': return 'Úspešné';
    case 'FAILED': return 'Neúspešné';
    case 'PENDING': return 'Čaká';
    case 'SCHEDULED': return 'Naplánované';
    default: return status;
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Práve teraz';
  if (diffMins < 60) return `Pred ${diffMins} min`;
  if (diffHours < 24) return `Pred ${diffHours} h`;
  if (diffDays < 7) return `Pred ${diffDays} dňami`;
  
  return date.toLocaleDateString('sk-SK');
}

// Získanie analytických údajov pre publikáciu
async function getPublicationAnalytics(publication: any) {
  // V reálnej implementácii by tu boli volania na API jednotlivých platforiem
  // pre získanie engagement metrík (likes, shares, comments, views, atď.)
  
  const analytics = {
    views: 0,
    engagement: 0,
    clicks: 0,
    shares: 0,
    comments: 0,
    likes: 0
  };

  // Simulácia analytických údajov na základe platformy a času publikácie
  if (publication.status === 'SUCCESS' && publication.publishedAt) {
    const daysSincePublished = Math.floor(
      (new Date().getTime() - publication.publishedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    switch (publication.platform) {
      case 'WEB':
        analytics.views = Math.floor(Math.random() * 500) + daysSincePublished * 10;
        analytics.clicks = Math.floor(analytics.views * 0.1);
        break;
      case 'FACEBOOK':
        analytics.views = Math.floor(Math.random() * 1000) + daysSincePublished * 20;
        analytics.likes = Math.floor(analytics.views * 0.05);
        analytics.shares = Math.floor(analytics.views * 0.02);
        analytics.comments = Math.floor(analytics.views * 0.01);
        analytics.engagement = analytics.likes + analytics.shares + analytics.comments;
        break;
      case 'WHATSAPP':
        analytics.views = Math.floor(Math.random() * 200) + daysSincePublished * 5;
        analytics.engagement = Math.floor(analytics.views * 0.3); // Vyššia engagement rate
        break;
    }
  }

  return analytics;
}

