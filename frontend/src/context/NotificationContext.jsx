import { createContext, useContext, useState, useCallback, useRef } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const timerRefs = useRef({});

  const dismiss = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    clearTimeout(timerRefs.current[id]);
    delete timerRefs.current[id];
  }, []);

  const notify = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, type, title, message }]);
    timerRefs.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const success = useCallback((title, message) => notify({ type: 'success', title, message }), [notify]);
  const error   = useCallback((title, message) => notify({ type: 'error',   title, message }), [notify]);
  const warning = useCallback((title, message) => notify({ type: 'warning', title, message }), [notify]);
  const info    = useCallback((title, message) => notify({ type: 'info',    title, message }), [notify]);

  return (
    <NotificationContext.Provider value={{ notifications, notify, success, error, warning, info, dismiss }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
}
