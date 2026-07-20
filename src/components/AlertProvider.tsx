import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AlertModal } from './AlertModal';

type AlertType = 'info' | 'success' | 'error';

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => void;
  showConfirm: (message: string, onConfirm: () => void) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AlertType>('info');

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(null);

  const showAlert = useCallback((msg: string, alertType: AlertType = 'info') => {
    setMessage(msg);
    setType(alertType);
    setIsOpen(true);
  }, []);

  const showConfirm = useCallback((msg: string, onConfirm: () => void) => {
    setConfirmMessage(msg);
    setConfirmCallback(() => onConfirm);
    setIsConfirmOpen(true);
  }, []);

  const handleConfirmAccept = () => {
    setIsConfirmOpen(false);
    if (confirmCallback) {
      confirmCallback();
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AlertModal 
        isOpen={isOpen}
        message={message}
        type={type}
        onClose={() => setIsOpen(false)}
      />
      {isConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-[#d1cdc0]/70 backdrop-blur-sm"
            onClick={() => setIsConfirmOpen(false)}
          />
          
          <div className="neo-card relative p-6 w-[92%] max-w-[340px] z-10 flex flex-col items-center animate-in zoom-in-95 duration-200 text-center">
            <div className="mb-3 text-amber-500 font-extrabold text-4xl">
              ⚠️
            </div>
            
            <p className="text-txt font-bold mb-6 text-sm sm:text-base leading-relaxed">
              {confirmMessage}
            </p>
            
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setIsConfirmOpen(false)}
                className="neo-btn bg-gray-200 text-gray-700 w-1/2 py-2.5 justify-center text-xs sm:text-sm font-bold rounded-xl"
              >
                Batal
              </button>
              <button 
                onClick={handleConfirmAccept}
                className="neo-btn red w-1/2 py-2.5 justify-center text-xs sm:text-sm font-bold rounded-xl"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

