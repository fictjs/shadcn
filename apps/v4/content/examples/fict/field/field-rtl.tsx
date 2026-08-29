import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const translations = {
  ar: { dir: 'rtl', payment: 'طريقة الدفع', secure: 'جميع المعاملات آمنة ومشفرة', name: 'الاسم على البطاقة', billing: 'عنوان الفوترة', billingDescription: 'عنوان الفوترة المرتبط بطريقة الدفع الخاصة بك', shipping: 'نفس عنوان الشحن', comments: 'تعليقات', commentsPlaceholder: 'أضف أي تعليقات إضافية', submit: 'إرسال', cancel: 'إلغاء' },
  he: { dir: 'rtl', payment: 'אמצעי תשלום', secure: 'כל העסקאות מאובטחות ומוצפנות', name: 'שם על הכרטיס', billing: 'כתובת חיוב', billingDescription: 'כתובת החיוב המשויכת לאמצעי התשלום שלך', shipping: 'זהה לכתובת המשלוח', comments: 'הערות', commentsPlaceholder: 'הוסף הערות נוספות', submit: 'שלח', cancel: 'בטל' },
  en: { dir: 'ltr', payment: 'Payment Method', secure: 'All transactions are secure and encrypted', name: 'Name on Card', billing: 'Billing Address', billingDescription: 'The billing address associated with your payment method', shipping: 'Same as shipping address', comments: 'Comments', commentsPlaceholder: 'Add any additional comments', submit: 'Submit', cancel: 'Cancel' },
} as const

export default function FieldRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const t = translations[language]
  return (
    <div><select aria-label="Preview language" value={language} onChange={event => language = event.currentTarget.value as keyof typeof translations}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><form class="w-full max-w-md" dir={t.dir}><FieldGroup><FieldSet><FieldLegend>{t.payment}</FieldLegend><FieldDescription>{t.secure}</FieldDescription><Field><FieldLabel for="card-name-rtl">{t.name}</FieldLabel><Input id="card-name-rtl" placeholder="Evil Rabbit" /></Field><Field><FieldLabel for="card-number-rtl">Card Number</FieldLabel><Input id="card-number-rtl" placeholder="1234 5678 9012 3456" /></Field></FieldSet><FieldSeparator /><FieldSet><FieldLegend>{t.billing}</FieldLegend><FieldDescription>{t.billingDescription}</FieldDescription><Field orientation="horizontal"><Checkbox id="shipping-rtl" defaultChecked /><FieldLabel for="shipping-rtl">{t.shipping}</FieldLabel></Field></FieldSet><Field><FieldLabel for="comments-rtl">{t.comments}</FieldLabel><Textarea id="comments-rtl" placeholder={t.commentsPlaceholder} /></Field><Field orientation="horizontal"><Button type="submit">{t.submit}</Button><Button type="button" variant="outline">{t.cancel}</Button></Field></FieldGroup></form></div>
  )
}
