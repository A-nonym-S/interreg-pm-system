"use client";

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

interface EUFooterProps {
  projectNumber?: string;
  className?: string;
}

export function EUFooter({ 
  projectNumber = "HUSKROUA/2401/LIP/0001", 
  className 
}: EUFooterProps) {
  return (
    <Card className={`mt-8 ${className}`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* EU and INTERREG logos */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="relative h-16 w-24">
              <div className="absolute inset-0 flex items-center justify-center bg-white rounded p-2">
                {/* Placeholder for EU logo - in a real app, use actual logo */}
                <div className="text-blue-700 font-bold text-center text-xs">
                  EU Logo
                </div>
              </div>
            </div>
            
            <div className="relative h-16 w-32">
              <div className="absolute inset-0 flex items-center justify-center bg-white rounded p-2">
                {/* Placeholder for INTERREG logo - in a real app, use actual logo */}
                <div className="text-blue-700 font-bold text-center text-xs">
                  INTERREG HUSKROUA
                </div>
              </div>
            </div>
          </div>
          
          {/* Project information */}
          <div className="text-center md:text-right">
            <p className="text-xs text-muted-foreground mb-1">
              Projekt je spolufinancovaný Európskou úniou
            </p>
            <p className="text-sm font-medium">
              Číslo projektu: {projectNumber}
            </p>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Tento obsah reprezentuje názory autora. Európska komisia nenesie žiadnu zodpovednosť za použitie informácií, ktoré obsahuje.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

