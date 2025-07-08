import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/budget/[id] - Získanie konkrétneho rozpočtu
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        partners: {
          include: {
            items: {
              include: {
                category: true,
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
                      }
                    }
                  }
                }
              }
            }
          }
        },
        categories: {
          include: {
            items: {
              include: {
                partner: true,
                expenses: true
              }
            }
          }
        },
        items: {
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
          orderBy: { itemNumber: 'asc' }
        },
        imports: {
          orderBy: { importedAt: 'desc' }
        }
      }
    });

    if (!budget) {
      return NextResponse.json(
        { error: 'Rozpočet nebol nájdený' },
        { status: 404 }
      );
    }

    // Výpočet detailných štatistík
    const totalPlanned = budget.items.reduce((sum, item) => sum + Number(item.plannedAmount), 0);
    const totalSpent = budget.items.reduce((sum, item) => sum + Number(item.spentAmount), 0);
    const utilizationPercentage = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0;

    // Štatistiky po kategóriách
    const categoryStats = budget.categories.map(category => {
      const categoryPlanned = category.items.reduce((sum, item) => sum + Number(item.plannedAmount), 0);
      const categorySpent = category.items.reduce((sum, item) => sum + Number(item.spentAmount), 0);
      const categoryUtilization = categoryPlanned > 0 ? (categorySpent / categoryPlanned) * 100 : 0;

      return {
        id: category.id,
        name: category.name,
        code: category.code,
        maxLimit: category.maxLimit,
        planned: categoryPlanned,
        spent: categorySpent,
        remaining: categoryPlanned - categorySpent,
        utilization: Math.round(categoryUtilization * 100) / 100,
        itemsCount: category.items.length
      };
    });

    // Štatistiky po partneroch
    const partnerStats = budget.partners.map(partner => {
      const partnerPlanned = partner.items.reduce((sum, item) => sum + Number(item.plannedAmount), 0);
      const partnerSpent = partner.items.reduce((sum, item) => sum + Number(item.spentAmount), 0);
      const partnerUtilization = partnerPlanned > 0 ? (partnerSpent / partnerPlanned) * 100 : 0;

      return {
        id: partner.id,
        name: partner.partnerName,
        allocation: Number(partner.allocation),
        planned: partnerPlanned,
        spent: partnerSpent,
        remaining: partnerPlanned - partnerSpent,
        utilization: Math.round(partnerUtilization * 100) / 100,
        itemsCount: partner.items.length
      };
    });

    // Posledné výdavky
    const recentExpenses = await prisma.expense.findMany({
      where: {
        budgetItem: {
          budgetId: id
        }
      },
      include: {
        budgetItem: {
          include: {
            category: true
          }
        },
        documents: true,
        approvals: {
          include: {
            approver: {
              select: {
                name: true,
                role: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const budgetWithStats = {
      ...budget,
      stats: {
        totalPlanned,
        totalSpent,
        remaining: totalPlanned - totalSpent,
        utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
        itemsCount: budget.items.length,
        categoriesCount: budget.categories.length,
        partnersCount: budget.partners.length,
        categoryStats,
        partnerStats,
        recentExpenses
      }
    };

    return NextResponse.json(budgetWithStats);

  } catch (error) {
    console.error('Chyba pri získavaní rozpočtu:', error);
    return NextResponse.json(
      { error: 'Chyba pri získavaní rozpočtu' },
      { status: 500 }
    );
  }
}

// DELETE /api/budget/[id] - Zmazanie rozpočtu
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Kontrola existencie rozpočtu
    const existingBudget = await prisma.budget.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            expenses: true
          }
        }
      }
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: 'Rozpočet nebol nájdený' },
        { status: 404 }
      );
    }

    // Kontrola, či rozpočet má výdavky
    const hasExpenses = existingBudget.items.some(item => item.expenses.length > 0);
    if (hasExpenses) {
      return NextResponse.json(
        { error: 'Nemožno zmazať rozpočet, ktorý má výdavky' },
        { status: 400 }
      );
    }

    // Zmazanie rozpočtu (kaskádové zmazanie cez Prisma)
    await prisma.budget.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Rozpočet bol úspešne zmazaný' });

  } catch (error) {
    console.error('Chyba pri mazaní rozpočtu:', error);
    return NextResponse.json(
      { error: 'Chyba pri mazaní rozpočtu' },
      { status: 500 }
    );
  }
}

