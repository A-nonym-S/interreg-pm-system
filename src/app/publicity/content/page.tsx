'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Eye, 
  Edit, 
  Trash2,
  Globe,
  MessageSquare,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  MoreHorizontal
} from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  contentType: string;
  status: string;
  platforms: string[];
  createdAt: string;
  createdBy: string;
  complianceScore?: number;
  aiGenerated: boolean;
  approvals: number;
  publications: number;
}

export default function ContentListPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    filterContent();
  }, [content, searchTerm, statusFilter, typeFilter, platformFilter]);

  const fetchContent = async () => {
    try {
      // Simulácia načítania dát
      const mockContent: ContentItem[] = [
        {
          id: '1',
          title: 'Nová nemocničná technológia inštalovaná',
          contentType: 'NEWS',
          status: 'PUBLISHED',
          platforms: ['WEB', 'FACEBOOK'],
          createdAt: '2025-01-08T10:30:00Z',
          createdBy: 'Jana Novákova',
          complianceScore: 95,
          aiGenerated: true,
          approvals: 2,
          publications: 2
        },
        {
          id: '2',
          title: 'Konferencia o cezhraničnej spolupráci',
          contentType: 'EVENT',
          status: 'PENDING_APPROVAL',
          platforms: ['WEB', 'FACEBOOK', 'WHATSAPP'],
          createdAt: '2025-01-08T09:15:00Z',
          createdBy: 'Peter Kováč',
          complianceScore: 82,
          aiGenerated: false,
          approvals: 1,
          publications: 0
        },
        {
          id: '3',
          title: 'Míľnik projektu dosiahnutý',
          contentType: 'MILESTONE',
          status: 'DRAFT',
          platforms: ['WEB'],
          createdAt: '2025-01-08T08:45:00Z',
          createdBy: 'Anna Svoboda',
          complianceScore: 78,
          aiGenerated: true,
          approvals: 0,
          publications: 0
        },
        {
          id: '4',
          title: 'Tlačová správa - Nové vybavenie',
          contentType: 'PRESS_RELEASE',
          status: 'APPROVED',
          platforms: ['WEB', 'FACEBOOK'],
          createdAt: '2025-01-07T16:20:00Z',
          createdBy: 'Marek Horváth',
          complianceScore: 91,
          aiGenerated: false,
          approvals: 2,
          publications: 0
        },
        {
          id: '5',
          title: 'Pozvánka na workshop',
          contentType: 'ANNOUNCEMENT',
          status: 'REJECTED',
          platforms: ['WEB', 'WHATSAPP'],
          createdAt: '2025-01-07T14:10:00Z',
          createdBy: 'Lucia Tóthová',
          complianceScore: 65,
          aiGenerated: true,
          approvals: 1,
          publications: 0
        }
      ];

      setContent(mockContent);
      setLoading(false);
    } catch (error) {
      console.error('Chyba pri načítaní obsahu:', error);
      setLoading(false);
    }
  };

  const filterContent = () => {
    let filtered = content;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.contentType === typeFilter);
    }

    // Platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(item => item.platforms.includes(platformFilter));
    }

    setFilteredContent(filtered);
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
      case 'PRESS_RELEASE': return 'Tlačová správa';
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

  const getComplianceColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleDelete = async (id: string) => {
    if (confirm('Ste si istí, že chcete zmazať tento obsah?')) {
      // Simulácia zmazania
      setContent(prev => prev.filter(item => item.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam obsah...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/publicity'}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Späť
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Správa obsahu</h1>
              <p className="text-gray-600">Prehľad a správa všetkého publicity obsahu</p>
            </div>
            <Button 
              onClick={() => window.location.href = '/publicity/content/new'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Nový obsah
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white shadow-sm mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Hľadať obsah..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Všetky stavy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všetky stavy</SelectItem>
                  <SelectItem value="DRAFT">Koncept</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Čaká na schválenie</SelectItem>
                  <SelectItem value="APPROVED">Schválené</SelectItem>
                  <SelectItem value="PUBLISHED">Publikované</SelectItem>
                  <SelectItem value="REJECTED">Zamietnuté</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Všetky typy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všetky typy</SelectItem>
                  <SelectItem value="NEWS">Novinky</SelectItem>
                  <SelectItem value="EVENT">Udalosť</SelectItem>
                  <SelectItem value="MILESTONE">Míľnik</SelectItem>
                  <SelectItem value="ANNOUNCEMENT">Oznámenie</SelectItem>
                  <SelectItem value="PRESS_RELEASE">Tlačová správa</SelectItem>
                </SelectContent>
              </Select>

              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Všetky platformy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všetky platformy</SelectItem>
                  <SelectItem value="WEB">Web</SelectItem>
                  <SelectItem value="FACEBOOK">Facebook</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Content List */}
        <div className="space-y-4">
          {filteredContent.length === 0 ? (
            <Card className="bg-white shadow-sm">
              <CardContent className="py-12 text-center">
                <div className="text-gray-500 mb-4">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Žiadny obsah nenájdený</p>
                  <p className="text-sm">Skúste zmeniť filtre alebo vytvorte nový obsah</p>
                </div>
                <Button 
                  onClick={() => window.location.href = '/publicity/content/new'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Vytvoriť prvý obsah
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredContent.map((item) => (
              <Card key={item.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 
                          className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                          onClick={() => window.location.href = `/publicity/content/${item.id}`}
                        >
                          {item.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {getContentTypeText(item.contentType)}
                        </Badge>
                        {item.aiGenerated && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                            AI
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                        <span>Vytvoril: {item.createdBy}</span>
                        <span>{new Date(item.createdAt).toLocaleDateString('sk-SK')}</span>
                        <div className="flex items-center gap-1">
                          <span>Platformy:</span>
                          <div className="flex gap-1 ml-1">
                            {item.platforms.map((platform, index) => (
                              <span key={index} className="flex items-center">
                                {getPlatformIcon(platform)}
                              </span>
                            ))}
                          </div>
                        </div>
                        {item.complianceScore && (
                          <div className="flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            <span className={getComplianceColor(item.complianceScore)}>
                              {item.complianceScore}%
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          {item.approvals} schválení
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {item.publications} publikácií
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(item.status)} text-white`}>
                        {getStatusText(item.status)}
                      </Badge>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = `/publicity/content/${item.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = `/publicity/content/${item.id}/edit`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {item.status === 'DRAFT' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredContent.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Predchádzajúca
              </Button>
              <Button variant="outline" size="sm" className="bg-blue-600 text-white">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Ďalšia
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

