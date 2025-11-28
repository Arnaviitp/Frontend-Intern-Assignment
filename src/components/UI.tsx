import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Types for toast
type ToastType = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// Toast Context
const ToastContext = createContext<{
  toasts: Toast[];
  addToast: (msg: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
} | null>(null);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const toastIdRef = React.useRef(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = React.useCallback(
    (msg: string, type: ToastType = 'info') => {
      const id = ++toastIdRef.current;
      setToasts((prev) => [...prev, { id, message: msg, type }]);
      // Auto remove after 3 seconds
      setTimeout(() => removeToast(id), 3000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  const showToast = (msg: string, type: ToastType = 'info') => ctx.addToast(msg, type);
  return { showToast, ToastComponent: <ToastContainer /> };
};

// Toast container component
const ToastContainer: React.FC = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;
  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {ctx.toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-2 rounded shadow-md text-white flex items-center gap-2 min-w-[200px] ${
            t.type === 'success'
              ? 'bg-green-600'
              : t.type === 'error'
                ? 'bg-red-600'
                : 'bg-blue-600'
          }`}
        >
          <span>{t.message}</span>
          <button
            onClick={() => ctx.removeToast(t.id)}
            className="ml-auto text-xs opacity-70 hover:opacity-100"
            aria-label="Close toast"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

// ---------- Modal ----------
interface ModalOptions {
  title: string;
  message: string;
  onConfirm: (value?: string) => void;
  showInput?: boolean; // if true, show a text input
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
}

const ModalContext = createContext<{
  modal: ModalOptions | null;
  openModal: (opts: ModalOptions) => void;
  closeModal: () => void;
} | null>(null);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modal, setModal] = useState<ModalOptions | null>(null);
  const [inputValue, setInputValue] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const openModal = (opts: ModalOptions) => {
    setInputValue('');
    setModal(opts);
  };
  const closeModal = () => setModal(null);

  const handleConfirm = () => {
    if (modal) {
      modal.onConfirm(modal.showInput ? inputValue : undefined);
    }
    closeModal();
  };

  // Auto-focus input when modal opens
  useEffect(() => {
    if (modal?.showInput) {
      // Small timeout to ensure element is rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [modal]);

  return (
    <ModalContext.Provider value={{ modal, openModal, closeModal }}>
      {children}
      {modal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all scale-100">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">{modal.title}</h2>
            <p className="mb-4 text-gray-600">{modal.message}</p>
            {modal.showInput && (
              <input
                ref={inputRef}
                type="text"
                placeholder={modal.placeholder ?? ''}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirm();
                  }
                }}
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                aria-label={modal.placeholder ?? 'Input'}
              />
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors"
              >
                {modal.cancelText ?? 'Cancel'}
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 font-medium transition-colors shadow-sm"
              >
                {modal.confirmText ?? 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  const showModal = (
    title: string,
    message: string,
    onConfirm: (value?: string) => void,
    showInput = false,
    placeholder?: string
  ) => {
    ctx.openModal({ title, message, onConfirm, showInput, placeholder });
  };
  return { showModal, ModalComponent: null };
};

// Export a combined provider to wrap the app
export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ToastProvider>
    <ModalProvider>{children}</ModalProvider>
  </ToastProvider>
);
