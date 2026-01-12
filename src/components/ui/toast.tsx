import { CheckCircle, XCircle, AlertTriangle, Info, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastProps {
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default'
  title?: string
  description?: string
  icon?: React.ReactNode
  className?: string
}

const toastVariants = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
    icon: 'text-green-600 dark:text-green-400',
    defaultIcon: CheckCircle
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    icon: 'text-red-600 dark:text-red-400',
    defaultIcon: XCircle
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    icon: 'text-yellow-600 dark:text-yellow-400',
    defaultIcon: AlertTriangle
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
    icon: 'text-blue-600 dark:text-blue-400',
    defaultIcon: Info
  },
  default: {
    container: 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-200',
    icon: 'text-gray-600 dark:text-gray-400',
    defaultIcon: Bell
  }
}

export function Toast({ 
  variant = 'default', 
  title, 
  description, 
  icon, 
  className 
}: ToastProps) {
  const variantStyles = toastVariants[variant]
  const IconComponent = icon || variantStyles.defaultIcon

  return (
    <div className={cn(
      'flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm',
      'transition-all duration-300 ease-in-out',
      'animate-in slide-in-from-top-2 fade-in-0',
      variantStyles.container,
      className
    )}>
      <div className={cn('flex-shrink-0 mt-0.5', variantStyles.icon)}>
        {typeof IconComponent === 'function' ? (
          <IconComponent className="w-5 h-5" />
        ) : (
          IconComponent
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        {title && (
          <div className="font-semibold text-sm mb-1 leading-tight">
            {title}
          </div>
        )}
        {description && (
          <div className="text-sm opacity-90 leading-relaxed">
            {description}
          </div>
        )}
      </div>
    </div>
  )
}

// Export variant-specific components for easier usage
export const SuccessToast = (props: Omit<ToastProps, 'variant'>) => (
  <Toast {...props} variant="success" />
)

export const ErrorToast = (props: Omit<ToastProps, 'variant'>) => (
  <Toast {...props} variant="error" />
)

export const WarningToast = (props: Omit<ToastProps, 'variant'>) => (
  <Toast {...props} variant="warning" />
)

export const InfoToast = (props: Omit<ToastProps, 'variant'>) => (
  <Toast {...props} variant="info" />
)

export const DefaultToast = (props: Omit<ToastProps, 'variant'>) => (
  <Toast {...props} variant="default" />
)