import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

const translations = {
  ar: [
    ['إظهار الحوار', 'هل أنت متأكد تمامًا؟', 'لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف حسابك نهائيًا من خوادمنا.', 'إلغاء', 'متابعة', false],
    ['إظهار الحوار (صغير)', 'السماح للملحق بالاتصال؟', 'هل تريد السماح لملحق USB بالاتصال بهذا الجهاز؟', 'عدم السماح', 'السماح', true],
  ],
  he: [
    ['הצג דיאלוג', 'האם אתה בטוח לחלוטין?', 'פעולה זו לא ניתנת לביטול. זה ימחק לצמיתות את החשבון שלך מהשרתים שלנו.', 'ביטול', 'המשך', false],
    ['הצג דיאלוג (קטן)', 'לאפשר להתקן להתחבר?', 'האם אתה רוצה לאפשר להתקן USB להתחבר למכשיר זה?', 'אל תאפשר', 'אפשר', true],
  ],
  en: [
    ['Show Dialog', 'Are you absolutely sure?', 'This action cannot be undone. This will permanently delete your account from our servers.', 'Cancel', 'Continue', false],
    ['Show Dialog (sm)', 'Allow accessory to connect?', 'Do you want to allow the USB accessory to connect to this device?', "Don't allow", 'Allow', true],
  ],
} as const

function BluetoothIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m7 7 10 10-5 4V3l5 4L7 17" /></svg>
}

export default function AlertDialogRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const direction = () => language === 'en' ? 'ltr' : 'rtl'

  return (
    <div dir={direction()}>
      <select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select>
      <div class="flex gap-2">
        {translations[language].map(([trigger, title, description, cancel, action, small]) => (
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="outline">{trigger}</Button></AlertDialogTrigger>
            <AlertDialogContent size={small ? 'sm' : 'default'} dir={direction()}>
              <AlertDialogHeader>{small ? <AlertDialogMedia><BluetoothIcon /></AlertDialogMedia> : null}<AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>{cancel}</AlertDialogCancel><AlertDialogAction>{action}</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ))}
      </div>
    </div>
  )
}
