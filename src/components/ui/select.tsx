"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  placeholder?: string;
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined);

const useSelectContext = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a Select");
  }
  return context;
};

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

const Select = ({ value = "", onValueChange, children }: SelectProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ 
      value, 
      onValueChange: onValueChange || (() => {}), 
      open, 
      setOpen 
    }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelectContext();

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

interface SelectValueProps {
  placeholder?: string;
}

const SelectValue = ({ placeholder }: SelectValueProps) => {
  const { value } = useSelectContext();
  
  // Map values to display text
  const getDisplayText = (val: string) => {
    const mappings: Record<string, string> = {
      'FINANCIAL': 'Finančné',
      'REPORTING': 'Reporting', 
      'COMPLIANCE': 'Compliance',
      'PROCUREMENT': 'Obstarávanie',
      'TECHNICAL': 'Technické',
      'ADMINISTRATIVE': 'Administratívne',
      'LOW': 'Nízka',
      'MEDIUM': 'Stredná',
      'HIGH': 'Vysoká',
      'CRITICAL': 'Kritická'
    };
    return mappings[val] || val;
  };
  
  return (
    <span className={cn(!value && "text-muted-foreground")}>
      {value ? getDisplayText(value) : placeholder}
    </span>
  );
};

interface SelectContentProps {
  children: React.ReactNode;
}

const SelectContent = ({ children }: SelectContentProps) => {
  const { open, setOpen } = useSelectContext();

  if (!open) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={() => setOpen(false)}
      />
      <div className="absolute top-full left-0 z-50 w-full mt-1 bg-popover border border-gray-200 rounded-md shadow-md max-h-60 overflow-auto">
        {children}
      </div>
    </>
  );
};

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

const SelectItem = ({ value, children }: SelectItemProps) => {
  const { onValueChange, setOpen, value: selectedValue } = useSelectContext();

  return (
    <div
      className={cn(
        "px-3 py-2 text-sm cursor-pointer hover:bg-muted",
        selectedValue === value && "bg-muted font-medium"
      )}
      onClick={() => {
        onValueChange(value);
        setOpen(false);
      }}
    >
      {children}
    </div>
  );
};

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };

