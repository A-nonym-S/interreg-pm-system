import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand-primary/10 text-brand-primary",
        secondary: "border-transparent bg-dark-bg-elevated text-dark-text-secondary border border-dark-border-default",
        destructive: "border-transparent bg-semantic-error/10 text-semantic-error",
        success: "border-transparent bg-semantic-success/10 text-semantic-success",
        warning: "border-transparent bg-semantic-warning/10 text-semantic-warning",
        info: "border-transparent bg-semantic-info/10 text-semantic-info",
        outline: "text-dark-text-primary border-dark-border-default",
        // Task Priority Variants
        critical: "border-transparent bg-red-500/10 text-red-500 border border-red-500/20",
        high: "border-transparent bg-orange-500/10 text-orange-500 border border-orange-500/20",
        medium: "border-transparent bg-blue-500/10 text-blue-500 border border-blue-500/20",
        low: "border-transparent bg-gray-500/10 text-gray-500 border border-gray-500/20",
        // Task Status Variants
        pending: "border-transparent bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/20",
        "in-progress": "border-transparent bg-blue-500/10 text-blue-500 border border-blue-500/20",
        completed: "border-transparent bg-semantic-success/10 text-semantic-success border border-semantic-success/20",
        blocked: "border-transparent bg-semantic-error/10 text-semantic-error border border-semantic-error/20",
        cancelled: "border-transparent bg-gray-500/10 text-gray-500 border border-gray-500/20",
        // Task Category Variants
        publicita: "border-transparent bg-purple-500/10 text-purple-500 border border-purple-500/20",
        financie: "border-transparent bg-green-500/10 text-green-500 border border-green-500/20",
        reporting: "border-transparent bg-blue-500/10 text-blue-500 border border-blue-500/20",
        compliance: "border-transparent bg-brand-eu/10 text-blue-400 border border-blue-400/20",
        monitoring: "border-transparent bg-cyan-500/10 text-cyan-500 border border-cyan-500/20",
        obstaravanie: "border-transparent bg-indigo-500/10 text-indigo-500 border border-indigo-500/20",
        partnerstvo: "border-transparent bg-pink-500/10 text-pink-500 border border-pink-500/20",
        general: "border-transparent bg-gray-500/10 text-gray-500 border border-gray-500/20",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };

