import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'

const translations = {
  ar: { dir: 'rtl', label: 'رمز التحقق' },
  he: { dir: 'rtl', label: 'קוד אימות' },
  en: { dir: 'ltr', label: 'Verification code' },
} as const

export default function InputOTPRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const text = () => translations[language]

  return (
    <label class="grid gap-2" dir={text().dir}><select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select>{text().label}<InputOTP dir={text().dir} defaultValue="123456" maxLength={6}><InputOTPGroup>{Array.from({ length: 6 }, (_, index) => <InputOTPSlot index={index} />)}</InputOTPGroup></InputOTP></label>
  )
}
