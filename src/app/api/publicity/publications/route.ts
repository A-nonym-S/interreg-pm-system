import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validačná schéma pre filtrovanie publikácií
const publicationsQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 20).optional(),
  platform: z.string().optional(),
  status: z.string().optional(),
  contentId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional()
});

// GET /api/publicity/publications - Zoznam publikácií
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = publicationsQuerySchema.parse(Object.fromEntries(searchParams));
    
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Filtrovanie
    const where: any = {};
    if (query.platform) where.platform = query.platform;
    if (query.status) where.status = query.status;
    if (query.contentId) where.contentId = query.contentId;
    
    if (query.dateFrom || query.dateTo) {
      where.publishedAt = {};
      if (query.dateFrom) where.publishedAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.publishedAt.lte = new Date(query.dateTo);
    }

    const [publications, total] = await Promise.all([
      prisma.publicityPublication.findMany({
        where,
        include: {
          content: {
            select: {
              id: true,
              title: true,
              contentType: true,
              creator: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.publicityPublication.count({ where })
    ]);

    // Štatistiky
    const stats = await Promise.all([
      prisma.publicityPublication.groupBy({
        by: ['platform'],
        _count: true,
        where: { status: 'SUCCESS' }
      }),
      prisma.publicityPublication.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.publicityPublication.count({
        where: {
          publishedAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30))
          },
          status: 'SUCCESS'
        }
      })
    ]);

    const response = {
      publications: publications.map(pub => ({
        ...pub,
        platformName: getPlatformName(pub.platform),
        statusText: getStatusText(pub.status),
        timeAgo: getTimeAgo(pub.publishedAt || pub.createdAt)
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        byPlatform: stats[0].reduce((acc, stat) => {
          acc[stat.platform] = stat._count;
          return acc;
        }, {} as Record<string, number>),
        byStatus: stats[1].reduce((acc, stat) => {
          acc[stat.status] = stat._count;
          return acc;
        }, {} as Record<string, number>),
        last30Days: stats[2]
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatné parametre', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Chyba pri získavaní publikácií:', error);
    return NextResponse.json(
      { error: 'Chyba pri získavaní publikácií' },
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

