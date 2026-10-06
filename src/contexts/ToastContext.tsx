import { useCallback, useState, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { ToastContext, type ToastItem, type ToastType } from './toastContextValue'

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      removeToast(id)
    }, 3500)
  }, [removeToast])

  const success = useCallback((message: string) => showToast(message, 'success'), [showToast])
  const error = useCallback((message: string) => showToast(message, 'error'), [showToast])
  const info = useCallback((message: string) => showToast(message, 'info'), [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-5 right-5 z-50 flex max-w-md flex-col gap-2.5 sm:bottom-6 sm:right-6"
        aria-live="polite"
        aria-label="Thông báo hệ thống"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success'
          const isError = toast.type === 'error'

          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl p-4 shadow-xl ring-1 backdrop-blur-md transition-all duration-300 ${
                isSuccess
                  ? 'bg-slate-900/95 text-emerald-300 ring-emerald-500/40'
                  : isError
                    ? 'bg-slate-900/95 text-red-300 ring-red-500/40'
                    : 'bg-slate-900/95 text-slate-100 ring-slate-700/50'
              }`}
            >
              {isSuccess && <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" aria-hidden="true" />}
              {isError && <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" aria-hidden="true" />}
              {!isSuccess && !isError && <Info size={18} className="mt-0.5 shrink-0 text-blue-400" aria-hidden="true" />}

              <p className="text-sm font-medium leading-5 text-white">{toast.message}</p>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="ml-auto -mr-1 -mt-1 rounded-lg p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label="Đóng thông báo"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
