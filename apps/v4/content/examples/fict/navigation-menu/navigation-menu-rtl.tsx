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
            <NavigationMenuContent>
              <NavigationMenuLink href="/docs/components">{text().components}</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/docs">{text().docs}</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}
