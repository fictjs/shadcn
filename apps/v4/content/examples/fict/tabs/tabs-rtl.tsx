import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const translations = {
  ar: {
    dir: 'rtl',
    tabs: [
      ['overview', 'نظرة عامة', 'عرض مقاييسك الرئيسية وأنشطة المشروع الأخيرة. تتبع التقدم عبر جميع مشاريعك النشطة.', 'لديك ١٢ مشروعًا نشطًا و٣ مهام معلقة.'],
      ['analytics', 'التحليلات', 'تتبع مقاييس الأداء ومشاركة المستخدمين. راقب الاتجاهات وحدد فرص النمو.', 'زادت مشاهدات الصفحة بنسبة ٢٥٪ مقارنة بالشهر الماضي.'],
      ['reports', 'التقارير', 'إنشاء وتنزيل تقاريرك التفصيلية. تصدير البيانات بتنسيقات متعددة للتحليل.', 'لديك ٥ تقارير جاهزة ومتاحة للتصدير.'],
      ['settings', 'الإعدادات', 'إدارة تفضيلات حسابك وخياراته. تخصيص تجربتك لتناسب احتياجاتك.', 'تكوين الإشعارات والأمان والسمات.'],
    ],
  },
  he: {
    dir: 'rtl',
    tabs: [
      ['overview', 'סקירה כללית', 'הצג את המדדים העיקריים שלך ופעילות הפרויקט האחרונה.', 'יש לך 12 פרויקטים פעילים ו-3 משימות ממתינות.'],
      ['analytics', 'אנליטיקה', 'עקוב אחר ביצועים ומדדי מעורבות משתמשים.', 'צפיות בדף עלו ב-25% בהשוואה לחודש שעבר.'],
      ['reports', 'דוחות', 'צור והורד את הדוחות המפורטים שלך.', 'יש לך 5 דוחות מוכנים וזמינים לייצוא.'],
      ['settings', 'הגדרות', 'נהל את העדפות החשבון והאפשרויות שלך.', 'הגדר התראות, אבטחה וערכות נושא.'],
    ],
  },
  en: {
    dir: 'ltr',
    tabs: [
      ['overview', 'Overview', 'View your key metrics and recent project activity.', 'You have 12 active projects and 3 pending tasks.'],
      ['analytics', 'Analytics', 'Track performance and user engagement metrics.', 'Page views are up 25% compared to last month.'],
      ['reports', 'Reports', 'Generate and download your detailed reports.', 'You have 5 reports ready and available to export.'],
      ['settings', 'Settings', 'Manage your account preferences and options.', 'Configure notifications, security, and themes.'],
    ],
  },
} as const

export default function TabsRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const locale = translations[language]
  return (
    <div>
      <select aria-label="Preview language" value={language} onChange={event => language = event.currentTarget.value as keyof typeof translations}>
        <option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option>
      </select>
      <Tabs defaultValue="overview" class="w-full max-w-sm" dir={locale.dir}>
        <TabsList>{locale.tabs.map(([value, label]) => <TabsTrigger value={value}>{label}</TabsTrigger>)}</TabsList>
        {locale.tabs.map(([value, label, description, content]) => (
          <TabsContent value={value}>
            <Card dir={locale.dir}>
              <CardHeader><CardTitle>{label}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
              <CardContent class="text-sm text-muted-foreground">{content}</CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
