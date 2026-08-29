import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

const translations = {
  ar: { dir: 'rtl', trigger: 'انقر بزر الماوس الأيمن هنا', navigation: 'التنقل', back: 'رجوع', forward: 'تقدم', reload: 'إعادة تحميل', more: 'المزيد من الأدوات', save: 'Save Page...', create: 'Create Shortcut...', name: 'Name Window...', developer: 'Developer Tools', delete: 'Delete', bookmarks: 'إظهار الإشارات المرجعية', urls: 'إظهار عناوين URL الكاملة', people: 'الأشخاص' },
  he: { dir: 'rtl', trigger: 'לחץ לחיצה ימנית כאן', navigation: 'ניווט', back: 'חזור', forward: 'קדימה', reload: 'רענן', more: 'כלים נוספים', save: 'שמור עמוד...', create: 'צור קיצור דרך...', name: 'שם חלון...', developer: 'כלי מפתח', delete: 'מחק', bookmarks: 'הצג סימניות', urls: 'הצג כתובות URL מלאות', people: 'אנשים' },
  en: { dir: 'ltr', trigger: 'Right click here', navigation: 'Navigation', back: 'Back', forward: 'Forward', reload: 'Reload', more: 'More Tools', save: 'Save Page...', create: 'Create Shortcut...', name: 'Name Window...', developer: 'Developer Tools', delete: 'Delete', bookmarks: 'Show Bookmarks', urls: 'Show Full URLs', people: 'People' },
} as const

export default function ContextMenuRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const t = translations[language]
  return (
    <div class="grid gap-4"><select aria-label="Preview language" value={language} onChange={event => language = event.currentTarget.value as keyof typeof translations}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select><ContextMenu dir={t.dir}><ContextMenuTrigger class="flex h-40 w-72 items-center justify-center rounded-md border border-dashed">{t.trigger}</ContextMenuTrigger><ContextMenuContent dir={t.dir} class="w-48"><ContextMenuSub><ContextMenuSubTrigger>{t.navigation}</ContextMenuSubTrigger><ContextMenuSubContent dir={t.dir}><ContextMenuItem>{t.back}<ContextMenuShortcut>⌘[</ContextMenuShortcut></ContextMenuItem><ContextMenuItem disabled>{t.forward}<ContextMenuShortcut>⌘]</ContextMenuShortcut></ContextMenuItem><ContextMenuItem>{t.reload}<ContextMenuShortcut>⌘R</ContextMenuShortcut></ContextMenuItem></ContextMenuSubContent></ContextMenuSub><ContextMenuSub><ContextMenuSubTrigger>{t.more}</ContextMenuSubTrigger><ContextMenuSubContent dir={t.dir}><ContextMenuItem>{t.save}</ContextMenuItem><ContextMenuItem>{t.create}</ContextMenuItem><ContextMenuItem>{t.name}</ContextMenuItem><ContextMenuSeparator /><ContextMenuItem>{t.developer}</ContextMenuItem><ContextMenuSeparator /><ContextMenuItem variant="destructive">{t.delete}</ContextMenuItem></ContextMenuSubContent></ContextMenuSub><ContextMenuSeparator /><ContextMenuCheckboxItem checked>{t.bookmarks}</ContextMenuCheckboxItem><ContextMenuCheckboxItem>{t.urls}</ContextMenuCheckboxItem><ContextMenuSeparator /><ContextMenuLabel>{t.people}</ContextMenuLabel><ContextMenuRadioGroup value="pedro"><ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem><ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem></ContextMenuRadioGroup></ContextMenuContent></ContextMenu></div>
  )
}
