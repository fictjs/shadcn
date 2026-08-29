import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'

export default function InputOTPDemoExample() {
  return (
    <InputOTP defaultValue="123456" maxLength={6}><InputOTPGroup>{Array.from({ length: 6 }, (_, index) => <InputOTPSlot index={index} />)}</InputOTPGroup></InputOTP>
  )
}
