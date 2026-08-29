import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const translations = {
  ar: [
    [
      'تم الدفع بنجاح',
      'تمت معالجة دفعتك البالغة 29.99 دولارًا. تم إرسال إيصال إلى عنوان بريدك الإلكتروني.',
    ],
    ['ميزة جديدة متاحة', 'لقد أضفنا دعم الوضع الداكن. يمكنك تفعيله في إعدادات حسابك.'],
  ],
  he: [
    ['התשלום בוצע בהצלחה', 'התשלום שלך בסך 29.99 דולר עובד. קבלה נשלחה לכתובת האימייל שלך.'],
    ['תכונה חדשה זמינה', 'הוספנו תמיכה במצב כהה. אתה יכול להפעיל אותו בהגדרות החשבון שלך.'],
  ],
  en: [
    [
      'Payment successful',
      'Your payment of $29.99 has been processed. A receipt has been sent to your email address.',
    ],
    [
      'New feature available',
      "We've added dark mode support. You can enable it in your account settings.",
    ],
  ],
} as const

export default function AlertRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const direction = () => (language === 'en' ? 'ltr' : 'rtl')

  return (
    <div class="grid gap-4">
      <select
        value={language}
        onChange={event => {
          language = event.currentTarget.value as keyof typeof translations
        }}
      >
        <option value="ar">Arabic (العربية)</option>
        <option value="he">Hebrew (עברית)</option>
        <option value="en">English</option>
      </select>
      <div class="grid gap-4" dir={direction()}>
        {translations[language].map(([title, description]) => (
          <Alert>
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{description}</AlertDescription>
          </Alert>
        ))}
      </div>
    </div>
  )
}
