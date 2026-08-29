import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const translations = {
  ar: { title: 'تسجيل الدخول إلى حسابك', description: 'أدخل بريدك الإلكتروني أدناه لتسجيل الدخول إلى حسابك', signUp: 'إنشاء حساب', email: 'البريد الإلكتروني', password: 'كلمة المرور', forgot: 'نسيت كلمة المرور؟', login: 'تسجيل الدخول', google: 'تسجيل الدخول باستخدام Google' },
  he: { title: 'התחבר לחשבון שלך', description: 'הזן את האימייל שלך למטה כדי להתחבר לחשבון שלך', signUp: 'הירשם', email: 'אימייל', password: 'סיסמה', forgot: 'שכחת את הסיסמה?', login: 'התחבר', google: 'התחבר עם Google' },
  en: { title: 'Login to your account', description: 'Enter your email below to login to your account', signUp: 'Sign Up', email: 'Email', password: 'Password', forgot: 'Forgot your password?', login: 'Login', google: 'Login with Google' },
} as const

export default function CardRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const direction = () => language === 'en' ? 'ltr' : 'rtl'
  const text = () => translations[language]

  return (
    <div class="grid gap-4"><select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select>
      <Card class="w-full max-w-sm" dir={direction()}><CardHeader><CardTitle>{text().title}</CardTitle><CardDescription>{text().description}</CardDescription><CardAction><Button variant="link">{text().signUp}</Button></CardAction></CardHeader><CardContent><form><div class="flex flex-col gap-6"><div class="grid gap-2"><Label for="email-rtl">{text().email}</Label><Input id="email-rtl" type="email" placeholder="m@example.com" required /></div><div class="grid gap-2"><div class="flex items-center"><Label for="password-rtl">{text().password}</Label><a href="#" class="ms-auto text-sm underline-offset-4 hover:underline">{text().forgot}</a></div><Input id="password-rtl" type="password" required /></div></div></form></CardContent><CardFooter class="flex-col gap-2"><Button type="submit" class="w-full">{text().login}</Button><Button variant="outline" class="w-full">{text().google}</Button></CardFooter></Card>
    </div>
  )
}
