'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  MessageSquare,
  User,
  Calendar,
  Shield,
  ArrowLeft,
  Send,
  AlertTriangle,
  Globe
} from 'lucide-react';

interface ApprovalItem {
  id: string;
  contentId: string;
  title: string;
  contentType: string;
  platforms: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  submittedBy: string;
  complianceScore?: number;
  approver?: string;
  approvedAt?: string;
  comments?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      // Simulácia načítania dát
      const mockApprovals: ApprovalItem[] = [
        {
          id: '1',
          contentId: '2',
          title: 'Konferencia o cezhraničnej spolupráci',
          contentType: 'EVENT',
          platforms: ['WEB', 'FACEBOOK', 'WHATSAPP'],
          status: 'PENDING',
          submittedAt: '2025-01-08T09:15:00Z',
          submittedBy: 'Peter Kováč',
          complianceScore: 82,
          priority: 'HIGH'
        },
        {
          id: '2',
          contentId: '6',
          title: 'Nové vybavenie pre laboratórium',
          contentType: 'NEWS',
          platforms: ['WEB', 'FACEBOOK'],
          status: 'PENDING',
          submittedAt: '2025-01-08T11:30:00Z',
          submittedBy: 'Anna Svoboda',
          complianceScore: 91,
          priority: 'MEDIUM'
        },
        {
          id: '3',
          contentId: '7',
          title: 'Workshop pre zdravotníkov',
          contentType: 'ANNOUNCEMENT',
          platforms: ['WEB', 'WHATSAPP'],
          status: 'PENDING',
          submittedAt: '2025-01-08T14:45:00Z',
          submittedBy: 'Marek Horváth',
          complianceScore: 76,
          priority: 'LOW'
        },
        {
          id: '4',
          contentId: '4',
          title: 'Tlačová správa - Nové vybavenie',
          contentType: 'PRESS_RELEASE',
          platforms: ['WEB', 'FACEBOOK'],
          status: 'APPROVED',
          submittedAt: '2025-01-07T16:20:00Z',
          submittedBy: 'Marek Horváth',
          complianceScore: 91,
          approver: 'Jana Novákova',
          approvedAt: '2025-01-08T08:30:00Z',
          comments: 'Obsah je v súlade s požiadavkami. Schvaľujem na publikovanie.',
          priority: 'MEDIUM'
        },
        {
          id: '5',
          contentId: '5',
          title: 'Pozvánka na workshop',
          contentType: 'ANNOUNCEMENT',
          platforms: ['WEB', 'WHATSAPP'],
          status: 'REJECTED',
          submittedAt: '2025-01-07T14:10:00Z',
          submittedBy: 'Lucia Tóthová',
          complianceScore: 65,
          approver: 'Jana Novákova',
          approvedAt: '2025-01-07T18:45:00Z',
          comments: 'Chýba povinný disclaimer a kontaktné informácie. Prosím doplňte a pošlite znovu na schválenie.',
          priority: 'LOW'
        }
      ];

