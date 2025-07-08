'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Save, 
  Send, 
  Eye, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Globe,
  MessageSquare,
  ArrowLeft,
  Wand2,
  FileText,
  Clock
} from 'lucide-react';

interface ComplianceCheck {
  score: number;
  status: string;
  checks: Array<{
    category: string;
    element: string;
    status: string;
    message: string;
  }>;
  recommendations: string[];
  criticalIssues: string[];
}

export default function NewContentPage() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    contentType: '',
    platforms: [] as string[],
    scheduledFor: '',
    aiPrompt: ''
  });
  
  const [complianceCheck, setComplianceCheck] = useState<ComplianceCheck | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');

  const contentTypes = [
    { value: 'POST', label: 'Príspevok' },
    { value: 'NEWS', label: 'Novinky' },
    { value: 'EVENT', label: 'Udalosť' },
    { value: 'MILESTONE', label: 'Míľnik' },
    { value: 'ANNOUNCEMENT', label: 'Oznámenie' },
    { value: 'PRESS_RELEASE', label: 'Tlačová správa' }
  ];

  const platforms = [
    { value: 'WEB', label: 'Webová stránka', icon: <Globe className="w-4 h-4" /> },
    { value: 'FACEBOOK', label: 'Facebook', icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'WHATSAPP', label: 'WhatsApp', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      platforms: checked 
        ? [...prev.platforms, platform]
        : prev.platforms.filter(p => p !== platform)
    }));
  };

  const generateContent = async () => {
    if (!formData.aiPrompt || !formData.contentType) {
      alert('Prosím zadajte prompt a vyberte typ obsahu');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulácia AI generovania
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const generatedTitle = `AI: ${formData.aiPrompt}`;
      const generatedContent = `Na základe vašej požiadavky: "${formData.aiPrompt}"

Vytvorili sme nový obsah pre projekt INTERREG HUSKROUA. Projekt sa zameriava na cezhraničnú spoluprácu medzi Maďarskom, Slovenskom, Rumunskom a Ukrajinou.

✅ Povinné prvky:
- Logo programu s akronymom projektu
- Slogan programu  
- Štandardné uznanie financovania EÚ

📍 Kontakt:
Joint Secretariat
E-mail: info@next.huskroua-cbc.eu
Web: https://next.huskroua-cbc.eu/

Táto publikácia bola vytvorená s finančnou podporou Európskej únie. Za jej obsah nesie výhradnú zodpovednosť [meno partnera] a nemusí nevyhnutne odrážať názory Európskej únie.`;

      setFormData(prev => ({
        ...prev,
        title: generatedTitle,
        content: generatedContent
      }));

      // Automatická kontrola súladu
      await checkCompliance(generatedTitle, generatedContent);
      
    } catch (error) {
      console.error('Chyba pri generovaní obsahu:', error);
      alert('Chyba pri generovaní obsahu');
    } finally {
      setIsGenerating(false);
    }
  };

  const checkCompliance = async (title?: string, content?: string) => {
    const checkTitle = title || formData.title;
    const checkContent = content || formData.content;
    
    if (!checkContent || !formData.contentType) {
      alert('Prosím zadajte obsah a vyberte typ obsahu');
      return;
    }

    setIsChecking(true);
    try {
      // Simulácia kontroly súladu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockCompliance: ComplianceCheck = {
        score: 87,
        status: 'PARTIALLY_COMPLIANT',
        checks: [
          {
            category: 'Vizuálne prvky',
            element: 'Logo programu',
            status: 'PASSED',
            message: 'Logo programu je spomenuté v obsahu'
          },
          {
            category: 'Vizuálne prvky', 
            element: 'Slogan programu',
            status: 'PASSED',
            message: 'Slogan programu je prítomný'
          },
          {
            category: 'Disclaimer',
            element: 'Štandardný disclaimer',
            status: 'PASSED',
            message: 'Disclaimer je správne formulovaný'
          },
          {
            category: 'Kontaktné informácie',
            element: 'Joint Secretariat kontakt',
            status: 'FAILED',
            message: 'Chýbajú úplné kontaktné informácie'
          }
        ],
        recommendations: [
          'Pridajte úplné kontaktné informácie Joint Secretariat',
          'Zvážte pridanie webovej stránky projektu'
        ],
        criticalIssues: []
      };

      setComplianceCheck(mockCompliance);
      
    } catch (error) {
      console.error('Chyba pri kontrole súladu:', error);
      alert('Chyba pri kontrole súladu');
    } finally {
      setIsChecking(false);
    }
  };

  const saveContent = async (status: 'DRAFT' | 'PENDING_APPROVAL') => {
    if (!formData.title || !formData.content || !formData.contentType || formData.platforms.length === 0) {
      alert('Prosím vyplňte všetky povinné polia');
      return;
    }

    setIsSaving(true);
    try {
      // Simulácia uloženia
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (status === 'DRAFT') {
        alert('Obsah bol uložený ako koncept');
      } else {
        alert('Obsah bol odoslaný na schválenie');
      }
      
      // Presmerovanie na zoznam obsahu
      window.location.href = '/publicity/content';
      
    } catch (error) {
      console.error('Chyba pri ukladaní:', error);
      alert('Chyba pri ukladaní obsahu');
    } finally {
      setIsSaving(false);
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceStatus = (status: string) => {
    switch (status) {
      case 'COMPLIANT': return { text: 'Vyhovuje', color: 'bg-green-500' };
      case 'PARTIALLY_COMPLIANT': return { text: 'Čiastočne vyhovuje', color: 'bg-yellow-500' };
      case 'NON_COMPLIANT': return { text: 'Nevyhovuje', color: 'bg-red-500' };
      default: return { text: 'Neznámy', color: 'bg-gray-500' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
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
              <h1 className="text-3xl font-bold text-gray-900">Nový obsah</h1>
              <p className="text-gray-600">Vytvorte nový marketingový obsah pre INTERREG projekt</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Tvorba obsahu</CardTitle>
                <CardDescription>
                  Vytvorte obsah manuálne alebo pomocou AI asistenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual">Manuálne</TabsTrigger>
                    <TabsTrigger value="ai">
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Generátor
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="ai" className="space-y-4 mt-6">
                    <div>
                      <Label htmlFor="aiPrompt">Popíšte, aký obsah chcete vytvoriť</Label>
                      <Textarea
                        id="aiPrompt"
                        placeholder="Napríklad: Napíšte príspevok o inštalácii nového CT prístroja v nemocnici, zdôraznite prínos pre pacientov a cezhraničnú spoluprácu..."
                        value={formData.aiPrompt}
                        onChange={(e) => handleInputChange('aiPrompt', e.target.value)}
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      onClick={generateContent}
                      disabled={isGenerating || !formData.aiPrompt}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generujem obsah...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generovať obsah
                        </>
                      )}
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="manual" className="mt-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Vytvorte obsah manuálne pomocou formulára nižšie
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Content Form */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Detaily obsahu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Názov *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Zadajte názov obsahu"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contentType">Typ obsahu *</Label>
                    <Select value={formData.contentType} onValueChange={(value) => handleInputChange('contentType', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Vyberte typ obsahu" />
                      </SelectTrigger>
                      <SelectContent>
                        {contentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <Label htmlFor="content">Obsah *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Zadajte obsah príspevku..."
                    rows={12}
                    className="mt-1"
                  />
                </div>

                {/* Platforms */}
                <div>
                  <Label>Platformy na publikovanie *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    {platforms.map((platform) => (
                      <div key={platform.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={platform.value}
                          checked={formData.platforms.includes(platform.value)}
                          onCheckedChange={(checked) => handlePlatformChange(platform.value, checked as boolean)}
                        />
                        <Label htmlFor={platform.value} className="flex items-center gap-2 cursor-pointer">
                          {platform.icon}
                          {platform.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scheduling */}
                <div>
                  <Label htmlFor="scheduledFor">Naplánovať publikovanie (voliteľné)</Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) => handleInputChange('scheduledFor', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-white shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={checkCompliance}
                    disabled={isChecking || !formData.content}
                    variant="outline"
                  >
                    {isChecking ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Kontrolujem...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Kontrola súladu
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => saveContent('DRAFT')}
                    disabled={isSaving}
                    variant="outline"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Uložiť koncept
                  </Button>
                  
                  <Button
                    onClick={() => saveContent('PENDING_APPROVAL')}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Ukladám...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Odoslať na schválenie
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Compliance Check Results */}
            {complianceCheck && (
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Kontrola súladu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Skóre súladu</span>
                      <span className={`text-lg font-bold ${getComplianceColor(complianceCheck.score)}`}>
                        {complianceCheck.score}%
                      </span>
                    </div>
                    <Progress value={complianceCheck.score} className="h-2" />
                    <div className="mt-2">
                      <Badge className={`${getComplianceStatus(complianceCheck.status).color} text-white`}>
                        {getComplianceStatus(complianceCheck.status).text}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Kontrolné body:</h4>
                    {complianceCheck.checks.map((check, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        {check.status === 'PASSED' ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-medium">{check.element}</div>
                          <div className="text-gray-600">{check.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {complianceCheck.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Odporúčania:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {complianceCheck.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Help & Guidelines */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Pokyny a pomoc
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Povinné prvky:</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Logo programu s akronymom</li>
                    <li>• Slogan programu</li>
                    <li>• Štandardný disclaimer EÚ</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Kontaktné informácie:</h4>
                  <div className="text-gray-600">
                    <p>Joint Secretariat</p>
                    <p>info@next.huskroua-cbc.eu</p>
                    <p>https://next.huskroua-cbc.eu/</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Zobraziť príručku
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

