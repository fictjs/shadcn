import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'

export default function InputOTPAlphanumericExample() {
  return (
    <InputOTP maxLength={6} pattern={/^[a-zA-Z0-9]$/}><InputOTPGroup>{[0, 1, 2].map(index => <InputOTPSlot index={index} />)}</InputOTPGroup><InputOTPSeparator /><InputOTPGroup>{[3, 4, 5].map(index => <InputOTPSlot index={index} />)}</InputOTPGroup></InputOTP>
  )
}
