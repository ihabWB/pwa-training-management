'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

const SelectContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
  selectedLabel: string;
  setSelectedLabel: (label: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
} | null>(null);

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultLabel?: string; // Add this to accept the display label
  children: React.ReactNode;
}

function Select({ value, onValueChange, defaultLabel, children }: SelectProps) {
  const [selectedLabel, setSelectedLabel] = React.useState(defaultLabel || '');
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Update selectedLabel when defaultLabel changes
  React.useEffect(() => {
    if (defaultLabel) {
      setSelectedLabel(defaultLabel);
    } else if (!value) {
      setSelectedLabel('');
    }
  }, [value, defaultLabel]);
  
  return (
    <SelectContext.Provider value={{ 
      value: value || '', 
      onValueChange: onValueChange || (() => {}),
      selectedLabel,
      setSelectedLabel,
      isOpen,
      setIsOpen
    }}>
      {children}
    </SelectContext.Provider>
  );
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext);

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'flex h-11 w-full items-center justify-between rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition-all hover:border-blue-400 hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50',
        context?.isOpen && 'border-blue-500 ring-4 ring-blue-100',
        className
      )}
      onClick={() => context?.setIsOpen(!context.isOpen)}
      {...props}
    >
      {children}
      <ChevronDown 
        className={cn(
          'h-5 w-5 text-gray-500 transition-transform duration-200',
          context?.isOpen && 'rotate-180 text-blue-600'
        )} 
      />
    </button>
  );
});
SelectTrigger.displayName = 'SelectTrigger';

interface SelectValueProps {
  placeholder?: string;
}

function SelectValue({ placeholder }: SelectValueProps) {
  const context = React.useContext(SelectContext);
  return (
    <span className={cn(
      'text-sm',
      context?.selectedLabel ? 'text-gray-900 font-medium' : 'text-gray-400'
    )}>
      {context?.selectedLabel || placeholder}
    </span>
  );
}

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    
    if (!context?.isOpen) return null;

    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => context.setIsOpen(false)}
        />
        
        {/* Dropdown */}
        <div
          ref={ref}
          className={cn(
            'absolute z-50 mt-2 w-full overflow-hidden rounded-lg border-2 border-gray-200 bg-white shadow-xl animate-in fade-in-0 zoom-in-95',
            className
          )}
          {...props}
        >
          <div className="max-h-80 overflow-y-auto p-2">
            {children}
          </div>
        </div>
      </>
    );
  }
);
SelectContent.displayName = 'SelectContent';

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
  label?: string;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, label, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    const isSelected = context?.value === value;
    const displayLabel = label || (typeof children === 'string' ? children : value);

    const handleClick = () => {
      context?.onValueChange(value);
      context?.setSelectedLabel(displayLabel);
      context?.setIsOpen(false);
    };

    return (
      <div
        ref={ref}
        data-value={value}
        data-label={displayLabel}
        className={cn(
          'relative flex w-full cursor-pointer select-none items-center rounded-md px-3 py-2.5 text-sm transition-all',
          isSelected 
            ? 'bg-blue-50 text-blue-900 font-semibold border-l-4 border-blue-600' 
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
        {isSelected && (
          <svg 
            className="ml-auto h-4 w-4 text-blue-600" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
        )}
      </div>
    );
  }
);
SelectItem.displayName = 'SelectItem';

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
