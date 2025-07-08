import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validačná schéma pre analytické parametre
const analyticsQuerySchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  platform: z.string().optional(),
  contentType: z.string().optional(),
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month')
});

// GET /api/publicity/analytics - Analytika publikácií
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = analyticsQuerySchema.parse(Object.fromEntries(searchParams));

    // Nastavenie predvolených dátumov (posledných 30 dní)
    const dateTo = query.dateTo ? new Date(query.dateTo) : new Date();
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : new Date(dateTo.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Základné filtrovanie
    const where: any = {
      createdAt: {
        gte: dateFrom,
        lte: dateTo
      }
    };

    if (query.platform) where.platform = query.platform;
    if (query.contentType) {
      where.content = {
        contentType: query.contentType
      };
    }

    // Získanie základných štatistík
    const [
      totalPublications,
      successfulPublications,
      failedPublications,
      platformStats,
      contentTypeStats,
      timeSeriesData
    ] = await Promise.all([
      prisma.publicityPublication.count({ where }),
      prisma.publicityPublication.count({ where: { ...where, status: 'SUCCESS' } }),
      prisma.publicityPublication.count({ where: { ...where, status: 'FAILED' } }),
      getPlatformStats(where),
      getContentTypeStats(where),
      getTimeSeriesData(dateFrom, dateTo, query.period, where)
    ]);

    // Výpočet úspešnosti
    const successRate = totalPublications > 0 ? (successfulPublications / totalPublications) * 100 : 0;

    // Získanie top obsahu
    const topContent = await getTopContent(where);

    // Engagement metriky (simulované)
    const engagementMetrics = await getEngagementMetrics(where);

    const analytics = {
      summary: {
        totalPublications,
        successfulPublications,
        failedPublications,
        successRate: Math.round(successRate * 100) / 100,
        period: {
          from: dateFrom.toISOString(),
          to: dateTo.toISOString()
        }
      },
      platformStats,
      contentTypeStats,
      timeSeriesData,
      topContent,
      engagementMetrics,
      trends: calculateTrends(timeSeriesData),
      recommendations: generateRecommendations({
        successRate,
        platformStats,
        contentTypeStats,
        engagementMetrics
      })
    };

    return NextResponse.json(analytics);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatné parametre', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Chyba pri získavaní analytiky:', error);
    return NextResponse.json(
      { error: 'Chyba pri získavaní analytiky' },
      { status: 500 }
    );
  }
}

// Štatistiky podľa platforiem
async function getPlatformStats(where: any) {
  const stats = await prisma.publicityPublication.groupBy({
    by: ['platform', 'status'],
    _count: true,
    where
  });

  const platformData: Record<string, any> = {};

  stats.forEach(stat => {
    if (!platformData[stat.platform]) {
      platformData[stat.platform] = {
        platform: stat.platform,
        platformName: getPlatformName(stat.platform),
        total: 0,
        successful: 0,
        failed: 0,
        successRate: 0
      };
    }

    platformData[stat.platform].total += stat._count;
    if (stat.status === 'SUCCESS') {
      platformData[stat.platform].successful += stat._count;
    } else if (stat.status === 'FAILED') {
      platformData[stat.platform].failed += stat._count;
    }
  });

  // Výpočet úspešnosti pre každú platformu
  Object.values(platformData).forEach((platform: any) => {
    platform.successRate = platform.total > 0 
      ? Math.round((platform.successful / platform.total) * 100 * 100) / 100
      : 0;
  });

  return Object.values(platformData);
}

// Štatistiky podľa typov obsahu
async function getContentTypeStats(where: any) {
  const stats = await prisma.publicityPublication.groupBy({
    by: ['status'],
    _count: true,
    where: {
      ...where,
      content: where.content || {}
    }
  });

  // Získanie detailných štatistík podľa typu obsahu
  const contentStats = await prisma.publicityContent.groupBy({
    by: ['contentType'],
    _count: true,
    where: {
      publications: {
        some: where
      }
    }
  });

  return contentStats.map(stat => ({
    contentType: stat.contentType,
    contentTypeName: getContentTypeName(stat.contentType),
    count: stat._count
  }));
}

// Časové rady dát
async function getTimeSeriesData(dateFrom: Date, dateTo: Date, period: string, where: any) {
  // Simulácia časových radov - v reálnej implementácii by tu bolo komplexnejšie SQL query
  const data = [];
  const diffDays = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < Math.min(diffDays, 30); i++) {
    const date = new Date(dateFrom.getTime() + i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split('T')[0],
      publications: Math.floor(Math.random() * 10) + 1,
      successful: Math.floor(Math.random() * 8) + 1,
      failed: Math.floor(Math.random() * 2),
      engagement: Math.floor(Math.random() * 500) + 100
    });
  }

  return data;
}

