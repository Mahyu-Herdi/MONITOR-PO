import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  variant?: 'default' | 'inline';
}

export function CustomSelect({ options, value, onChange, placeholder = 'Pilih...', className = '', disabled = false, name, required, variant = 'default' }: CustomSelectProps) {
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
  const isInline = variant === 'inline';

  return (
    <div className={`relative ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${isInline ? 'inline-block' : ''}`} ref={containerRef}>
      {name && <input type="text" name={name} value={value} required={required} className="absolute opacity-0 pointer-events-none w-full h-full -z-10" onChange={() => {}} tabIndex={-1} />}
      <div 
        className={`flex items-center justify-between cursor-pointer font-bold ${isInline ? 'text-xs sm:text-sm text-blue-custom gap-2 ' : 'w-full p-3 sm:p-4 rounded-xl neo-input text-sm sm:text-base min-h-[48px] '} ${className} ${disabled ? 'pointer-events-none' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
           if (e.key === 'Enter' || e.key === ' ') {
               e.preventDefault();
               setIsOpen(!isOpen);
           }
        }}
      >
        <span className={selectedOption ? 'text-txt' : 'text-muted'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && !disabled && (
        <div className={`absolute z-50 mt-2 neo-box rounded-xl max-h-60 overflow-y-auto ${isInline ? 'w-auto min-w-[120px]' : 'w-full'}`} style={{ top: '100%', left: 0, boxShadow: '10px 10px 20px #d4d0c7, -10px -10px 20px #ffffff' }}>
          <ul className="py-2 m-0 list-none">
            {options.map((option) => (
              <li 
                key={option.value}
                className={`px-4 py-3 cursor-pointer text-sm sm:text-base transition-colors hover:bg-black/5 ${value === option.value ? 'bg-blue-50/50 text-blue-custom font-black' : 'font-bold'}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
