import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AlertModal } from './AlertModal';

type AlertType = 'info' | 'success' | 'error';

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AlertType>('info');

  const showAlert = useCallback((msg: string, alertType: AlertType = 'info') => {
    setMessage(msg);
    setType(alertType);
    setIsOpen(true);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <AlertModal 
        isOpen={isOpen}
        message={message}
        type={type}
        onClose={() => setIsOpen(false)}
      />
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
