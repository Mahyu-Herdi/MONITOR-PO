import React, { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export function CustomDatePicker({ value, onChange, className = '', placeholder = 'Pilih Tanggal', required = false }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Use parsed date if value exists, otherwise current date for displaying calendar
  const [currentMonth, setCurrentMonth] = useState(() => value ? parseISO(value) : new Date());
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync currentMonth with value when it changes externally
    if (value) {
      setCurrentMonth(parseISO(value));
    }
  }, [value]);

  useEffect(() => {
    // Handle outside click
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleCalendar = () => setIsOpen(!isOpen);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const onDateClick = (day: Date) => {
    onChange(format(day, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <button 
          type="button" 
          onClick={prevMonth}
          className="p-1.5 rounded-xl hover:bg-black/5 text-gray-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-sm text-gray-800">
          {format(currentMonth, 'MMMM yyyy', { locale: id })}
        </span>
        <button 
          type="button" 
          onClick={nextMonth}
          className="p-1.5 rounded-xl hover:bg-black/5 text-gray-600 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentMonth, { weekStartsOn: 1 }); // Start on Monday
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-bold text-[10px] text-gray-400 py-1">
          {format(addDays(startDate, i), 'EEEEEE', { locale: id })}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';
    
    const selectedDate = value ? parseISO(value) : null;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        
        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());
        
        days.push(
          <div key={day.toString()} className="p-0.5">
            <button
              type="button"
              onClick={() => onDateClick(cloneDay)}
              className={`
                w-full aspect-square flex items-center justify-center rounded-xl text-xs font-bold transition-all
                ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                ${isSelected ? 'bg-[#548CA8] text-white shadow-md' : 'hover:bg-black/5'}
                ${isToday && !isSelected ? 'border border-[#548CA8] text-[#548CA8]' : ''}
              `}
            >
              {formattedDate}
            </button>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7" key={day.toString()}>{days}</div>);
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        className={`flex items-center cursor-pointer ${className}`}
        onClick={toggleCalendar}
      >
        <span className="flex-1 text-left select-none opacity-90 truncate">
          {value ? format(parseISO(value), 'dd MMMM yyyy', { locale: id }) : <span className="text-gray-400">{placeholder}</span>}
        </span>
        <CalendarIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
      </div>
      
      {/* Hidden native input for form submissions and required validation */}
      <input 
        type="text" 
        className="absolute bottom-0 left-1/2 w-0 h-0 opacity-0 pointer-events-none"
        value={value} 
        onChange={() => {}} 
        required={required} 
      />

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 w-[280px] sm:w-[320px] bg-[#e8e4d9] rounded-2xl shadow-[4px_4px_8px_#d1cdc0,-4px_-4px_8px_#fff] border border-white/20 -left-4 sm:left-0">
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </div>
      )}
    </div>
  );
}
