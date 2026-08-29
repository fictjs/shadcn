import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'

export default function InputOTPPatternExample() {
  return (
    <label class="grid gap-2">Digits Only<InputOTP maxLength={6} pattern={/^[0-9]$/}><InputOTPGroup>{Array.from({ length: 6 }, (_, index) => <InputOTPSlot index={index} aria-label={`Digit ${index + 1}`} />)}</InputOTPGroup></InputOTP></label>
  )
}
