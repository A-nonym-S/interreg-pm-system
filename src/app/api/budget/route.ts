import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validačná schéma pre vytvorenie rozpočtu
const createBudgetSchema = z.object({
  projectName: z.string().min(1, 'Názov projektu je povinný'),
  totalAmount: z.number().positive('Celková suma musí byť kladná'),
  startDate: z.string().datetime('Neplatný formát dátumu začiatku'),
  endDate: z.string().datetime('Neplatný formát dátumu ukončenia'),
  currency: z.string().default('EUR'),
  createdBy: z.string().min(1, 'Vytvoril je povinné pole')
});

// Validačná schéma pre úpravu rozpočtu
const updateBudgetSchema = z.object({
  projectName: z.string().min(1).optional(),
  totalAmount: z.number().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED']).optional()
});

// GET /api/budget - Získanie všetkých rozpočtov
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [budgets, total] = await Promise.all([
      prisma.budget.findMany({
        where,
        include: {
          partners: true,
          categories: {
            include: {
              items: true
            }
          },
          items: {
            include: {
              category: true,
              partner: true,
              expenses: true
            }
          },
          imports: {
            orderBy: { importedAt: 'desc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.budget.count({ where })
    ]);

    // Výpočet štatistík pre každý rozpočet
    const budgetsWithStats = budgets.map(budget => {
      const totalPlanned = budget.items.reduce((sum, item) => sum + Number(item.plannedAmount), 0);
      const totalSpent = budget.items.reduce((sum, item) => sum + Number(item.spentAmount), 0);
      const utilizationPercentage = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0;

      return {
        ...budget,
        stats: {
          totalPlanned,
          totalSpent,
          remaining: totalPlanned - totalSpent,
          utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
          itemsCount: budget.items.length,
          categoriesCount: budget.categories.length,
          partnersCount: budget.partners.length
        }
      };
    });

    return NextResponse.json({
      budgets: budgetsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Chyba pri získavaní rozpočtov:', error);
    return NextResponse.json(
      { error: 'Chyba pri získavaní rozpočtov' },
      { status: 500 }
    );
  }
}

// POST /api/budget - Vytvorenie nového rozpočtu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createBudgetSchema.parse(body);

    const budget = await prisma.budget.create({
      data: {
        projectName: validatedData.projectName,
        totalAmount: validatedData.totalAmount,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        currency: validatedData.currency,
        createdBy: validatedData.createdBy,
        status: 'DRAFT'
      },
      include: {
        partners: true,
        categories: true,
        items: true
      }
    });

    // Vytvorenie aktivity
    await prisma.activity.create({
      data: {
        type: 'BUDGET_CREATED',
        description: `Rozpočet '${budget.projectName}' bol vytvorený`,
        userId: validatedData.createdBy
      }
    });

    return NextResponse.json(budget, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatné údaje', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Chyba pri vytváraní rozpočtu:', error);
    return NextResponse.json(
      { error: 'Chyba pri vytváraní rozpočtu' },
      { status: 500 }
    );
  }
}

// PUT /api/budget/:id - Úprava rozpočtu
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID rozpočtu je povinné' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateBudgetSchema.parse(body);

    // Kontrola existencie rozpočtu
    const existingBudget = await prisma.budget.findUnique({
      where: { id }
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: 'Rozpočet nebol nájdený' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (validatedData.projectName) updateData.projectName = validatedData.projectName;
    if (validatedData.totalAmount) updateData.totalAmount = validatedData.totalAmount;
    if (validatedData.startDate) updateData.startDate = new Date(validatedData.startDate);
    if (validatedData.endDate) updateData.endDate = new Date(validatedData.endDate);
    if (validatedData.status) updateData.status = validatedData.status;

    const budget = await prisma.budget.update({
      where: { id },
      data: updateData,
      include: {
        partners: true,
        categories: true,
        items: true
      }
    });

    return NextResponse.json(budget);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatné údaje', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Chyba pri úprave rozpočtu:', error);
    return NextResponse.json(
      { error: 'Chyba pri úprave rozpočtu' },
      { status: 500 }
    );
  }
}

