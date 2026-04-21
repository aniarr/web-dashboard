import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={5000}>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const Icon = 
          variant === "success" ? CheckCircle2 : 
          variant === "destructive" ? AlertCircle : 
          variant === "warning" ? AlertTriangle : 
          Info;

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 shrink-0 opacity-90" />
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
