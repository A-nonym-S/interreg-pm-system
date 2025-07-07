"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  FileText, 
  Shield, 
  BarChart3, 
  ShoppingCart, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell
} from "lucide-react";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: number;
  isActive?: boolean;
}

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

const navigationItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: CheckSquare,
    label: "Úlohy",
    href: "/dashboard/tasks",
    badge: 13,
  },
  {
    icon: Users,
    label: "Tím",
    href: "/dashboard/team",
  },
  {
    icon: FileText,
    label: "Dokumenty",
    href: "/dashboard/documents",
    badge: 5,
  },
  {
    icon: Shield,
    label: "Compliance",
    href: "/dashboard/compliance",
    badge: 2,
  },
  {
    icon: BarChart3,
    label: "Reporty",
    href: "/dashboard/reports",
  },
  {
    icon: ShoppingCart,
    label: "Obstarávanie",
    href: "/dashboard/procurement",
  },
  {
    icon: Settings,
    label: "Nastavenia",
    href: "/dashboard/settings",
  },
];

const NavItem: React.FC<NavItem & { collapsed: boolean }> = ({ 
  icon: Icon, 
  label, 
  href, 
  badge, 
  collapsed 
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-3 text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-hover transition-all duration-200 rounded-lg mx-3 group",
        isActive && "text-dark-text-primary bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/20",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon className={cn("w-5 h-5 shrink-0", isActive && "text-brand-primary")} />
      {!collapsed && (
        <>
          <span className="font-medium truncate">{label}</span>
          {badge && (
            <Badge 
              variant="default" 
              size="sm" 
              className="ml-auto bg-brand-primary text-white"
            >
              {badge}
            </Badge>
          )}
        </>
      )}
      {collapsed && badge && (
        <div className="absolute left-8 top-2 w-2 h-2 bg-brand-primary rounded-full" />
      )}
    </Link>
  );
};

const UserMenu: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg bg-dark-bg-elevated border border-dark-border-default",
      collapsed && "justify-center"
    )}>
      <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center shrink-0">
        <span className="text-white font-medium text-sm">A</span>
      </div>
      {!collapsed && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-dark-text-primary truncate">Admin User</p>
          <p className="text-xs text-dark-text-muted truncate">admin@interreg.eu</p>
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed = false, 
  onCollapse 
}) => {
  return (
    <aside className={cn(
      "flex flex-col h-full bg-dark-bg-secondary border-r border-dark-border-subtle transition-all duration-300 relative",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo Section */}
      <div className="p-4 border-b border-dark-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-eu rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">EU</span>
          </div>
          {!collapsed && (
            <>
              <div className="h-6 w-px bg-dark-border-default" />
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-brand-primary">INTERREG</span>
                <span className="text-sm text-dark-text-secondary">HUSKROUA</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => onCollapse?.(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-dark-bg-tertiary border border-dark-border-default rounded-full flex items-center justify-center hover:bg-dark-bg-elevated transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-dark-text-secondary" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-dark-text-secondary" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1">
        {navigationItems.map((item) => (
          <NavItem key={item.href} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Notifications */}
      {!collapsed && (
        <div className="px-3 pb-4">
          <div className="p-3 rounded-lg bg-semantic-warning/10 border border-semantic-warning/20">
            <div className="flex items-start gap-3">
              <Bell className="w-4 h-4 text-semantic-warning shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-semantic-warning">Compliance Alert</p>
                <p className="text-xs text-dark-text-muted mt-1">
                  2 úlohy vyžadujú pozornosť
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Section */}
      <div className="p-4 border-t border-dark-border-subtle">
        <UserMenu collapsed={collapsed} />
      </div>
    </aside>
  );
};

