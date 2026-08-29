import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from '@/components/ui/menubar'

const translations = {
  ar: { dir: 'rtl', file: 'ملف', edit: 'تعديل', view: 'عرض', profiles: 'الملفات الشخصية', newTab: 'علامة تبويب جديدة', newWindow: 'نافذة جديدة', share: 'مشاركة', email: 'رابط البريد الإلكتروني', print: 'طباعة...' },
  he: { dir: 'rtl', file: 'קובץ', edit: 'ערוך', view: 'תצוגה', profiles: 'פרופילים', newTab: 'כרטיסייה חדשה', newWindow: 'חלון חדש', share: 'שתף', email: 'קישור אימייל', print: 'הדפס...' },
  en: { dir: 'ltr', file: 'File', edit: 'Edit', view: 'View', profiles: 'Profiles', newTab: 'New Tab', newWindow: 'New Window', share: 'Share', email: 'Email link', print: 'Print...' },
} as const

export default function MenubarRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const t = translations[language]
  return (
    <div><select aria-label="Preview language" value={language} onChange={event => language = event.currentTarget.value as keyof typeof translations}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><Menubar class="w-72" dir={t.dir}><MenubarMenu><MenubarTrigger>{t.file}</MenubarTrigger><MenubarContent><MenubarItem>{t.newTab} <MenubarShortcut>⌘T</MenubarShortcut></MenubarItem><MenubarItem>{t.newWindow} <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem><MenubarSeparator /><MenubarSub><MenubarSubTrigger>{t.share}</MenubarSubTrigger><MenubarSubContent><MenubarItem>{t.email}</MenubarItem></MenubarSubContent></MenubarSub><MenubarSeparator /><MenubarItem>{t.print} <MenubarShortcut>⌘P</MenubarShortcut></MenubarItem></MenubarContent></MenubarMenu><MenubarMenu><MenubarTrigger>{t.edit}</MenubarTrigger><MenubarContent><MenubarItem>Undo</MenubarItem><MenubarItem>Redo</MenubarItem></MenubarContent></MenubarMenu><MenubarMenu><MenubarTrigger>{t.view}</MenubarTrigger><MenubarContent><MenubarItem>Reload</MenubarItem></MenubarContent></MenubarMenu><MenubarMenu><MenubarTrigger>{t.profiles}</MenubarTrigger><MenubarContent><MenubarItem>Benoit</MenubarItem></MenubarContent></MenubarMenu></Menubar></div>
  )
}
