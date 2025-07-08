import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validačná schéma pre vytvorenie výdavku
const createExpenseSchema = z.object({
  budgetItemId: z.string().min(1, 'ID rozpočtovej položky je povinné'),
  amount: z.number().positive('Suma musí byť kladná'),
  date: z.string().datetime('Neplatný formát dátumu'),
  description: z.string().min(1, 'Popis je povinný'),
  supplierName: z.string().optional(),
  supplierIco: z.string().optional(),
  invoiceNumber: z.string().optional(),
  createdBy: z.string().min(1, 'Vytvoril je povinné pole')
});

// Validačná schéma pre úpravu výdavku
const updateExpenseSchema = createExpenseSchema.partial().omit({ budgetItemId: true, createdBy: true });

// GET /api/expenses - Získanie výdavkov
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const budgetId = searchParams.get('budgetId');
    const budgetItemId = searchParams.get('budgetItemId');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Vytvorenie where podmienky
    const where: any = {};
    
    if (budgetItemId) {
      where.budgetItemId = budgetItemId;
    } else if (budgetId) {
      where.budgetItem = { budgetId };
    }
    
    if (status) where.status = status;
    
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }
    
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { supplierName: { contains: search, mode: 'insensitive' } },
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { budgetItem: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          budgetItem: {
            include: {
              category: true,
              partner: true,
              budget: {
                select: {
                  id: true,
                  projectName: true
                }
              }
            }
          },
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
        orderBy: { date: 'desc' },
        skip,
        take: limit
      }),
      prisma.expense.count({ where })
    ]);

    // Pridanie štatistík pre každý výdavok
    const expensesWithStats = expenses.map(expense => {
      const latestApproval = expense.approvals[0];
      const pendingApprovals = expense.approvals.filter(app => app.status === 'PENDING');
      const approvedApprovals = expense.approvals.filter(app => app.status === 'APPROVED');
      const rejectedApprovals = expense.approvals.filter(app => app.status === 'REJECTED');

      return {
        ...expense,
        stats: {
          documentsCount: expense.documents.length,
          approvalsCount: expense.approvals.length,
          pendingApprovalsCount: pendingApprovals.length,
          approvedApprovalsCount: approvedApprovals.length,
          rejectedApprovalsCount: rejectedApprovals.length,
          latestApproval: latestApproval ? {
            status: latestApproval.status,
            approverName: latestApproval.approver.name,
            approverRole: latestApproval.approver.role,
            comment: latestApproval.comment,
            approvedAt: latestApproval.approvedAt
          } : null
        }
      };
    });

    return NextResponse.json({
      expenses: expensesWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Chyba pri získavaní výdavkov:', error);
    return NextResponse.json(
      { error: 'Chyba pri získavaní výdavkov' },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Vytvorenie nového výdavku
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createExpenseSchema.parse(body);

    // Kontrola existencie rozpočtovej položky
    const budgetItem = await prisma.budgetItem.findUnique({
      where: { id: validatedData.budgetItemId },
      include: {
        budget: true,
        category: true
      }
    });

    if (!budgetItem) {
      return NextResponse.json(
        { error: 'Rozpočtová položka nebola nájdená' },
        { status: 404 }
      );
    }

    // Kontrola, či výdavok neprekročí rozpočet
    const currentSpent = Number(budgetItem.spentAmount);
    const newAmount = validatedData.amount;
    const plannedAmount = Number(budgetItem.plannedAmount);

    if (currentSpent + newAmount > plannedAmount) {
      return NextResponse.json(
        { 
          error: 'Výdavok prekračuje plánovanú sumu rozpočtovej položky',
          details: {
            planned: plannedAmount,
            currentSpent,
            newAmount,
            wouldExceedBy: (currentSpent + newAmount) - plannedAmount
          }
        },
        { status: 400 }
      );
    }

    // Vytvorenie výdavku
    const expense = await prisma.expense.create({
      data: {
        budgetItemId: validatedData.budgetItemId,
        amount: validatedData.amount,
        date: new Date(validatedData.date),
        description: validatedData.description,
        supplierName: validatedData.supplierName,
        supplierIco: validatedData.supplierIco,
        invoiceNumber: validatedData.invoiceNumber,
        createdBy: validatedData.createdBy,
        status: 'PENDING'
      },
      include: {
        budgetItem: {
          include: {
            category: true,
            partner: true,
            budget: true
          }
        },
        documents: true,
        approvals: true
      }
    });

    // Vytvorenie aktivity
    await prisma.activity.create({
      data: {
        type: 'EXPENSE_ADDED',
        description: `Výdavok ${validatedData.amount} EUR bol pridaný k položke '${budgetItem.name}'`,
        userId: validatedData.createdBy
      }
    });

    return NextResponse.json(expense, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatné údaje', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Chyba pri vytváraní výdavku:', error);
    return NextResponse.json(
      { error: 'Chyba pri vytváraní výdavku' },
      { status: 500 }
    );
  }
}

