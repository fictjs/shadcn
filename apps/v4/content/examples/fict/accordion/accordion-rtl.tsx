import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const translations = {
  ar: [
    ['كيف يمكنني إعادة تعيين كلمة المرور؟', "انقر على 'نسيت كلمة المرور' في صفحة تسجيل الدخول وسنرسل لك رابط إعادة التعيين."],
    ['هل يمكنني تغيير خطة الاشتراك الخاصة بي؟', 'نعم، يمكنك ترقية أو تخفيض خطتك من إعدادات حسابك.'],
    ['ما هي طرق الدفع التي تقبلونها؟', 'نقبل بطاقات الائتمان وPayPal والتحويلات المصرفية.'],
  ],
  he: [
    ['איך אני מאפס את הסיסמה שלי?', 'לחץ על שכחתי סיסמה ונשלח לך קישור לאיפוס.'],
    ['האם אני יכול לשנות את תוכנית המנוי?', 'כן, ניתן לשנות את התוכנית בהגדרות החשבון.'],
    ['אילו אמצעי תשלום אתם מקבלים?', 'אנו מקבלים כרטיסי אשראי, PayPal והעברות בנקאיות.'],
  ],
  en: [
    ['How do I reset my password?', 'Choose Forgot Password and we will send you a reset link.'],
    ['Can I change my subscription plan?', 'Yes, change your plan from account settings.'],
    ['What payment methods do you accept?', 'We accept cards, PayPal, and bank transfers.'],
  ],
} as const

export default function AccordionRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const direction = () => language === 'en' ? 'ltr' : 'rtl'

  return (
    <div class="grid gap-4">
      <select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}>
        <option value="ar">Arabic (العربية)</option>
        <option value="he">Hebrew (עברית)</option>
        <option value="en">English</option>
      </select>
      <Accordion type="single" collapsible defaultValue="item-1" dir={direction()} class="max-w-md">
        {translations[language].map((item, index) => (
          <AccordionItem value={`item-${index + 1}`}>
            <AccordionTrigger>{item[0]}</AccordionTrigger>
            <AccordionContent>{item[1]}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
