import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View } from 'react-native';
import ToastMessage from '../components/ToastMessage';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    message: '',
    type: 'info', // success, error, info
    title: '',
  });

  const hideTimeout = useRef(null);

  const showToast = useCallback((message, type = 'info', title = '') => {
    // Clear any existing timeout so it doesn't hide early if triggered repeatedly
    if (hideTimeout.current) clearTimeout(hideTimeout.current);

    setToastConfig({ visible: true, message, type, title });

    hideTimeout.current = setTimeout(() => {
      hideToast();
    }, 3000); // 3 second duration
  }, []);

  const hideToast = useCallback(() => {
    setToastConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastMessage
        visible={toastConfig.visible}
        message={toastConfig.message}
        title={toastConfig.title}
        type={toastConfig.type}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
