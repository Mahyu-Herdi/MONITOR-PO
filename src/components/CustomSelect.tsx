import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
  required?: boolean;
  variant?: 'default' | 'inline';
}

export function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Pilih...', 
  disabled = false,
  className,
  variant = 'default'
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  if (variant === 'inline') {
    return (
      <div className={cn(`relative ${isOpen ? "z-50" : "z-20"}`, className)} ref={containerRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="bg-transparent border-none outline-none text-xs sm:text-sm font-bold text-blue-custom cursor-pointer flex items-center gap-1"
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronDown className="w-3 h-3" />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 min-w-[120px] neo-card !rounded-xl p-2 z-[100] animate-in fade-in zoom-in-95 duration-150">
            <div className="max-h-[200px] overflow-y-auto pr-1">
              {options.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "px-3 py-2 text-xs sm:text-sm font-bold rounded-lg cursor-pointer transition-colors mb-1 last:mb-0",
                    value === opt.value ? "bg-blue-50 text-blue-custom" : "text-txt hover:bg-black/5"
                  )}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(`relative ${isOpen ? "z-50" : "z-20"}`, className)} ref={containerRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "neo-input w-full p-3 sm:p-4 rounded-xl font-bold cursor-pointer text-sm sm:text-base min-h-[48px] flex items-center justify-between",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      >
        <span className={!selectedOption ? "text-muted" : "text-txt"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="w-5 h-5 text-muted" />
      </div>
      
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 neo-card !rounded-xl p-2 z-[100] animate-in fade-in zoom-in-95 duration-150 shadow-xl">
          <div className="max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "px-4 py-3 text-sm sm:text-base font-bold rounded-xl cursor-pointer transition-colors mb-1 last:mb-0",
                  value === opt.value ? "bg-blue-50 text-blue-custom" : "text-txt hover:bg-black/5"
                )}
              >
                {opt.label}
              </div>
            ))}
            {options.length === 0 && (
              <div className="px-4 py-3 text-sm sm:text-base text-muted text-center italic">
                Tidak ada data
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
