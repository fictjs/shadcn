import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'

export default function InputOTPSeparatorExample() {
  return (
    <InputOTP maxLength={6} pattern={/^[0-9]$/}><InputOTPGroup>{[0, 1].map(index => <InputOTPSlot index={index} />)}</InputOTPGroup><InputOTPSeparator /><InputOTPGroup>{[2, 3].map(index => <InputOTPSlot index={index} />)}</InputOTPGroup><InputOTPSeparator /><InputOTPGroup>{[4, 5].map(index => <InputOTPSlot index={index} />)}</InputOTPGroup></InputOTP>
  )
}
