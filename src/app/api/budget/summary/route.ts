import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/budget/summary - Súhrny rozpočtu
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const budgetId = searchParams.get('budgetId');
    const period = searchParams.get('period'); // 'month', 'quarter', 'year'
    const year = searchParams.get('year');

    if (!budgetId) {
      return NextResponse.json(
        { error: 'ID rozpočtu je povinné' },
        { status: 400 }
      );
    }

    // Základné informácie o rozpočte
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: {
        items: {
          include: {
            category: true,
            partner: true,
            expenses: {
              where: year ? {
                date: {
                  gte: new Date(`${year}-01-01`),
                  lte: new Date(`${year}-12-31`)
                }
              } : undefined
            }
          }
        },
        categories: true,
        partners: true
      }
    });

    if (!budget) {
      return NextResponse.json(
        { error: 'Rozpočet nebol nájdený' },
        { status: 404 }
      );
    }

    // Celkové štatistiky
    const totalPlanned = budget.items.reduce((sum, item) => sum + Number(item.plannedAmount), 0);
    const totalSpent = budget.items.reduce((sum, item) => 
      sum + item.expenses.reduce((expSum, exp) => expSum + Number(exp.amount), 0), 0
    );
    const utilizationPercentage = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0;

    // Štatistiky po kategóriách
    const categoryBreakdown = budget.categories.map(category => {
      const categoryItems = budget.items.filter(item => item.categoryId === category.id);
      const categoryPlanned = categoryItems.reduce((sum, item) => sum + Number(item.plannedAmount), 0);
      const categorySpent = categoryItems.reduce((sum, item) => 
        sum + item.expenses.reduce((expSum, exp) => expSum + Number(exp.amount), 0), 0
      );
      const categoryUtilization = categoryPlanned > 0 ? (categorySpent / categoryPlanned) * 100 : 0;

      return {
        id: category.id,
        name: category.name,
        code: category.code,
        maxLimit: category.maxLimit ? Number(category.maxLimit) : null,
        planned: categoryPlanned,
        spent: categorySpent,
        remaining: categoryPlanned - categorySpent,
        utilization: Math.round(categoryUtilization * 100) / 100,
        itemsCount: categoryItems.length,
        isOverLimit: category.maxLimit ? categoryUtilization > Number(category.maxLimit) : false
      };
    });

    // Štatistiky po partneroch
    const partnerBreakdown = budget.partners.map(partner => {
      const partnerItems = budget.items.filter(item => item.partnerId === partner.id);
      const partnerPlanned = partnerItems.reduce((sum, item) => sum + Number(item.plannedAmount), 0);
      const partnerSpent = partnerItems.reduce((sum, item) => 
        sum + item.expenses.reduce((expSum, exp) => expSum + Number(exp.amount), 0), 0
      );
      const partnerUtilization = partnerPlanned > 0 ? (partnerSpent / partnerPlanned) * 100 : 0;

      return {
        id: partner.id,
        name: partner.partnerName,
        allocation: Number(partner.allocation),
        planned: partnerPlanned,
        spent: partnerSpent,
        remaining: partnerPlanned - partnerSpent,
        utilization: Math.round(partnerUtilization * 100) / 100,
        itemsCount: partnerItems.length
      };
    });

    // Top 5 najväčších položiek
    const topItems = budget.items
      .map(item => ({
        id: item.id,
        itemNumber: item.itemNumber,
        name: item.name,
        categoryName: item.category.name,
        planned: Number(item.plannedAmount),
        spent: item.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0),
        utilization: Number(item.plannedAmount) > 0 ? 
          (item.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0) / Number(item.plannedAmount)) * 100 : 0
      }))
      .sort((a, b) => b.planned - a.planned)
      .slice(0, 5);

    // Mesačný trend (ak je zadaný rok)
    let monthlyTrend = null;
    if (year) {
      const months = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const monthStart = new Date(`${year}-${month.toString().padStart(2, '0')}-01`);
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

        const monthlyExpenses = budget.items.reduce((sum, item) => {
          const monthExpenses = item.expenses.filter(exp => 
            exp.date >= monthStart && exp.date <= monthEnd
          );
          return sum + monthExpenses.reduce((expSum, exp) => expSum + Number(exp.amount), 0);
        }, 0);

        return {
          month: month,
          monthName: monthStart.toLocaleDateString('sk-SK', { month: 'long' }),
          spent: monthlyExpenses,
          planned: totalPlanned / 12 // Rovnomerné rozdelenie
        };
      });

      monthlyTrend = months;
    }

    // Výdavky čakajúce na schválenie
    const pendingExpenses = await prisma.expense.findMany({
      where: {
        budgetItem: {
          budgetId: budgetId
        },
        status: 'PENDING'
      },
      include: {
        budgetItem: {
          include: {
            category: true
          }
        }
      }
    });

    const pendingAmount = pendingExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    const summary = {
      budget: {
        id: budget.id,
        projectName: budget.projectName,
        totalAmount: Number(budget.totalAmount),
        currency: budget.currency,
        status: budget.status,
        startDate: budget.startDate,
        endDate: budget.endDate
      },
      overview: {
        totalPlanned,
        totalSpent,
        remaining: totalPlanned - totalSpent,
        utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
        pendingAmount,
        availableAmount: totalPlanned - totalSpent - pendingAmount
      },
      breakdown: {
        categories: categoryBreakdown,
        partners: partnerBreakdown
      },
      topItems,
      monthlyTrend,
      alerts: {
        overBudgetCategories: categoryBreakdown.filter(cat => cat.isOverLimit),
        lowBudgetItems: budget.items
          .filter(item => {
            const spent = item.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
            const utilization = Number(item.plannedAmount) > 0 ? (spent / Number(item.plannedAmount)) * 100 : 0;
            return utilization > 90;
          })
          .map(item => ({
            id: item.id,
            itemNumber: item.itemNumber,
            name: item.name,
            utilization: Math.round(
              (item.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0) / Number(item.plannedAmount)) * 100 * 100
            ) / 100
          }))
      },
      pendingExpenses: pendingExpenses.map(exp => ({
        id: exp.id,
        amount: Number(exp.amount),
        description: exp.description,
        date: exp.date,
        categoryName: exp.budgetItem.category.name,
        itemName: exp.budgetItem.name
      }))
    };

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Chyba pri získavaní súhrnu rozpočtu:', error);
    return NextResponse.json(
      { error: 'Chyba pri získavaní súhrnu rozpočtu' },
      { status: 500 }
    );
  }
}

