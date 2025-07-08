import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validačná schéma pre úpravu obsahu
const updateContentSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(10).optional(),
  contentType: z.enum(['POST', 'NEWS', 'EVENT', 'MILESTONE', 'ANNOUNCEMENT', 'PRESS_RELEASE', 'SOCIAL_MEDIA_POST']).optional(),
  platforms: z.array(z.enum(['WEB', 'FACEBOOK', 'WHATSAPP', 'LINKEDIN', 'TWITTER', 'INSTAGRAM'])).optional(),
  scheduledFor: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'REJECTED', 'SCHEDULED', 'ARCHIVED']).optional()
});

// GET /api/publicity/content/[id] - Získanie konkrétneho obsahu
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const content = await prisma.publicityContent.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        images: {
          orderBy: { uploadedAt: 'asc' }
        },
        approvals: {
          include: {
            approver: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        publications: {
          orderBy: { publishedAt: 'desc' }
        }
      }
    });

    if (!content) {
      return NextResponse.json(
        { error: 'Obsah nebol nájdený' },
        { status: 404 }
      );
    }

    // Pridanie dodatočných informácií
    const contentWithStats = {
      ...content,
      stats: {
        approvalsCount: content.approvals.length,
        pendingApprovals: content.approvals.filter(a => a.status === 'PENDING').length,
        approvedCount: content.approvals.filter(a => a.status === 'APPROVED').length,
        rejectedCount: content.approvals.filter(a => a.status === 'REJECTED').length,
        publicationsCount: content.publications.length,
        successfulPublications: content.publications.filter(p => p.status === 'SUCCESS').length,
        failedPublications: content.publications.filter(p => p.status === 'FAILED').length,
        imagesCount: content.images.length
      }
    };

    return NextResponse.json(contentWithStats);

  } catch (error) {
    console.error('Chyba pri získavaní obsahu:', error);
    return NextResponse.json(
      { error: 'Chyba pri získavaní obsahu' },
      { status: 500 }
    );
  }
}

// PUT /api/publicity/content/[id] - Úprava obsahu
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateContentSchema.parse(body);

    // Kontrola existencie obsahu
    const existingContent = await prisma.publicityContent.findUnique({
      where: { id },
      include: {
        approvals: true,
        publications: true
      }
    });

    if (!existingContent) {
      return NextResponse.json(
        { error: 'Obsah nebol nájdený' },
        { status: 404 }
      );
    }

    // Kontrola, či obsah môže byť upravený
    if (existingContent.status === 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Publikovaný obsah nemôže byť upravený' },
        { status: 400 }
      );
    }

    // Ak sa mení status na PENDING_APPROVAL, resetuj schválenia
    let updateData: any = {
      ...validatedData,
      updatedAt: new Date()
    };

    if (validatedData.scheduledFor) {
      updateData.scheduledFor = new Date(validatedData.scheduledFor);
    }

    // Ak sa obsah posiela na schválenie, resetuj predchádzajúce schválenia
    if (validatedData.status === 'PENDING_APPROVAL' && existingContent.status !== 'PENDING_APPROVAL') {
      // Zmaž predchádzajúce schválenia
      await prisma.publicityApproval.deleteMany({
        where: { contentId: id }
      });
    }

    // Aktualizácia obsahu
    const content = await prisma.publicityContent.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        images: true,
        approvals: {
          include: {
            approver: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        publications: true
      }
    });

    return NextResponse.json(content);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatné údaje', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Chyba pri úprave obsahu:', error);
    return NextResponse.json(
      { error: 'Chyba pri úprave obsahu' },
      { status: 500 }
    );
  }
}

// DELETE /api/publicity/content/[id] - Zmazanie obsahu
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Kontrola existencie obsahu
    const existingContent = await prisma.publicityContent.findUnique({
      where: { id },
      include: {
        publications: true
      }
    });

    if (!existingContent) {
      return NextResponse.json(
        { error: 'Obsah nebol nájdený' },
        { status: 404 }
      );
    }

    // Kontrola, či obsah môže byť zmazaný
    if (existingContent.status === 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Publikovaný obsah nemôže byť zmazaný' },
        { status: 400 }
      );
    }

    const hasSuccessfulPublications = existingContent.publications.some(p => p.status === 'SUCCESS');
    if (hasSuccessfulPublications) {
      return NextResponse.json(
        { error: 'Obsah s úspešnými publikáciami nemôže byť zmazaný' },
        { status: 400 }
      );
    }

    // Zmazanie obsahu (kaskádové zmazanie cez Prisma)
    await prisma.publicityContent.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Obsah bol úspešne zmazaný' });

  } catch (error) {
    console.error('Chyba pri mazaní obsahu:', error);
    return NextResponse.json(
      { error: 'Chyba pri mazaní obsahu' },
      { status: 500 }
    );
  }
}

