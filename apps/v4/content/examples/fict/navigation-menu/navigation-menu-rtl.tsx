import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'

const translations = {
  ar: {
    dir: 'rtl',
    started: 'البدء',
    components: 'المكونات',
    docs: 'الوثائق',
    links: [
      ['مقدمة', 'مكونات قابلة لإعادة الاستخدام مبنية باستخدام Tailwind CSS.'],
      ['التثبيت', 'كيفية تثبيت التبعيات وتنظيم تطبيقك.'],
      ['الطباعة', 'أنماط للعناوين والفقرات والقوائم...إلخ'],
    ],
    componentLinks: [['حوار التنبيه', 'حوار نافذة يقطع المستخدم بمحتوى مهم ويتوقع استجابة.'], ['بطاقة التحويم', 'للمستخدمين المبصرين لمعاينة المحتوى المتاح خلف الرابط.'], ['التقدم', 'يعرض مؤشرًا يوضح تقدم إتمام المهمة، عادةً يتم عرضه كشريط تقدم.'], ['منطقة التمرير', 'يفصل المحتوى بصريًا أو دلاليًا.'], ['التبويبات', 'مجموعة من أقسام المحتوى المتعددة الطبقات—المعروفة بألواح التبويب—التي يتم عرضها واحدة في كل مرة.'], ['تلميح', 'نافذة منبثقة تعرض معلومات متعلقة بعنصر عندما يتلقى العنصر التركيز على لوحة المفاتيح أو عند تحويم الماوس فوقه.']],
  },
  he: {
    dir: 'rtl',
    started: 'התחלה',
    components: 'רכיבים',
    docs: 'תיעוד',
    links: [
      ['הקדמה', 'רכיבים לשימוש חוזר שנבנו עם Tailwind CSS.'],
      ['התקנה', 'כיצד להתקין תלויות ולבנות את האפליקציה שלך.'],
      ['טיפוגרפיה', "סגנונות לכותרות, פסקאות, רשימות...וכו'"],
    ],
    componentLinks: [['דיאלוג התראה', 'דיאלוג מודאלי שמפריע למשתמש עם תוכן חשוב ומצפה לתגובה.'], ['כרטיס ריחוף', 'למשתמשים רואים כדי להציג תצוגה מקדימה של תוכן זמין מאחורי קישור.'], ['התקדמות', 'מציג אינדיקטור המציג את התקדמות ההשלמה של משימה, בדרך כלל מוצג כסרגל התקדמות.'], ['אזור גלילה', 'מפריד תוכן חזותית או סמנטית.'], ['כרטיסיות', 'קבוצה של חלקי תוכן מרובדים—המכונים לוחות כרטיסיות—המוצגים אחד בכל פעם.'], ['טולטיפ', 'חלון קופץ המציג מידע הקשור לאלמנט כאשר האלמנט מקבל מיקוד מקלדת או כאשר העכבר מרחף מעליו.']],
  },
  en: {
    dir: 'ltr',
    started: 'Getting started',
    components: 'Components',
    docs: 'Docs',
    links: [
      ['Introduction', 'Re-usable components built with Tailwind CSS.'],
      ['Installation', 'How to install dependencies and structure your app.'],
      ['Typography', 'Styles for headings, paragraphs, lists...etc'],
    ],
    componentLinks: [['Alert Dialog', 'A modal dialog that interrupts the user with important content and expects a response.'], ['Hover Card', 'For sighted users to preview content available behind a link.'], ['Progress', 'Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.'], ['Scroll-area', 'Visually or semantically separates content.'], ['Tabs', 'A set of layered sections of content—known as tab panels—that are displayed one at a time.'], ['Tooltip', 'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.']],
  },
} as const

export default function NavigationMenuRtlExample() {
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
      <NavigationMenu dir={text().dir}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>{text().started}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul class="grid gap-3 p-4">
                {text().links.map(([title, description]) => (
                  <li>
                    <NavigationMenuLink href="/docs">
                      <strong class="block">{title}</strong>
                      <small>{description}</small>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>{text().components}</NavigationMenuTrigger>
            <NavigationMenuContent><ul class="grid gap-3 p-4">{text().componentLinks.map(([title, description]) => <li><NavigationMenuLink href="/docs/components"><strong class="block">{title}</strong><small>{description}</small></NavigationMenuLink></li>)}</ul></NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/docs">{text().docs}</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}
