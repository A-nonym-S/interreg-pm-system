'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Euro, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  Users,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Search,
  Plus,
  Download,
  Upload
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BudgetStats {
  totalPlanned: number;
  totalSpent: number;
  remaining: number;
  utilizationPercentage: number;
  itemsCount: number;
  categoriesCount: number;
  partnersCount: number;
}

interface Budget {
  id: string;
  projectName: string;
  totalAmount: number;
  currency: string;
  status: string;
  startDate: string;
  endDate: string;
  stats: BudgetStats;
}

interface CategoryStat {
  id: string;
  name: string;
  code: string;
  planned: number;
  spent: number;
  utilization: number;
  itemsCount: number;
  isOverLimit: boolean;
}

interface RecentExpense {
  id: string;
  amount: number;
  description: string;
  date: string;
  status: string;
  categoryName: string;
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<RecentExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBudgets();
  }, []);

  useEffect(() => {
    if (budgets.length > 0 && !selectedBudget) {
      setSelectedBudget(budgets[0]);
      fetchBudgetDetails(budgets[0].id);
    }
  }, [budgets]);

  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/budget');
      const data = await response.json();
      setBudgets(data.budgets || []);
    } catch (error) {
      console.error('Chyba pri načítavaní rozpočtov:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetDetails = async (budgetId: string) => {
    try {
      const [budgetResponse, summaryResponse] = await Promise.all([
        fetch(`/api/budget/${budgetId}`),
        fetch(`/api/budget/summary?budgetId=${budgetId}`)
      ]);

      const budgetData = await budgetResponse.json();
      const summaryData = await summaryResponse.json();

      setSelectedBudget(budgetData);
      setCategoryStats(summaryData.breakdown?.categories || []);
      setRecentExpenses(summaryData.recentExpenses || []);
    } catch (error) {
      console.error('Chyba pri načítavaní detailov rozpočtu:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'ARCHIVED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExpenseStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PAID': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rozpočtový modul</h1>
            <p className="text-gray-600 mt-1">Správa rozpočtov a výdavkov INTERREG projektov</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import Excel
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nový rozpočet
            </Button>
          </div>
        </div>

        {/* Budget Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Výber rozpočtu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Select 
                  value={selectedBudget?.id || ''} 
                  onValueChange={(value) => {
                    const budget = budgets.find(b => b.id === value);
                    if (budget) {
                      setSelectedBudget(budget);
                      fetchBudgetDetails(budget.id);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte rozpočet" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgets.map((budget) => (
                      <SelectItem key={budget.id} value={budget.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{budget.projectName}</span>
                          <Badge className={`ml-2 ${getStatusColor(budget.status)}`}>
                            {budget.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Hľadať..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedBudget && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Celkový rozpočet</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(selectedBudget.stats.totalPlanned)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Euro className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Vyčerpané</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(selectedBudget.stats.totalSpent)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedBudget.stats.utilizationPercentage.toFixed(1)}% využitie
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Zostáva</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(selectedBudget.stats.remaining)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <TrendingDown className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Položky</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedBudget.stats.itemsCount}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedBudget.stats.categoriesCount} kategórií
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Bar */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Celkové využitie rozpočtu</h3>
                    <Badge className={selectedBudget.stats.utilizationPercentage > 90 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                      {selectedBudget.stats.utilizationPercentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <Progress 
                    value={selectedBudget.stats.utilizationPercentage} 
                    className="h-3"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Vyčerpané: {formatCurrency(selectedBudget.stats.totalSpent)}</span>
                    <span>Zostáva: {formatCurrency(selectedBudget.stats.remaining)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="categories" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="categories">Kategórie</TabsTrigger>
                <TabsTrigger value="items">Položky</TabsTrigger>
                <TabsTrigger value="expenses">Výdavky</TabsTrigger>
                <TabsTrigger value="reports">Reporty</TabsTrigger>
              </TabsList>

              <TabsContent value="categories" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Rozpočet po kategóriách
                    </CardTitle>
                    <CardDescription>
                      Prehľad čerpania rozpočtu podľa kategórií
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoryStats.map((category) => (
                        <div key={category.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{category.name}</h4>
                              <p className="text-sm text-gray-600">{category.code}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(category.spent)}</p>
                              <p className="text-sm text-gray-600">z {formatCurrency(category.planned)}</p>
                            </div>
                          </div>
                          <Progress value={category.utilization} className="h-2 mb-2" />
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{category.itemsCount} položiek</span>
                            <div className="flex items-center gap-2">
                              <Badge className={category.utilization > 90 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                                {category.utilization.toFixed(1)}%
                              </Badge>
                              {category.isOverLimit && (
                                <Badge className="bg-red-100 text-red-800">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Prekročený limit
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="expenses" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Posledné výdavky
                    </CardTitle>
                    <CardDescription>
                      Najnovšie výdavky v rozpočte
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentExpenses.map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{expense.description}</p>
                            <p className="text-sm text-gray-600">{expense.categoryName}</p>
                            <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                            <Badge className={getExpenseStatusColor(expense.status)}>
                              {expense.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

