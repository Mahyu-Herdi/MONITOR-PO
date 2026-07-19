import React from 'react';
import { Info, CheckCircle, XCircle } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  message: string;
  type?: 'info' | 'success' | 'error';
  onClose: () => void;
}

export function AlertModal({ isOpen, message, type = 'info', onClose }: AlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-[#d1cdc0]/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="neo-card relative p-6 w-[92%] max-w-[340px] z-10 flex flex-col items-center animate-in zoom-in-95 duration-200 text-center">
        <div className="mb-4">
          {type === 'success' && <CheckCircle className="w-12 h-12 text-green-custom" />}
          {type === 'error' && <XCircle className="w-12 h-12 text-red-500" />}
          {type === 'info' && <Info className="w-12 h-12 text-blue-custom" />}
        </div>
        
        <p className="text-txt font-bold mb-6 text-sm sm:text-base leading-relaxed">
          {message}
        </p>
        
        <button 
          onClick={onClose}
          className="neo-btn-primary w-full py-3 justify-center text-sm"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}
