'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  PlusCircle, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Users,
  Globe,
  MessageSquare,
  BarChart3,
  Sparkles,
  Shield
} from 'lucide-react';

interface DashboardStats {
  totalContent: number;
  pendingApproval: number;
  published: number;
  aiGenerated: number;
  complianceScore: number;
  documentsUploaded: number;
}

interface RecentContent {
  id: string;
  title: string;
  contentType: string;
  status: string;
  createdAt: string;
  complianceScore?: number;
  platforms: string[];
}

export default function PublicityDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalContent: 0,
    pendingApproval: 0,
    published: 0,
    aiGenerated: 0,
    complianceScore: 0,
    documentsUploaded: 0
  });
  const [recentContent, setRecentContent] = useState<RecentContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulácia načítania dát - v reálnej implementácii by tu boli API volania
      setStats({
        totalContent: 24,
        pendingApproval: 3,
        published: 18,
        aiGenerated: 15,
        complianceScore: 87,
        documentsUploaded: 12
      });

      setRecentContent([
        {
          id: '1',
          title: 'Nová nemocničná technológia inštalovaná',
          contentType: 'NEWS',
          status: 'PUBLISHED',
          createdAt: '2025-01-08T10:30:00Z',
          complianceScore: 95,
          platforms: ['WEB', 'FACEBOOK']
        },
        {
          id: '2',
          title: 'Konferencia o cezhraničnej spolupráci',
          contentType: 'EVENT',
          status: 'PENDING_APPROVAL',
          createdAt: '2025-01-08T09:15:00Z',
          complianceScore: 82,
          platforms: ['WEB', 'FACEBOOK', 'WHATSAPP']
        },
        {
          id: '3',
          title: 'Míľnik projektu dosiahnutý',
          contentType: 'MILESTONE',
          status: 'DRAFT',
          createdAt: '2025-01-08T08:45:00Z',
          complianceScore: 78,
          platforms: ['WEB']
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Chyba pri načítaní dashboard dát:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-500';
      case 'PENDING_APPROVAL': return 'bg-yellow-500';
      case 'APPROVED': return 'bg-blue-500';
      case 'DRAFT': return 'bg-gray-500';
      case 'REJECTED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'Publikované';
      case 'PENDING_APPROVAL': return 'Čaká na schválenie';
      case 'APPROVED': return 'Schválené';
      case 'DRAFT': return 'Koncept';
      case 'REJECTED': return 'Zamietnuté';
      default: return status;
    }
  };

  const getContentTypeText = (type: string) => {
    switch (type) {
      case 'NEWS': return 'Novinky';
      case 'EVENT': return 'Udalosť';
      case 'MILESTONE': return 'Míľnik';
      case 'POST': return 'Príspevok';
      case 'ANNOUNCEMENT': return 'Oznámenie';
      default: return type;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'WEB': return <Globe className="w-4 h-4" />;
      case 'FACEBOOK': return <MessageSquare className="w-4 h-4" />;
      case 'WHATSAPP': return <MessageSquare className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Publicity & Marketing
              </h1>
              <p className="text-gray-600">
                Správa obsahu a marketingových materiálov pre INTERREG HUSKROUA projekt
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => window.location.href = '/publicity/content/new'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Nový obsah
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/publicity/documents'}
              >
                <FileText className="w-4 h-4 mr-2" />
                Dokumenty
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Celkový obsah
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalContent}</div>
              <p className="text-xs text-gray-500 mt-1">
                +3 tento týždeň
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Čaká na schválenie
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.pendingApproval}</div>
              <p className="text-xs text-gray-500 mt-1">
                Vyžaduje pozornosť
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Publikované
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.published}</div>
              <p className="text-xs text-gray-500 mt-1">
                75% úspešnosť
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                AI generované
              </CardTitle>
              <Sparkles className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.aiGenerated}</div>
              <p className="text-xs text-gray-500 mt-1">
                62% z celkového obsahu
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Content */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Najnovší obsah
                </CardTitle>
                <CardDescription>
                  Prehľad nedávno vytvorených materiálov
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentContent.map((content) => (
                    <div 
                      key={content.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/publicity/content/${content.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">{content.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {getContentTypeText(content.contentType)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{new Date(content.createdAt).toLocaleDateString('sk-SK')}</span>
                          <div className="flex items-center gap-1">
                            {content.platforms.map((platform, index) => (
                              <span key={index} className="flex items-center">
                                {getPlatformIcon(platform)}
                              </span>
                            ))}
                          </div>
                          {content.complianceScore && (
                            <div className="flex items-center gap-1">
                              <Shield className="w-4 h-4" />
                              <span>{content.complianceScore}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(content.status)} text-white`}>
                          {getStatusText(content.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = '/publicity/content'}
                  >
                    Zobraziť všetok obsah
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Compliance Score */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Súlad s požiadavkami
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Celkové skóre</span>
                      <span className="text-lg font-bold text-green-600">{stats.complianceScore}%</span>
                    </div>
                    <Progress value={stats.complianceScore} className="h-2" />
                  </div>
                  <div className="text-sm text-gray-500">
                    Výborné dodržiavanie INTERREG štandardov
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Rýchle akcie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/publicity/generate'}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI generátor obsahu
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/publicity/approvals'}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Schvaľovanie ({stats.pendingApproval})
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/publicity/analytics'}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytika
                </Button>
              </CardContent>
            </Card>

            {/* Documents Status */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Dokumentácia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Nahrané dokumenty</span>
                    <span className="font-medium">{stats.documentsUploaded}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Spracované AI</span>
                    <span className="font-medium">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Kontrolné listy</span>
                    <span className="font-medium">15</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => window.location.href = '/publicity/documents'}
                  >
                    Spravovať dokumenty
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

