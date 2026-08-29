import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'

export default function InputOTPFourDigitsExample() {
  return (
    <InputOTP maxLength={4} pattern={/^[0-9]$/}><InputOTPGroup>{Array.from({ length: 4 }, (_, index) => <InputOTPSlot index={index} />)}</InputOTPGroup></InputOTP>
  )
}