// Top obsah
async function getTopContent(where: any) {
  const topContent = await prisma.publicityContent.findMany({
    where: {
      publications: {
        some: where
      }
    },
    include: {
      publications: {
        where,
        select: {
          platform: true,
          status: true,
          publishedAt: true
        }
      },
      creator: {
        select: {
          name: true
        }
      }
    },
    take: 10,
    orderBy: {
      publications: {
        _count: 'desc'
      }
    }
  });

  return topContent.map(content => ({
    id: content.id,
    title: content.title,
    contentType: content.contentType,
    contentTypeName: getContentTypeName(content.contentType),
    creator: content.creator.name,
    publicationsCount: content.publications.length,
    successfulPublications: content.publications.filter(p => p.status === 'SUCCESS').length,
    platforms: [...new Set(content.publications.map(p => p.platform))],
    lastPublished: content.publications
      .filter(p => p.publishedAt)
      .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())[0]?.publishedAt
  }));
}

// Engagement metriky (simulované)
async function getEngagementMetrics(where: any) {
  // V reálnej implementácii by tu boli volania na API jednotlivých platforiem
  return {
    totalViews: Math.floor(Math.random() * 10000) + 5000,
    totalEngagement: Math.floor(Math.random() * 1000) + 500,
    averageEngagementRate: Math.round((Math.random() * 5 + 2) * 100) / 100,
    topPerformingPlatform: 'FACEBOOK',
    engagementByPlatform: {
      WEB: {
        views: Math.floor(Math.random() * 3000) + 1000,
        clicks: Math.floor(Math.random() * 300) + 100
      },
      FACEBOOK: {
        views: Math.floor(Math.random() * 5000) + 2000,
        likes: Math.floor(Math.random() * 200) + 50,
        shares: Math.floor(Math.random() * 50) + 10,
        comments: Math.floor(Math.random() * 30) + 5
      },
      WHATSAPP: {
        views: Math.floor(Math.random() * 1000) + 200,
        engagement: Math.floor(Math.random() * 300) + 100
      }
    }
  };
}

// Výpočet trendov
function calculateTrends(timeSeriesData: any[]) {
  if (timeSeriesData.length < 2) return null;

  const recent = timeSeriesData.slice(-7); // Posledných 7 dní
  const previous = timeSeriesData.slice(-14, -7); // Predchádzajúcich 7 dní

  const recentAvg = recent.reduce((sum, day) => sum + day.publications, 0) / recent.length;
  const previousAvg = previous.length > 0 
    ? previous.reduce((sum, day) => sum + day.publications, 0) / previous.length 
    : recentAvg;

  const trend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

  return {
    publicationsTrend: Math.round(trend * 100) / 100,
    direction: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable'
  };
}

// Generovanie odporúčaní
function generateRecommendations(data: any) {
  const recommendations = [];

  if (data.successRate < 80) {
    recommendations.push({
      type: 'warning',
      title: 'Nízka úspešnosť publikácií',
      description: 'Úspešnosť publikácií je pod 80%. Skontrolujte nastavenia API a pripojenia k platformám.',
      priority: 'high'
    });
  }

  if (data.platformStats.some((p: any) => p.successRate < 70)) {
    const problematicPlatforms = data.platformStats
      .filter((p: any) => p.successRate < 70)
      .map((p: any) => p.platformName);
    
    recommendations.push({
      type: 'warning',
      title: 'Problémy s platformami',
      description: `Nízka úspešnosť na: ${problematicPlatforms.join(', ')}`,
      priority: 'medium'
    });
  }

  if (data.engagementMetrics.averageEngagementRate < 2) {
    recommendations.push({
      type: 'info',
      title: 'Nízka angažovanosť',
      description: 'Zvážte úpravu obsahu pre zvýšenie angažovanosti používateľov.',
      priority: 'low'
    });
  }

  return recommendations;
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

function getContentTypeName(contentType: string): string {
  switch (contentType) {
    case 'NEWS': return 'Novinky';
    case 'EVENT': return 'Udalosť';
    case 'MILESTONE': return 'Míľnik';
    case 'POST': return 'Príspevok';
    case 'ANNOUNCEMENT': return 'Oznámenie';
    case 'PRESS_RELEASE': return 'Tlačová správa';
    default: return contentType;
  }
}

