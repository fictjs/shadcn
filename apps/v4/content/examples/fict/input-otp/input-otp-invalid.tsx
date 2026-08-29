import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'

export default function InputOTPInvalidExample() {
  return (
    <InputOTP defaultValue="000000" maxLength={6} aria-invalid="true"><InputOTPGroup>{[0, 1].map(index => <InputOTPSlot index={index} aria-invalid="true" />)}</InputOTPGroup><InputOTPSeparator /><InputOTPGroup>{[2, 3].map(index => <InputOTPSlot index={index} aria-invalid="true" />)}</InputOTPGroup><InputOTPSeparator /><InputOTPGroup>{[4, 5].map(index => <InputOTPSlot index={index} aria-invalid="true" />)}</InputOTPGroup></InputOTP>
  )
}
