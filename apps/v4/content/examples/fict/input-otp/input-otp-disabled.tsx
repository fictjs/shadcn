import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'

export default function InputOTPDisabledExample() {
  return (
    <InputOTP disabled defaultValue="123456" maxLength={6}><InputOTPGroup>{[0, 1, 2].map(index => <InputOTPSlot index={index} />)}</InputOTPGroup><InputOTPSeparator /><InputOTPGroup>{[3, 4, 5].map(index => <InputOTPSlot index={index} />)}</InputOTPGroup></InputOTP>
  )
}
