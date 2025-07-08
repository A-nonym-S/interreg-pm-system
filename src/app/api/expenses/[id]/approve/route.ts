import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validačná schéma pre schválenie výdavku
const approveExpenseSchema = z.object({
  approverId: z.string().min(1, 'ID schvaľovateľa je povinné'),
  status: z.enum(['APPROVED', 'REJECTED'], {
    errorMap: () => ({ message: 'Stav musí byť APPROVED alebo REJECTED' })
  }),
  comment: z.string().optional()
});

// POST /api/expenses/[id]/approve - Schválenie/zamietnutie výdavku
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = approveExpenseSchema.parse(body);

    // Kontrola existencie výdavku
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        budgetItem: {
          include: {
            budget: true,
            category: true
          }
        },
        approvals: {
          include: {
            approver: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!expense) {
      return NextResponse.json(
        { error: 'Výdavok nebol nájdený' },
        { status: 404 }
      );
    }

    // Kontrola existencie schvaľovateľa
    const approver = await prisma.user.findUnique({
      where: { id: validatedData.approverId }
    });

    if (!approver) {
      return NextResponse.json(
        { error: 'Schvaľovateľ nebol nájdený' },
        { status: 404 }
      );
    }

    // Kontrola oprávnení schvaľovateľa
    const approverRole = approver.role;
    let approverLevel = 1;

    switch (approverRole) {
      case 'TEAM_MEMBER':
        approverLevel = 1; // Partner level
        break;
      case 'PROJECT_MANAGER':
        approverLevel = 3; // Project Manager level
        break;
      case 'ADMIN':
        approverLevel = 3; // Admin má najvyššie oprávnenia
        break;
      default:
        return NextResponse.json(
          { error: 'Nemáte oprávnenie schvaľovať výdavky' },
          { status: 403 }
        );
    }

    // Kontrola, či už schvaľovateľ neschválil tento výdavok
    const existingApproval = expense.approvals.find(
      approval => approval.approverId === validatedData.approverId
    );

    if (existingApproval) {
      return NextResponse.json(
        { error: 'Tento výdavok ste už schválili/zamietli' },
        { status: 400 }
      );
    }

    // Vytvorenie záznamu o schválení
    const approval = await prisma.expenseApproval.create({
      data: {
        expenseId: id,
        approverId: validatedData.approverId,
        approverLevel,
        status: validatedData.status,
        comment: validatedData.comment,
        approvedAt: validatedData.status === 'APPROVED' ? new Date() : null
      },
      include: {
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    // Aktualizácia stavu výdavku na základe schválení
    let newExpenseStatus = expense.status;

    if (validatedData.status === 'REJECTED') {
      // Ak niekto zamietne, celý výdavok je zamietnutý
      newExpenseStatus = 'REJECTED';
    } else if (validatedData.status === 'APPROVED') {
      // Kontrola, či sú splnené podmienky pre schválenie
      const allApprovals = [...expense.approvals, approval];
      const approvedCount = allApprovals.filter(app => app.status === 'APPROVED').length;
      const rejectedCount = allApprovals.filter(app => app.status === 'REJECTED').length;

      if (rejectedCount > 0) {
        newExpenseStatus = 'REJECTED';
      } else {
        // Pre jednoduchosť: ak má aspoň jedno schválenie od PROJECT_MANAGER alebo ADMIN, je schválený
        const hasManagerApproval = allApprovals.some(app => 
          app.status === 'APPROVED' && app.approverLevel >= 3
        );

        if (hasManagerApproval) {
          newExpenseStatus = 'APPROVED';
        }
        // Inak zostáva PENDING
      }
    }

    // Aktualizácia stavu výdavku
    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: { status: newExpenseStatus },
      include: {
        budgetItem: {
          include: {
            budget: true,
            category: true
          }
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
          }
        }
      }
    });

    // Ak je výdavok schválený, aktualizuj vyčerpanú sumu v rozpočtovej položke
    if (newExpenseStatus === 'APPROVED' && expense.status !== 'APPROVED') {
      await prisma.budgetItem.update({
        where: { id: expense.budgetItemId },
        data: {
          spentAmount: {
            increment: Number(expense.amount)
          }
        }
      });
    }

    // Vytvorenie aktivity
    const activityType = validatedData.status === 'APPROVED' ? 'EXPENSE_APPROVED' : 'EXPENSE_REJECTED';
    const activityDescription = validatedData.status === 'APPROVED' 
      ? `Výdavok ${expense.amount} EUR bol schválený používateľom ${approver.name}`
      : `Výdavok ${expense.amount} EUR bol zamietnutý používateľom ${approver.name}`;

    await prisma.activity.create({
      data: {
        type: activityType,
        description: activityDescription,
        userId: validatedData.approverId
      }
    });

    return NextResponse.json({
      approval,
      expense: updatedExpense,
      message: validatedData.status === 'APPROVED' 
        ? 'Výdavok bol úspešne schválený'
        : 'Výdavok bol zamietnutý'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatné údaje', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Chyba pri schvaľovaní výdavku:', error);
    return NextResponse.json(
      { error: 'Chyba pri schvaľovaní výdavku' },
      { status: 500 }
    );
  }
}

// GET /api/expenses/[id]/approve - Získanie histórie schvaľovania
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const approvals = await prisma.expenseApproval.findMany({
      where: { expenseId: id },
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
    });

    return NextResponse.json(approvals);

  } catch (error) {
    console.error('Chyba pri získavaní histórie schvaľovania:', error);
    return NextResponse.json(
      { error: 'Chyba pri získavaní histórie schvaľovania' },
      { status: 500 }
    );
  }
}

