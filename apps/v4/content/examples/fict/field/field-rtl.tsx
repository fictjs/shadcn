import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
const years = ['2024', '2025', '2026', '2027', '2028', '2029']

const translations = {
  ar: { dir: 'rtl', payment: 'طريقة الدفع', secure: 'جميع المعاملات آمنة ومشفرة', name: 'الاسم على البطاقة', cardNumber: 'رقم البطاقة', cardNumberDescription: 'أدخل رقم البطاقة المكون من 16 رقمًا', month: 'الشهر', year: 'السنة', billing: 'عنوان الفوترة', billingDescription: 'عنوان الفوترة المرتبط بطريقة الدفع الخاصة بك', shipping: 'نفس عنوان الشحن', comments: 'تعليقات', commentsPlaceholder: 'أضف أي تعليقات إضافية', submit: 'إرسال', cancel: 'إلغاء' },
  he: { dir: 'rtl', payment: 'אמצעי תשלום', secure: 'כל העסקאות מאובטחות ומוצפנות', name: 'שם על הכרטיס', cardNumber: 'מספר כרטיס', cardNumberDescription: 'הזן את מספר הכרטיס בן 16 הספרות שלך', month: 'חודש', year: 'שנה', billing: 'כתובת חיוב', billingDescription: 'כתובת החיוב המשויכת לאמצעי התשלום שלך', shipping: 'זהה לכתובת המשלוח', comments: 'הערות', commentsPlaceholder: 'הוסף הערות נוספות', submit: 'שלח', cancel: 'בטל' },
  en: { dir: 'ltr', payment: 'Payment Method', secure: 'All transactions are secure and encrypted', name: 'Name on Card', cardNumber: 'Card Number', cardNumberDescription: 'Enter your 16-digit card number', month: 'Month', year: 'Year', billing: 'Billing Address', billingDescription: 'The billing address associated with your payment method', shipping: 'Same as shipping address', comments: 'Comments', commentsPlaceholder: 'Add any additional comments', submit: 'Submit', cancel: 'Cancel' },
} as const

export default function FieldRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const t = translations[language]
  const monthLabel = (month: string) => language === 'ar' ? new Intl.NumberFormat('ar-SA', { useGrouping: false }).format(Number(month)) : month

  return (
    <div><select aria-label="Preview language" value={language} onChange={event => language = event.currentTarget.value as keyof typeof translations}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><form class="w-full max-w-md" dir={t.dir}><FieldGroup><FieldSet><FieldLegend>{t.payment}</FieldLegend><FieldDescription>{t.secure}</FieldDescription><FieldGroup><Field><FieldLabel for="card-name-rtl">{t.name}</FieldLabel><Input id="card-name-rtl" placeholder="Evil Rabbit" required /></Field><Field><FieldLabel for="card-number-rtl">{t.cardNumber}</FieldLabel><Input id="card-number-rtl" placeholder="1234 5678 9012 3456" required /><FieldDescription>{t.cardNumberDescription}</FieldDescription></Field><div class="grid grid-cols-3 gap-4"><Field><FieldLabel for="month-rtl">{t.month}</FieldLabel><Select><SelectTrigger id="month-rtl"><SelectValue placeholder="MM" /></SelectTrigger><SelectContent dir={t.dir}><SelectGroup>{months.map(month => <SelectItem value={month}>{monthLabel(month)}</SelectItem>)}</SelectGroup></SelectContent></Select></Field><Field><FieldLabel for="year-rtl">{t.year}</FieldLabel><Select><SelectTrigger id="year-rtl"><SelectValue placeholder="YYYY" /></SelectTrigger><SelectContent dir={t.dir}><SelectGroup>{years.map(year => <SelectItem value={year}>{year}</SelectItem>)}</SelectGroup></SelectContent></Select></Field><Field><FieldLabel for="cvv-rtl">CVV</FieldLabel><Input id="cvv-rtl" placeholder="123" required /></Field></div></FieldGroup></FieldSet><FieldSeparator /><FieldSet><FieldLegend>{t.billing}</FieldLegend><FieldDescription>{t.billingDescription}</FieldDescription><FieldGroup><Field orientation="horizontal"><Checkbox id="shipping-rtl" defaultChecked /><FieldLabel for="shipping-rtl" class="font-normal">{t.shipping}</FieldLabel></Field></FieldGroup></FieldSet><FieldSet><FieldGroup><Field><FieldLabel for="comments-rtl">{t.comments}</FieldLabel><Textarea id="comments-rtl" placeholder={t.commentsPlaceholder} class="resize-none" /></Field></FieldGroup></FieldSet><Field orientation="horizontal"><Button type="submit">{t.submit}</Button><Button type="button" variant="outline">{t.cancel}</Button></Field></FieldGroup></form></div>
  )
}
