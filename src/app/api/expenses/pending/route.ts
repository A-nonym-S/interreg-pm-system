import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/expenses/pending - Získanie výdavkov čakajúcich na schválenie
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const budgetId = searchParams.get('budgetId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID používateľa je povinné' },
        { status: 400 }
      );
    }

    // Získanie informácií o používateľovi
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Používateľ nebol nájdený' },
        { status: 404 }
      );
    }

    // Určenie úrovne schvaľovania na základe role
    let canApprove = false;
    let approverLevel = 1;

    switch (user.role) {
      case 'TEAM_MEMBER':
        canApprove = true;
        approverLevel = 1;
        break;
      case 'PROJECT_MANAGER':
        canApprove = true;
        approverLevel = 3;
        break;
      case 'ADMIN':
        canApprove = true;
        approverLevel = 3;
        break;
      default:
        canApprove = false;
    }

    if (!canApprove) {
      return NextResponse.json(
        { error: 'Nemáte oprávnenie schvaľovať výdavky' },
        { status: 403 }
      );
    }

    // Vytvorenie where podmienky
    const where: any = {
      status: 'PENDING'
    };

    if (budgetId) {
      where.budgetItem = { budgetId };
    }

    // Získanie výdavkov čakajúcich na schválenie
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
        orderBy: { createdAt: 'asc' }, // Najstaršie najprv
        skip,
        take: limit
      }),
      prisma.expense.count({ where })
    ]);

    // Filtrovanie výdavkov, ktoré používateľ ešte neschválil
    const pendingForUser = expenses.filter(expense => {
      const userAlreadyApproved = expense.approvals.some(
        approval => approval.approverId === userId
      );
      return !userAlreadyApproved;
    });

    // Pridanie dodatočných informácií pre každý výdavok
    const expensesWithInfo = pendingForUser.map(expense => {
      const approvedCount = expense.approvals.filter(app => app.status === 'APPROVED').length;
      const rejectedCount = expense.approvals.filter(app => app.status === 'REJECTED').length;
      const pendingCount = expense.approvals.filter(app => app.status === 'PENDING').length;

      // Výpočet využitia rozpočtovej položky
      const budgetItem = expense.budgetItem;
      const currentSpent = Number(budgetItem.spentAmount);
      const plannedAmount = Number(budgetItem.plannedAmount);
      const utilization = plannedAmount > 0 ? (currentSpent / plannedAmount) * 100 : 0;

      // Kontrola, či výdavok neprekročí rozpočet
      const wouldExceedBudget = (currentSpent + Number(expense.amount)) > plannedAmount;
      const exceedAmount = wouldExceedBudget ? 
        (currentSpent + Number(expense.amount)) - plannedAmount : 0;

      return {
        ...expense,
        approvalInfo: {
          approvedCount,
          rejectedCount,
          pendingCount,
          totalApprovals: expense.approvals.length,
          canUserApprove: true, // Už je filtrované
          userApproverLevel: approverLevel
        },
        budgetInfo: {
          currentUtilization: Math.round(utilization * 100) / 100,
          wouldExceedBudget,
          exceedAmount,
          remainingBudget: plannedAmount - currentSpent
        },
        priority: wouldExceedBudget ? 'HIGH' : 
                 utilization > 80 ? 'MEDIUM' : 'LOW',
        daysWaiting: Math.floor(
          (new Date().getTime() - new Date(expense.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        )
      };
    });

    // Štatistiky pre dashboard
    const stats = {
      totalPending: pendingForUser.length,
      highPriority: expensesWithInfo.filter(exp => exp.priority === 'HIGH').length,
      mediumPriority: expensesWithInfo.filter(exp => exp.priority === 'MEDIUM').length,
      lowPriority: expensesWithInfo.filter(exp => exp.priority === 'LOW').length,
      totalAmount: expensesWithInfo.reduce((sum, exp) => sum + Number(exp.amount), 0),
      averageWaitingDays: expensesWithInfo.length > 0 ? 
        Math.round(expensesWithInfo.reduce((sum, exp) => sum + exp.daysWaiting, 0) / expensesWithInfo.length) : 0,
      budgetExceeding: expensesWithInfo.filter(exp => exp.budgetInfo.wouldExceedBudget).length
    };

    return NextResponse.json({
      expenses: expensesWithInfo,
      stats,
      pagination: {
        page,
        limit,
        total: pendingForUser.length,
        pages: Math.ceil(pendingForUser.length / limit)
      },
      userInfo: {
        id: user.id,
        name: user.name,
        role: user.role,
        approverLevel,
        canApprove
      }
    });

  } catch (error) {
    console.error('Chyba pri získavaní čakajúcich výdavkov:', error);
    return NextResponse.json(
      { error: 'Chyba pri získavaní čakajúcich výdavkov' },
      { status: 500 }
    );
  }
}

