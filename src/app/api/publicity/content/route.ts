import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validačná schéma pre vytvorenie obsahu
const createContentSchema = z.object({
  title: z.string().min(1, 'Názov je povinný'),
  content: z.string().min(10, 'Obsah musí mať aspoň 10 znakov'),
  contentType: z.enum(['POST', 'NEWS', 'EVENT', 'MILESTONE', 'ANNOUNCEMENT', 'PRESS_RELEASE', 'SOCIAL_MEDIA_POST']),
  platforms: z.array(z.enum(['WEB', 'FACEBOOK', 'WHATSAPP', 'LINKEDIN', 'TWITTER', 'INSTAGRAM'])),
  scheduledFor: z.string().datetime().optional(),
  createdBy: z.string().min(1, 'User ID je povinné')
});

// Validačná schéma pre úpravu obsahu
const updateContentSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(10).optional(),
  contentType: z.enum(['POST', 'NEWS', 'EVENT', 'MILESTONE', 'ANNOUNCEMENT', 'PRESS_RELEASE', 'SOCIAL_MEDIA_POST']).optional(),
  platforms: z.array(z.enum(['WEB', 'FACEBOOK', 'WHATSAPP', 'LINKEDIN', 'TWITTER', 'INSTAGRAM'])).optional(),
  scheduledFor: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'REJECTED', 'SCHEDULED', 'ARCHIVED']).optional()
});

// GET /api/publicity/content - Zoznam publicity obsahu
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const contentType = searchParams.get('contentType');
    const platform = searchParams.get('platform');
    const createdBy = searchParams.get('createdBy');
    const search = searchParams.get('search');
    const aiGenerated = searchParams.get('aiGenerated');

    const skip = (page - 1) * limit;

    // Filtrovanie
    const where: any = {};
    if (status) where.status = status;
    if (contentType) where.contentType = contentType;
    if (platform) where.platforms = { has: platform };
    if (createdBy) where.createdBy = createdBy;
    if (aiGenerated !== null) where.aiGenerated = aiGenerated === 'true';
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [content, total] = await Promise.all([
      prisma.publicityContent.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          images: {
            select: {
              id: true,
              filename: true,
              altText: true
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
          },
          publications: {
            select: {
              id: true,
              platform: true,
              status: true,
              publishedAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.publicityContent.count({ where })
    ]);

    // Štatistiky
    const stats = await Promise.all([
      prisma.publicityContent.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.publicityContent.groupBy({
        by: ['contentType'],
        _count: true
      }),
      prisma.publicityContent.count({
        where: { aiGenerated: true }
      })
    ]);

    const response = {
      content,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        byStatus: stats[0].reduce((acc, stat) => {
          acc[stat.status] = stat._count;
          return acc;
        }, {} as Record<string, number>),
        byContentType: stats[1].reduce((acc, stat) => {
          acc[stat.contentType] = stat._count;
          return acc;
        }, {} as Record<string, number>),
        aiGenerated: stats[2]
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Chyba pri získavaní publicity obsahu:', error);
    return NextResponse.json(
      { error: 'Chyba pri získavaní obsahu' },
      { status: 500 }
    );
  }
}

// POST /api/publicity/content - Vytvorenie nového obsahu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createContentSchema.parse(body);

    // Kontrola existencie používateľa
    const user = await prisma.user.findUnique({
      where: { id: validatedData.createdBy }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Používateľ nebol nájdený' },
        { status: 404 }
      );
    }

    // Vytvorenie obsahu
    const content = await prisma.publicityContent.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        contentType: validatedData.contentType,
        platforms: validatedData.platforms,
        scheduledFor: validatedData.scheduledFor ? new Date(validatedData.scheduledFor) : null,
        createdBy: validatedData.createdBy,
        status: 'DRAFT'
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

    // Vytvorenie aktivity
    await prisma.activity.create({
      data: {
        type: 'PUBLICITY_CONTENT_CREATED',
        description: `Vytvorený nový publicity obsah: ${validatedData.title}`,
        userId: validatedData.createdBy
      }
    });

    return NextResponse.json(content, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatné údaje', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Chyba pri vytváraní obsahu:', error);
    return NextResponse.json(
      { error: 'Chyba pri vytváraní obsahu' },
      { status: 500 }
    );
  }
}

