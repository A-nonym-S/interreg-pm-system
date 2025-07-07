"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* EU & INTERREG Logos */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="w-16 h-16 bg-brand-eu rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">EU</span>
          </div>
          <div className="h-8 w-px bg-dark-border-default" />
          <div className="text-2xl font-bold text-brand-primary">
            INTERREG
          </div>
        </div>

        {/* Loading */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-dark-text-primary">
            INTERREG HUSKROUA
          </h1>
          <p className="text-dark-text-secondary">
            Project Management System
          </p>
          
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>

        {/* EU Disclaimer */}
        <div className="mt-12 text-xs text-dark-text-muted text-center">
          <p>Financované Európskou úniou</p>
          <p>HUSKROUA/2301/4.1/0045</p>
        </div>
      </div>
    </div>
  );
}