      setApprovals(mockApprovals);
      setLoading(false);
    } catch (error) {
      console.error('Chyba pri načítaní schválení:', error);
      setLoading(false);
    }
  };

  const handleApproval = async (approvalId: string, action: 'APPROVED' | 'REJECTED') => {
    if (!comments.trim() && action === 'REJECTED') {
      alert('Prosím zadajte komentár pri zamietnutí');
      return;
    }

    setProcessing(true);
    try {
      // Simulácia API volania
      await new Promise(resolve => setTimeout(resolve, 1500));

      setApprovals(prev => prev.map(approval => 
        approval.id === approvalId 
          ? {
              ...approval,
              status: action,
              approver: 'Jana Novákova', // Aktuálny používateľ
              approvedAt: new Date().toISOString(),
              comments: comments.trim() || undefined
            }
          : approval
      ));

      setSelectedApproval(null);
      setComments('');
      
      alert(action === 'APPROVED' ? 'Obsah bol schválený' : 'Obsah bol zamietnutý');
      
    } catch (error) {
      console.error('Chyba pri schvaľovaní:', error);
      alert('Chyba pri spracovaní schválenia');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-500';
      case 'REJECTED': return 'bg-red-500';
      case 'PENDING': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Schválené';
      case 'REJECTED': return 'Zamietnuté';
      case 'PENDING': return 'Čaká na schválenie';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'Vysoká';
      case 'MEDIUM': return 'Stredná';
      case 'LOW': return 'Nízka';
      default: return priority;
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

  const filterApprovals = (status: string) => {
    if (status === 'pending') return approvals.filter(a => a.status === 'PENDING');
    if (status === 'approved') return approvals.filter(a => a.status === 'APPROVED');
    if (status === 'rejected') return approvals.filter(a => a.status === 'REJECTED');
    return approvals;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam schválenia...</p>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Schvaľovanie obsahu</h1>
              <p className="text-gray-600">Správa a schvaľovanie publicity materiálov</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Approval List */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Zoznam na schválenie</CardTitle>
                <CardDescription>
                  Obsah čakajúci na vaše schválenie alebo zamietnutie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Čakajúce ({filterApprovals('pending').length})
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Schválené ({filterApprovals('approved').length})
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Zamietnuté ({filterApprovals('rejected').length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="pending" className="mt-6">
                    <div className="space-y-4">
                      {filterApprovals('pending').map((approval) => (
                        <div 
                          key={approval.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedApproval?.id === approval.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedApproval(approval)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 mb-1">{approval.title}</h3>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <Badge variant="outline">{getContentTypeText(approval.contentType)}</Badge>
                                <Badge className={getPriorityColor(approval.priority)}>
                                  {getPriorityText(approval.priority)}
                                </Badge>
                                <span>od {approval.submittedBy}</span>
                                <span>{new Date(approval.submittedAt).toLocaleDateString('sk-SK')}</span>
                              </div>
                            </div>
                            {approval.complianceScore && (
                              <div className="flex items-center gap-1 text-sm">
                                <Shield className="w-4 h-4" />
                                <span className={getComplianceColor(approval.complianceScore)}>
                                  {approval.complianceScore}%
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {approval.platforms.map((platform, index) => (
                              <span key={index} className="flex items-center text-gray-500">
                                {getPlatformIcon(platform)}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                      {filterApprovals('pending').length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Žiadny obsah nečaká na schválenie</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="approved" className="mt-6">
                    <div className="space-y-4">
                      {filterApprovals('approved').map((approval) => (
                        <div key={approval.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 mb-1">{approval.title}</h3>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <Badge variant="outline">{getContentTypeText(approval.contentType)}</Badge>
                                <span>schválil {approval.approver}</span>
                                <span>{approval.approvedAt && new Date(approval.approvedAt).toLocaleDateString('sk-SK')}</span>
                              </div>
                            </div>
                            <Badge className="bg-green-500 text-white">Schválené</Badge>
                          </div>
                          {approval.comments && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg">
                              <p className="text-sm text-green-800">{approval.comments}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="rejected" className="mt-6">
                    <div className="space-y-4">
                      {filterApprovals('rejected').map((approval) => (
                        <div key={approval.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 mb-1">{approval.title}</h3>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <Badge variant="outline">{getContentTypeText(approval.contentType)}</Badge>
                                <span>zamietol {approval.approver}</span>
                                <span>{approval.approvedAt && new Date(approval.approvedAt).toLocaleDateString('sk-SK')}</span>
                              </div>
                            </div>
                            <Badge className="bg-red-500 text-white">Zamietnuté</Badge>
                          </div>
                          {approval.comments && (
                            <div className="mt-3 p-3 bg-red-50 rounded-lg">
                              <p className="text-sm text-red-800">{approval.comments}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Approval Detail */}
          <div>
            {selectedApproval ? (
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Detail na schválenie
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">{selectedApproval.title}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Typ:</span>
                        <span>{getContentTypeText(selectedApproval.contentType)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Autor:</span>
                        <span>{selectedApproval.submittedBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Odoslané:</span>
                        <span>{new Date(selectedApproval.submittedAt).toLocaleDateString('sk-SK')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Priorita:</span>
                        <Badge className={getPriorityColor(selectedApproval.priority)}>
                          {getPriorityText(selectedApproval.priority)}
                        </Badge>
                      </div>
                      {selectedApproval.complianceScore && (
                        <div className="flex justify-between">
                          <span>Súlad:</span>
                          <span className={getComplianceColor(selectedApproval.complianceScore)}>
                            {selectedApproval.complianceScore}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Platformy:</h4>
                    <div className="flex gap-2">
                      {selectedApproval.platforms.map((platform, index) => (
                        <div key={index} className="flex items-center gap-1 text-sm text-gray-600">
                          {getPlatformIcon(platform)}
                          <span>{platform}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/publicity/content/${selectedApproval.contentId}`}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Zobraziť obsah
                    </Button>
                  </div>

                  {selectedApproval.status === 'PENDING' && (
                    <>
                      <div>
                        <Label htmlFor="comments">Komentár (povinný pri zamietnutí)</Label>
                        <Textarea
                          id="comments"
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          placeholder="Zadajte komentár k schváleniu alebo zamietnutiu..."
                          rows={4}
                          className="mt-1"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleApproval(selectedApproval.id, 'APPROVED')}
                          disabled={processing}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {processing ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Schváliť
                        </Button>
                        <Button
                          onClick={() => handleApproval(selectedApproval.id, 'REJECTED')}
                          disabled={processing}
                          variant="outline"
                          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {processing ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                          ) : (
                            <XCircle className="w-4 h-4 mr-2" />
                          )}
                          Zamietnuť
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white shadow-sm">
                <CardContent className="py-12 text-center">
                  <div className="text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Vyberte obsah na schválenie</p>
                    <p className="text-sm">Kliknite na položku v zozname pre zobrazenie detailov</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

