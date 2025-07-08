"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ComplianceBadge } from './compliance-badge';
import { ComplianceType, ComplianceStatus, ComplianceCheck } from '@/types';
import { api } from '@/lib/api';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  XCircle,
  RefreshCw,
  FileText,
  Shield,
  Database,
  BarChart,
  DollarSign,
  ShoppingBag
} from 'lucide-react';

interface ComplianceDashboardProps {
  initialChecks?: ComplianceCheck[];
}

export function ComplianceDashboard({ initialChecks }: ComplianceDashboardProps) {
  const [checks, setChecks] = useState<ComplianceCheck[]>(initialChecks || []);
  const [loading, setLoading] = useState(!initialChecks);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch compliance checks if not provided
  useEffect(() => {
    if (!initialChecks) {
      fetchComplianceChecks();
    }
  }, [initialChecks]);
  
  const fetchComplianceChecks = async () => {
    try {
      setLoading(true);
      const data = await api.compliance.getComplianceChecks();
      setChecks(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching compliance checks:', err);
      setError('Nepodarilo sa načítať compliance kontroly. Skúste to znova neskôr.');
    } finally {
      setLoading(false);
    }
  };
  
  // For demo purposes, if no data is available yet
  useEffect(() => {
    if (!initialChecks && loading) {
      // Simulate API response with mock data
      setTimeout(() => {
        setChecks([
          {
            id: '1',
            title: 'Vizuálna identita',
            description: 'Všetky materiály spĺňajú požiadavky INTERREG vizuálnej identity',
            type: ComplianceType.VISUAL_IDENTITY,
            status: ComplianceStatus.COMPLIANT,
            createdAt: '2025-01-01T10:00:00Z',
            updatedAt: '2025-01-15T14:30:00Z',
          },
          {
            id: '2',
            title: 'Sankčné zoznamy',
            description: 'Všetci partneri boli skontrolovaní voči sankčným zoznamom EU',
            type: ComplianceType.SANCTIONS_LIST,
            status: ComplianceStatus.COMPLIANT,
            createdAt: '2025-01-01T10:00:00Z',
            updatedAt: '2025-01-15T14:30:00Z',
          },
          {
            id: '3',
            title: 'GDPR',
            description: 'Čaká sa na kontrolu GDPR dokumentácie',
            type: ComplianceType.GDPR,
            status: ComplianceStatus.PENDING,
            createdAt: '2025-01-01T10:00:00Z',
            updatedAt: '2025-01-15T14:30:00Z',
          },
          {
            id: '4',
            title: 'Reporting',
            description: 'Potrebné aktualizovať mesačný report podľa nových požiadaviek',
            type: ComplianceType.REPORTING,
            status: ComplianceStatus.NON_COMPLIANT,
            createdAt: '2025-01-01T10:00:00Z',
            updatedAt: '2025-01-15T14:30:00Z',
          },
          {
            id: '5',
            title: 'Financie',
            description: 'Finančné reporty sú v súlade s INTERREG požiadavkami',
            type: ComplianceType.FINANCIAL,
            status: ComplianceStatus.COMPLIANT,
            createdAt: '2025-01-01T10:00:00Z',
            updatedAt: '2025-01-15T14:30:00Z',
          },
        ]);
        setLoading(false);
      }, 1000);
    }
  }, [initialChecks, loading]);
  
  // Calculate compliance statistics
  const calculateStats = () => {
    if (!checks.length) {
      return {
        total: 0,
        compliant: 0,
        nonCompliant: 0,
        pending: 0,
        complianceRate: 0,
      };
    }
    
    const total = checks.length;
    const compliant = checks.filter(check => check.status === ComplianceStatus.COMPLIANT).length;
    const nonCompliant = checks.filter(check => check.status === ComplianceStatus.NON_COMPLIANT).length;
    const pending = checks.filter(check => check.status === ComplianceStatus.PENDING).length;
    
    // Calculate compliance rate (excluding pending checks)
    const relevantChecks = total - pending;
    const complianceRate = relevantChecks > 0
      ? Math.round((compliant / relevantChecks) * 100)
      : 100;
    
    return {
      total,
      compliant,
      nonCompliant,
      pending,
      complianceRate,
    };
  };
  
  const stats = calculateStats();
  
  // Category titles
  const categoryTitles = {
    [ComplianceType.VISUAL_IDENTITY]: 'Vizuálna identita',
    [ComplianceType.SANCTIONS_LIST]: 'Sankčné zoznamy',
    [ComplianceType.GDPR]: 'GDPR',
    [ComplianceType.REPORTING]: 'Reporting',
    [ComplianceType.FINANCIAL]: 'Financie',
    [ComplianceType.PROCUREMENT]: 'Verejné obstarávanie',
  };
  
  return (
    <div className="space-y-6">
      {/* Compliance overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>INTERREG Compliance</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={fetchComplianceChecks}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Obnoviť</span>
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-md">
              {error}
            </div>
          )}
          
          {/* Loading state */}
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Compliance rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Celková miera compliance</h3>
                  <span className="text-sm font-medium">{stats.complianceRate}%</span>
                </div>
                <Progress value={stats.complianceRate} className="h-2" />
              </div>
              
              {/* Compliance stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/30 border border-border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Celkom</p>
                    <p className="text-xl font-bold">{stats.total}</p>
                  </div>
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Vyhovuje</p>
                    <p className="text-xl font-bold">{stats.compliant}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Čaká na kontrolu</p>
                    <p className="text-xl font-bold">{stats.pending}</p>
                  </div>
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Nevyhovuje</p>
                    <p className="text-xl font-bold">{stats.nonCompliant}</p>
                  </div>
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Compliance checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          // Loading placeholders
          Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 bg-muted rounded-full"></div>
                    <div className="h-3 bg-muted rounded w-16"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Actual compliance checks
          checks.map((check) => (
            <ComplianceBadge
              key={check.id}
              category={check.type}
              status={check.status}
              title={check.title || categoryTitles[check.type]}
              description={check.description}
              onClick={() => console.log('Clicked compliance check:', check.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

