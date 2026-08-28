import {
  Toast,
  ToastAction,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'

export default function ToastDemoExample() {
  return (
    <ToastProvider>
      <ToastViewport>
        <Toast>
          <ToastTitle>Event created</ToastTitle>
          <ToastDescription>Sunday, August 29 at 9:00 AM</ToastDescription>
          <ToastAction altText="Undo">Undo</ToastAction>
        </Toast>
      </ToastViewport>
    </ToastProvider>
  )
}
