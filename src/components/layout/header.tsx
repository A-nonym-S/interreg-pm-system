"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { 
  Menu, 
  Bell, 
  User, 
  LogOut, 
  Settings,
  Globe,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // Available languages
  const languages = [
    { code: 'sk', name: 'Slovenčina' },
    { code: 'en', name: 'English' },
    { code: 'hu', name: 'Magyar' },
    { code: 'uk', name: 'Українська' },
  ];
  
  // Current language (would be from context/state in a real app)
  const currentLanguage = languages[0];
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {/* Mobile sidebar toggle */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden" 
        onClick={onToggleSidebar}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
      
      {/* Logo and EU identity */}
      <div className="flex items-center gap-2">
        <div className="relative h-8 w-8 md:h-10 md:w-10">
          <div className="absolute inset-0 flex items-center justify-center bg-white rounded">
            {/* Placeholder for EU logo - in a real app, use actual logo */}
            <div className="text-blue-700 font-bold text-center text-[8px] md:text-xs">
              EU
            </div>
          </div>
        </div>
        
        <div className="hidden md:block">
          <h1 className="text-lg font-semibold">INTERREG HUSKROUA</h1>
          <p className="text-xs text-muted-foreground">Project Management System</p>
        </div>
      </div>
      
      {/* Spacer */}
      <div className="flex-1"></div>
      
      {/* Language selector */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden md:inline">{currentLanguage.name}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
        
        {languageMenuOpen && (
          <div className="absolute right-0 mt-2 w-40 rounded-md bg-popover shadow-md border border-border z-50">
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    lang.code === currentLanguage.code
                      ? 'bg-muted font-medium'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => {
                    // In a real app, change language here
                    setLanguageMenuOpen(false);
                  }}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Notifications */}
      <Button variant="ghost" size="icon">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Notifications</span>
      </Button>
      
      {/* User menu */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setUserMenuOpen(!userMenuOpen)}
        >
          <Avatar className="h-8 w-8">
            <div className="bg-primary/10 text-primary flex items-center justify-center h-full w-full text-sm">
              MN
            </div>
          </Avatar>
          <span className="sr-only">User menu</span>
        </Button>
        
        {userMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md bg-popover shadow-md border border-border z-50">
            <div className="py-1">
              <div className="px-4 py-2 border-b border-border">
                <p className="font-medium">Mária Novák</p>
                <p className="text-xs text-muted-foreground">maria.novak@example.com</p>
              </div>
              
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm hover:bg-muted"
                onClick={() => setUserMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Profil</span>
                </div>
              </Link>
              
              <Link
                href="/settings"
                className="block px-4 py-2 text-sm hover:bg-muted"
                onClick={() => setUserMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Nastavenia</span>
                </div>
              </Link>
              
              <div className="border-t border-border mt-1 pt-1">
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-muted"
                  onClick={() => {
                    // In a real app, logout here
                    setUserMenuOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    <span>Odhlásiť sa</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

