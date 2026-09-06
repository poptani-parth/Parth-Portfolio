import React, { createContext, useContext, useState, useCallback } from'react';
import { ToastMessage } from'../types/admin';

interface ToastContextType {
 toasts: ToastMessage[];
 showToast: (toast: Omit<ToastMessage,'id'>) => string;
 removeToast: (id: string) => void;
 showSuccess: (title: string, message?: string) => string;
 showError: (title: string, message?: string) => string;
 showInfo: (title: string, message?: string) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const [toasts, setToasts] = useState<ToastMessage[]>([]);

 const removeToast = useCallback((id: string) => {
 setToasts(prev => prev.filter(t => t.id !== id));
 }, []);

 const showToast = useCallback((toast: Omit<ToastMessage,'id'>) => {
 const id =`toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
 const newToast: ToastMessage = {
 ...toast,
 id,
 autoDismiss: toast.autoDismiss !== undefined ? toast.autoDismiss : toast.type !=='error'
 };

 setToasts(prev => [...prev, newToast]);

 // Auto-dismiss after 4 seconds if not an error or if autoDismiss is true
 if (newToast.autoDismiss) {
 setTimeout(() => {
 removeToast(id);
 }, 4000);
 }

 return id;
 }, [removeToast]);

 const showSuccess = useCallback((title: string, message?: string) => {
 return showToast({ type:'success', title, message, autoDismiss: true });
 }, [showToast]);

 const showError = useCallback((title: string, message?: string) => {
 return showToast({ type:'error', title, message, autoDismiss: false });
 }, [showToast]);

 const showInfo = useCallback((title: string, message?: string) => {
 return showToast({ type:'info', title, message, autoDismiss: true });
 }, [showToast]);

 return (
 <ToastContext.Provider value={{ toasts, showToast, removeToast, showSuccess, showError, showInfo }}>
 {children}
 </ToastContext.Provider>
 );
};

export const useToast = (): ToastContextType => {
 const context = useContext(ToastContext);
 if (!context) {
 throw new Error('useToast must be used within a ToastProvider');
 }
 return context;
};
