import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const translations = {
  ar: [
    ['كيف يمكنني إعادة تعيين كلمة المرور؟', "انقر على 'نسيت كلمة المرور' في صفحة تسجيل الدخول، أدخل عنوان بريدك الإلكتروني، وسنرسل لك رابطًا لإعادة تعيين كلمة المرور. سينتهي صلاحية الرابط خلال 24 ساعة."],
    ['هل يمكنني تغيير خطة الاشتراك الخاصة بي؟', 'نعم، يمكنك ترقية أو تخفيض خطتك في أي وقت من إعدادات حسابك. ستظهر التغييرات في دورة الفوترة التالية.'],
    ['ما هي طرق الدفع التي تقبلونها؟', 'نقبل جميع بطاقات الائتمان الرئيسية و PayPal والتحويلات المصرفية. تتم معالجة جميع المدفوعات بأمان من خلال شركاء الدفع لدينا.'],
  ],
  he: [
    ['איך אני מאפס את הסיסמה שלי?', "לחץ על 'שכחתי סיסמה' בעמוד ההתחברות, הזן את כתובת האימייל שלך, ונשלח לך קישור לאיפוס הסיסמה. הקישור יפוג תוך 24 שעות."],
    ['האם אני יכול לשנות את תוכנית המנוי שלי?', 'כן, אתה יכול לשדרג או להוריד את התוכנית שלך בכל עת מההגדרות של החשבון שלך. השינויים יבואו לידי ביטוי במחזור החיוב הבא.'],
    ['אילו אמצעי תשלום אתם מקבלים?', 'אנו מקבלים כרטיסי אשראי, PayPal והעברות בנקאיות.'],
  ],
  en: [
    ['How do I reset my password?', "Click on 'Forgot Password' on the login page, enter your email address, and we'll send you a link to reset your password. The link will expire in 24 hours."],
    ['Can I change my subscription plan?', 'Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes will be reflected in your next billing cycle.'],
    ['What payment methods do you accept?', 'We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely through our payment partners.'],
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
