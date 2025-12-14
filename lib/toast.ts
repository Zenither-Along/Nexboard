/**
 * Toast Notification System
 * A lightweight, custom toast notification manager with support for
 * success, error, warning, info messages and confirm dialogs.
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

type ToastListener = (toasts: Toast[]) => void;
type ConfirmListener = (options: ConfirmOptions | null) => void;

class ToastManager {
  private toasts: Toast[] = [];
  private listeners: ToastListener[] = [];
  private confirmListeners: ConfirmListener[] = [];
  private confirmResolve: ((value: boolean) => void) | null = null;
  private nextId = 0;

  /**
   * Subscribe to toast updates
   */
  subscribe(listener: ToastListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Subscribe to confirm dialog updates
   */
  subscribeConfirm(listener: ConfirmListener): () => void {
    this.confirmListeners.push(listener);
    return () => {
      this.confirmListeners = this.confirmListeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of toast changes
   */
  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  /**
   * Notify all confirm listeners
   */
  private notifyConfirm(options: ConfirmOptions | null) {
    this.confirmListeners.forEach(listener => listener(options));
  }

  /**
   * Add a toast notification
   */
  private addToast(type: ToastType, message: string, duration = 4000): string {
    const id = `toast-${this.nextId++}`;
    const toast: Toast = { id, type, message, duration };
    
    this.toasts.push(toast);
    this.notify();

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    }

    return id;
  }

  /**
   * Remove a toast by ID
   */
  removeToast(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }

  /**
   * Show success toast
   */
  success(message: string, duration?: number): string {
    return this.addToast('success', message, duration);
  }

  /**
   * Show error toast
   */
  error(message: string, duration?: number): string {
    return this.addToast('error', message, duration);
  }

  /**
   * Show warning toast
   */
  warning(message: string, duration?: number): string {
    return this.addToast('warning', message, duration);
  }

  /**
   * Show info toast
   */
  info(message: string, duration?: number): string {
    return this.addToast('info', message, duration);
  }

  /**
   * Show confirm dialog
   */
  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmResolve = resolve;
      this.notifyConfirm(options);
    });
  }

  /**
   * Resolve confirm dialog
   */
  resolveConfirm(confirmed: boolean) {
    if (this.confirmResolve) {
      this.confirmResolve(confirmed);
      this.confirmResolve = null;
    }
    this.notifyConfirm(null);
  }

  /**
   * Get current toasts
   */
  getToasts(): Toast[] {
    return [...this.toasts];
  }
}

// Export singleton instance
export const toast = new ToastManager();
