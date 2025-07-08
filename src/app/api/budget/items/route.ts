import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validačná schéma pre vytvorenie rozpočtovej položky
const createBudgetItemSchema = z.object({
  budgetId: z.string().min(1, 'ID rozpočtu je povinné'),
  categoryId: z.string().min(1, 'ID kategórie je povinné'),
  partnerId: z.string().optional(),
  itemNumber: z.string().min(1, 'Číslo položky je povinné'),
  name: z.string().min(1, 'Názov položky je povinný'),
  projectActivity: z.string().optional(),
  activityDescription: z.string().optional(),
  unit: z.string().optional(),
  quantity: z.number().optional(),
  unitPrice: z.number().optional(),
  totalPrice: z.number().positive('Celková cena musí byť kladná'),
  description: z.string().optional(),
  detail: z.string().optional(),
  finalPrice: z.number().optional(),
  period24Months: z.number().optional(),
  notes: z.string().optional(),
  workPackage: z.string().optional(),
  period: z.string().optional()
});

// Validačná schéma pre úpravu rozpočtovej položky
const updateBudgetItemSchema = createBudgetItemSchema.partial().omit({ budgetId: true });

// GET /api/budget/items - Získanie rozpočtových položiek
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const budgetId = searchParams.get('budgetId');
    const categoryId = searchParams.get('categoryId');
    const partnerId = searchParams.get('partnerId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!budgetId) {
      return NextResponse.json(
        { error: 'ID rozpočtu je povinné' },
        { status: 400 }
      );
    }

    // Vytvorenie where podmienky
    const where: any = { budgetId };
    if (categoryId) where.categoryId = categoryId;
    if (partnerId) where.partnerId = partnerId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { itemNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { projectActivity: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.budgetItem.findMany({
        where,
        include: {
          category: true,
          partner: true,
          expenses: {
            include: {
              documents: true,
              approvals: true
            }
          },
          tasks: {
            include: {
              assignee: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { itemNumber: 'asc' },
        skip,
        take: limit
      }),
      prisma.budgetItem.count({ where })
    ]);

    // Výpočet štatistík pre každú položku
    const itemsWithStats = items.map(item => {
      const totalSpent = item.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      const planned = Number(item.plannedAmount);
      const utilization = planned > 0 ? (totalSpent / planned) * 100 : 0;
      const pendingExpenses = item.expenses.filter(exp => exp.status === 'PENDING');
      const pendingAmount = pendingExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

      return {
        ...item,
        stats: {
          planned,
          spent: totalSpent,
          remaining: planned - totalSpent,
          utilization: Math.round(utilization * 100) / 100,
          pendingAmount,
          expensesCount: item.expenses.length,
          tasksCount: item.tasks.length,
          status: utilization > 100 ? 'OVER_BUDGET' : 
                  utilization > 90 ? 'NEAR_LIMIT' : 
                  utilization > 0 ? 'IN_PROGRESS' : 'NOT_STARTED'
        }
      };
    });

    return NextResponse.json({
      items: itemsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Chyba pri získavaní rozpočtových položiek:', error);
    return NextResponse.json(
      { error: 'Chyba pri získavaní rozpočtových položiek' },
      { status: 500 }
    );
  }
}

// POST /api/budget/items - Vytvorenie novej rozpočtovej položky
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createBudgetItemSchema.parse(body);

    // Kontrola existencie rozpočtu
    const budget = await prisma.budget.findUnique({
      where: { id: validatedData.budgetId }
    });

    if (!budget) {
      return NextResponse.json(
        { error: 'Rozpočet nebol nájdený' },
        { status: 404 }
      );
    }

    // Kontrola existencie kategórie
    const category = await prisma.budgetCategory.findUnique({
      where: { id: validatedData.categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Kategória nebola nájdená' },
        { status: 404 }
      );
    }

    // Kontrola jedinečnosti čísla položky v rámci rozpočtu
    const existingItem = await prisma.budgetItem.findFirst({
      where: {
        budgetId: validatedData.budgetId,
        itemNumber: validatedData.itemNumber
      }
    });

    if (existingItem) {
      return NextResponse.json(
        { error: 'Položka s týmto číslom už existuje' },
        { status: 400 }
      );
    }

    const item = await prisma.budgetItem.create({
      data: {
        budgetId: validatedData.budgetId,
        categoryId: validatedData.categoryId,
        partnerId: validatedData.partnerId,
        itemNumber: validatedData.itemNumber,
        name: validatedData.name,
        projectActivity: validatedData.projectActivity,
        activityDescription: validatedData.activityDescription,
        unit: validatedData.unit,
        quantity: validatedData.quantity,
        unitPrice: validatedData.unitPrice,
        totalPrice: validatedData.totalPrice,
        description: validatedData.description,
        detail: validatedData.detail,
        finalPrice: validatedData.finalPrice,
        period24Months: validatedData.period24Months,
        notes: validatedData.notes,
        plannedAmount: validatedData.totalPrice,
        workPackage: validatedData.workPackage,
        period: validatedData.period
      },
      include: {
        category: true,
        partner: true,
        expenses: true,
        tasks: true
      }
    });

    return NextResponse.json(item, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatné údaje', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Chyba pri vytváraní rozpočtovej položky:', error);
    return NextResponse.json(
      { error: 'Chyba pri vytváraní rozpočtovej položky' },
      { status: 500 }
    );
  }
}

