'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Euro,
  Calendar,
  FileText,
  User,
  Building,
  TrendingUp,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface Expense {
  id: string;
  amount: number;
  date: string;
  description: string;
  supplierName?: string;
  supplierIco?: string;
  invoiceNumber?: string;
  status: string;
  createdAt: string;
  budgetItem: {
    id: string;
    name: string;
    itemNumber: string;
    category: {
      name: string;
      code: string;
    };
    partner?: {
      partnerName: string;
    };
    budget: {
      id: string;
      projectName: string;
    };
  };
  documents: any[];
  stats: {
    documentsCount: number;
    approvalsCount: number;
    pendingApprovalsCount: number;
    approvedApprovalsCount: number;
    rejectedApprovalsCount: number;
    latestApproval?: {
      status: string;
      approverName: string;
      approverRole: string;
      comment?: string;
      approvedAt?: string;
    };
  };
}

interface PendingExpense extends Expense {
  approvalInfo: {
    approvedCount: number;
    rejectedCount: number;
    pendingCount: number;
    totalApprovals: number;
    canUserApprove: boolean;
    userApproverLevel: number;
  };
  budgetInfo: {
    currentUtilization: number;
    wouldExceedBudget: boolean;
    exceedAmount: number;
    remainingBudget: number;
  };
  priority: string;
  daysWaiting: number;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pendingExpenses, setPendingExpenses] = useState<PendingExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mock user ID - v reálnej aplikácii by sa získal z autentifikácie
  const currentUserId = 'user-1';

  useEffect(() => {
    fetchExpenses();
    fetchPendingExpenses();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/expenses?${params}`);
      const data = await response.json();
      
      setExpenses(data.expenses || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Chyba pri načítavaní výdavkov:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingExpenses = async () => {
    try {
      const response = await fetch(`/api/expenses/pending?userId=${currentUserId}`);
      const data = await response.json();
      setPendingExpenses(data.expenses || []);
    } catch (error) {
      console.error('Chyba pri načítavaní čakajúcich výdavkov:', error);
    }
  };

  const handleApprove = async (expenseId: string, status: 'APPROVED' | 'REJECTED', comment?: string) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approverId: currentUserId,
          status,
          comment
        }),
      });

      if (response.ok) {
        // Refresh data
        fetchExpenses();
        fetchPendingExpenses();
      }
    } catch (error) {
      console.error('Chyba pri schvaľovaní výdavku:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PAID': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      case 'PAID': return <Euro className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
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
            <h1 className="text-3xl font-bold text-gray-900">Správa výdavkov</h1>
            <p className="text-gray-600 mt-1">Prehľad a schvaľovanie výdavkov v rozpočte</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nový výdavok
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Input
                  placeholder="Hľadať výdavky..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Stav" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všetky stavy</SelectItem>
                  <SelectItem value="PENDING">Čakajúce</SelectItem>
                  <SelectItem value="APPROVED">Schválené</SelectItem>
                  <SelectItem value="REJECTED">Zamietnuté</SelectItem>
                  <SelectItem value="PAID">Zaplatené</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Obdobie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všetky obdobia</SelectItem>
                  <SelectItem value="today">Dnes</SelectItem>
                  <SelectItem value="week">Tento týždeň</SelectItem>
                  <SelectItem value="month">Tento mesiac</SelectItem>
                  <SelectItem value="quarter">Tento kvartál</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Všetky výdavky</TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              Čakajúce na schválenie
              {pendingExpenses.length > 0 && (
                <Badge className="bg-red-100 text-red-800 ml-1">
                  {pendingExpenses.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="my">Moje výdavky</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Všetky výdavky
                </CardTitle>
                <CardDescription>
                  Kompletný prehľad všetkých výdavkov v systéme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-lg">{expense.description}</h4>
                            <Badge className={getStatusColor(expense.status)}>
                              {getStatusIcon(expense.status)}
                              <span className="ml-1">{expense.status}</span>
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              <span>{expense.budgetItem.budget.projectName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>{expense.budgetItem.category.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(expense.date)}</span>
                            </div>
                            {expense.supplierName && (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{expense.supplierName}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-2 text-sm text-gray-600">
                            <span>Položka: {expense.budgetItem.itemNumber} - {expense.budgetItem.name}</span>
                          </div>

                          {expense.stats.latestApproval && (
                            <div className="mt-2 text-sm text-gray-600">
                              <span>Posledné schválenie: {expense.stats.latestApproval.approverName} ({expense.stats.latestApproval.approverRole})</span>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(expense.amount)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">
                              {expense.stats.documentsCount} dokumentov
                            </Badge>
                            <Badge variant="outline">
                              {expense.stats.approvalsCount} schválení
                            </Badge>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button 
                      variant="outline" 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Predchádzajúca
                    </Button>
                    <span className="text-sm text-gray-600">
                      Strana {currentPage} z {totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Ďalšia
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Výdavky čakajúce na schválenie
                </CardTitle>
                <CardDescription>
                  Výdavky, ktoré potrebujú vaše schválenie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingExpenses.map((expense) => (
                    <div key={expense.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-lg">{expense.description}</h4>
                            <Badge className={getPriorityColor(expense.priority)}>
                              {expense.priority === 'HIGH' && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {expense.priority}
                            </Badge>
                            <Badge variant="outline">
                              {expense.daysWaiting} dní čaká
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">Projekt:</span> {expense.budgetItem.budget.projectName}
                            </div>
                            <div>
                              <span className="font-medium">Kategória:</span> {expense.budgetItem.category.name}
                            </div>
                            <div>
                              <span className="font-medium">Dátum:</span> {formatDate(expense.date)}
                            </div>
                          </div>

                          <div className="text-sm text-gray-600 mb-3">
                            <span className="font-medium">Položka:</span> {expense.budgetItem.itemNumber} - {expense.budgetItem.name}
                          </div>

                          {expense.budgetInfo.wouldExceedBudget && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                              <div className="flex items-center gap-2 text-red-800">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-medium">Upozornenie: Prekročenie rozpočtu</span>
                              </div>
                              <p className="text-sm text-red-700 mt-1">
                                Tento výdavok by prekročil rozpočet o {formatCurrency(expense.budgetInfo.exceedAmount)}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Schválenia: {expense.approvalInfo.approvedCount}/{expense.approvalInfo.totalApprovals}</span>
                            <span>Využitie rozpočtu: {expense.budgetInfo.currentUtilization}%</span>
                            <span>Zostáva: {formatCurrency(expense.budgetInfo.remainingBudget)}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900 mb-4">
                            {formatCurrency(expense.amount)}
                          </p>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(expense.id, 'APPROVED')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Schváliť
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                              onClick={() => handleApprove(expense.id, 'REJECTED')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Zamietnuť
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {pendingExpenses.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Žiadne výdavky nečakajú na vaše schválenie</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

