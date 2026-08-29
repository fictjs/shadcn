import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'

export default function InputOTPControlledExample() {
  let value = $state('')

  return (
    <div class="grid gap-2"><InputOTP value={() => value} onValueChange={next => { value = next }} maxLength={6}><InputOTPGroup>{Array.from({ length: 6 }, (_, index) => <InputOTPSlot index={index} />)}</InputOTPGroup></InputOTP><p>{value ? `You entered: ${value}` : 'Enter your one-time password.'}</p></div>
  )
}
