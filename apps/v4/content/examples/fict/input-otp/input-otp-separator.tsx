import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'

export default function InputOTPSeparatorExample() {
  return (
    <InputOTP><InputOTPGroup>{[0, 1, 2].map(index => <InputOTPSlot index={index} total={6} />)}</InputOTPGroup><InputOTPSeparator /><InputOTPGroup>{[3, 4, 5].map(index => <InputOTPSlot index={index} total={6} />)}</InputOTPGroup></InputOTP>
  )
}
