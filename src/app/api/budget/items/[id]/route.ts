import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validačná schéma pre úpravu rozpočtovej položky
const updateBudgetItemSchema = z.object({
  categoryId: z.string().optional(),
  partnerId: z.string().optional(),
  itemNumber: z.string().optional(),
  name: z.string().optional(),
  projectActivity: z.string().optional(),
  activityDescription: z.string().optional(),
  unit: z.string().optional(),
  quantity: z.number().optional(),
  unitPrice: z.number().optional(),
  totalPrice: z.number().positive().optional(),
  description: z.string().optional(),
  detail: z.string().optional(),
  finalPrice: z.number().optional(),
  period24Months: z.number().optional(),
  notes: z.string().optional(),
  workPackage: z.string().optional(),
  period: z.string().optional()
});

// GET /api/budget/items/[id] - Získanie konkrétnej rozpočtovej položky
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const item = await prisma.budgetItem.findUnique({
      where: { id },
      include: {
        budget: true,
        category: true,
        partner: true,
        expenses: {
          include: {
            documents: true,
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
            }
          },
          orderBy: { date: 'desc' }
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
      }
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Rozpočtová položka nebola nájdená' },
        { status: 404 }
      );
    }

    // Výpočet štatistík
    const totalSpent = item.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const planned = Number(item.plannedAmount);
    const utilization = planned > 0 ? (totalSpent / planned) * 100 : 0;
    
    const expensesByStatus = {
      pending: item.expenses.filter(exp => exp.status === 'PENDING'),
      approved: item.expenses.filter(exp => exp.status === 'APPROVED'),
      rejected: item.expenses.filter(exp => exp.status === 'REJECTED'),
      paid: item.expenses.filter(exp => exp.status === 'PAID')
    };

    const pendingAmount = expensesByStatus.pending.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const approvedAmount = expensesByStatus.approved.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const paidAmount = expensesByStatus.paid.reduce((sum, exp) => sum + Number(exp.amount), 0);

    // Mesačný trend výdavkov (posledných 12 mesiacov)
    const monthlyExpenses = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthExpenses = item.expenses.filter(exp => 
        exp.date >= monthStart && exp.date <= monthEnd && exp.status === 'PAID'
      );
      const monthAmount = monthExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

      return {
        month: monthStart.toLocaleDateString('sk-SK', { month: 'short', year: 'numeric' }),
        amount: monthAmount,
        count: monthExpenses.length
      };
    }).reverse();

    const itemWithStats = {
      ...item,
      stats: {
        planned,
        spent: totalSpent,
        remaining: planned - totalSpent,
        utilization: Math.round(utilization * 100) / 100,
        pendingAmount,
        approvedAmount,
        paidAmount,
        expensesCount: item.expenses.length,
        tasksCount: item.tasks.length,
        status: utilization > 100 ? 'OVER_BUDGET' : 
                utilization > 90 ? 'NEAR_LIMIT' : 
                utilization > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
        expensesByStatus: {
          pending: expensesByStatus.pending.length,
          approved: expensesByStatus.approved.length,
          rejected: expensesByStatus.rejected.length,
          paid: expensesByStatus.paid.length
        },
        monthlyTrend: monthlyExpenses
      }
    };

    return NextResponse.json(itemWithStats);

  } catch (error) {
    console.error('Chyba pri získavaní rozpočtovej položky:', error);
    return NextResponse.json(
      { error: 'Chyba pri získavaní rozpočtovej položky' },
      { status: 500 }
    );
  }
}

// PUT /api/budget/items/[id] - Úprava rozpočtovej položky
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateBudgetItemSchema.parse(body);

    // Kontrola existencie položky
    const existingItem = await prisma.budgetItem.findUnique({
      where: { id },
      include: {
        expenses: true
      }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Rozpočtová položka nebola nájdená' },
        { status: 404 }
      );
    }

    // Kontrola, či položka má výdavky (obmedzenie úprav)
    const hasExpenses = existingItem.expenses.length > 0;
    if (hasExpenses && validatedData.totalPrice && validatedData.totalPrice < Number(existingItem.spentAmount)) {
      return NextResponse.json(
        { error: 'Nemožno znížiť plánovanú sumu pod už vyčerpanú sumu' },
        { status: 400 }
      );
    }

    // Kontrola jedinečnosti čísla položky (ak sa mení)
    if (validatedData.itemNumber && validatedData.itemNumber !== existingItem.itemNumber) {
      const duplicateItem = await prisma.budgetItem.findFirst({
        where: {
          budgetId: existingItem.budgetId,
          itemNumber: validatedData.itemNumber,
          id: { not: id }
        }
      });

      if (duplicateItem) {
        return NextResponse.json(
          { error: 'Položka s týmto číslom už existuje' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (validatedData.categoryId) updateData.categoryId = validatedData.categoryId;
    if (validatedData.partnerId !== undefined) updateData.partnerId = validatedData.partnerId;
    if (validatedData.itemNumber) updateData.itemNumber = validatedData.itemNumber;
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.projectActivity !== undefined) updateData.projectActivity = validatedData.projectActivity;
    if (validatedData.activityDescription !== undefined) updateData.activityDescription = validatedData.activityDescription;
    if (validatedData.unit !== undefined) updateData.unit = validatedData.unit;
    if (validatedData.quantity !== undefined) updateData.quantity = validatedData.quantity;
    if (validatedData.unitPrice !== undefined) updateData.unitPrice = validatedData.unitPrice;
    if (validatedData.totalPrice) {
      updateData.totalPrice = validatedData.totalPrice;
      updateData.plannedAmount = validatedData.totalPrice;
    }
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.detail !== undefined) updateData.detail = validatedData.detail;
    if (validatedData.finalPrice !== undefined) updateData.finalPrice = validatedData.finalPrice;
    if (validatedData.period24Months !== undefined) updateData.period24Months = validatedData.period24Months;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;
    if (validatedData.workPackage !== undefined) updateData.workPackage = validatedData.workPackage;
    if (validatedData.period !== undefined) updateData.period = validatedData.period;

    const item = await prisma.budgetItem.update({
      where: { id },
      data: updateData,
      include: {
        budget: true,
        category: true,
        partner: true,
        expenses: true,
        tasks: true
      }
    });

    return NextResponse.json(item);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatné údaje', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Chyba pri úprave rozpočtovej položky:', error);
    return NextResponse.json(
      { error: 'Chyba pri úprave rozpočtovej položky' },
      { status: 500 }
    );
  }
}

// DELETE /api/budget/items/[id] - Zmazanie rozpočtovej položky
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Kontrola existencie položky
    const existingItem = await prisma.budgetItem.findUnique({
      where: { id },
      include: {
        expenses: true,
        tasks: true
      }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Rozpočtová položka nebola nájdená' },
        { status: 404 }
      );
    }

    // Kontrola, či položka má výdavky alebo úlohy
    if (existingItem.expenses.length > 0) {
      return NextResponse.json(
        { error: 'Nemožno zmazať položku, ktorá má výdavky' },
        { status: 400 }
      );
    }

    if (existingItem.tasks.length > 0) {
      return NextResponse.json(
        { error: 'Nemožno zmazať položku, ktorá má priradené úlohy' },
        { status: 400 }
      );
    }

    // Zmazanie položky
    await prisma.budgetItem.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Rozpočtová položka bola úspešne zmazaná' });

  } catch (error) {
    console.error('Chyba pri mazaní rozpočtovej položky:', error);
    return NextResponse.json(
      { error: 'Chyba pri mazaní rozpočtovej položky' },
      { status: 500 }
    );
  }
}

