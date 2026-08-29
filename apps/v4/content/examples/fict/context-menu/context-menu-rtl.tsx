import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

const translations = {
  ar: {
    dir: 'rtl',
    trigger: 'انقر بزر الماوس الأيمن هنا',
    back: 'رجوع',
    forward: 'تقدم',
    reload: 'إعادة تحميل',
    more: 'المزيد من الأدوات',
    save: 'حفظ الصفحة باسم...',
    navigation: 'التنقل',
  },
  he: {
    dir: 'rtl',
    trigger: 'לחץ לחיצה ימנית כאן',
    back: 'חזרה',
    forward: 'קדימה',
    reload: 'טעינה מחדש',
    more: 'כלים נוספים',
    save: 'שמירת הדף בשם...',
    navigation: 'ניווט',
  },
  en: {
    dir: 'ltr',
    trigger: 'Right click here',
    back: 'Back',
    forward: 'Forward',
    reload: 'Reload',
    more: 'More Tools',
    save: 'Save Page As...',
    navigation: 'Navigation',
  },
} as const

export default function ContextMenuRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const text = () => translations[language]
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
      <ContextMenu dir={text().dir}>
        <ContextMenuTrigger class="flex h-40 w-72 items-center justify-center rounded-md border border-dashed">
          {text().trigger}
        </ContextMenuTrigger>
        <ContextMenuContent dir={text().dir}>
          <ContextMenuItem>
            {text().back}
            <ContextMenuShortcut>⌘[</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem disabled>
            {text().forward}
            <ContextMenuShortcut>⌘]</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            {text().reload}
            <ContextMenuShortcut>⌘R</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>{text().navigation}</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>{text().more}</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>
                {text().save}
                <ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}
