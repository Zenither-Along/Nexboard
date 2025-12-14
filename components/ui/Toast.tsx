"use client"

import { useEffect, useState } from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { toast as toastManager, Toast as ToastType } from '@/lib/toast';

export function ToastContainer() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [toasts, setToasts] = useState<ToastType[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxWidth: 400,
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} isDark={isDark} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Toast({ toast, isDark }: { toast: ToastType; isDark: boolean }) {
  const config = {
    success: {
      icon: CheckCircle2,
      color: '#22c55e',
      bg: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
    },
    error: {
      icon: XCircle,
      color: '#ef4444',
      bg: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
    },
    warning: {
      icon: AlertTriangle,
      color: '#f59e0b',
      bg: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
    },
    info: {
      icon: Info,
      color: '#3b82f6',
      bg: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
    },
  };

  const { icon: Icon, color, bg } = config[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        borderRadius: 12,
        backgroundColor: isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        minWidth: 300,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          backgroundColor: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} color={color} strokeWidth={2} />
      </div>
      <p
        style={{
          flex: 1,
          fontSize: 14,
          color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)',
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        {toast.message}
      </p>
      <button
        onClick={() => toastManager.removeToast(toast.id)}
        className="touch-target"
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          border: 'none',
          backgroundColor: 'transparent',
          color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDark
            ? 'rgba(255,255,255,0.1)'
            : 'rgba(0,0,0,0.06)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <X size={18} />
      </button>
    </motion.div>
  );
}
