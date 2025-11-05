import { HTMLAttributes } from 'react'
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react'

export type AlertType = 'info' | 'success' | 'warning' | 'error'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  type?: AlertType
  title?: string
  closable?: boolean
  onClose?: () => void
}

export function Alert({
  type = 'info',
  title,
  children,
  closable,
  onClose,
  className = '',
  ...props
}: AlertProps) {
  const styles = {
    info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200',
    success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-900 dark:text-green-200',
    warning: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-200',
    error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200',
  }

  const icons = {
    info: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
    success: <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />,
    error: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
  }

  return (
    <div
      className={`flex items-start gap-3 p-4 border rounded-lg ${styles[type]} ${className}`}
      role="alert"
      {...props}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold mb-1">{title}</div>}
        {children && <div className="text-sm">{children}</div>}
      </div>
      {closable && (
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
