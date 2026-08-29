import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from '@/components/ui/avatar'

const translations = { ar: '+٣', he: '+3', en: '+3' } as const

export default function AvatarRtlExample() {
  let language = $state<keyof typeof translations>('ar')
  const direction = () => language === 'en' ? 'ltr' : 'rtl'

  return (
    <div class="grid gap-4">
      <select value={language} onChange={event => { language = event.currentTarget.value as keyof typeof translations }}><option value="ar">Arabic (العربية)</option><option value="he">Hebrew (עברית)</option><option value="en">English</option></select>
      <div class="flex flex-wrap items-center gap-6 md:gap-12" dir={direction()}>
        <Avatar><AvatarImage class="grayscale" src="https://github.com/shadcn.png" alt="@shadcn" /><AvatarFallback>CN</AvatarFallback></Avatar>
        <Avatar><AvatarImage src="https://github.com/evilrabbit.png" alt="@evilrabbit" /><AvatarFallback>ER</AvatarFallback><AvatarBadge class="bg-green-600 dark:bg-green-800" /></Avatar>
        <AvatarGroup class="grayscale">
          <Avatar><AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" /><AvatarFallback>CN</AvatarFallback></Avatar>
          <Avatar><AvatarImage src="https://github.com/maxleiter.png" alt="@maxleiter" /><AvatarFallback>LR</AvatarFallback></Avatar>
          <Avatar><AvatarImage src="https://github.com/evilrabbit.png" alt="@evilrabbit" /><AvatarFallback>ER</AvatarFallback></Avatar>
          <AvatarGroupCount>{translations[language]}</AvatarGroupCount>
        </AvatarGroup>
      </div>
    </div>
  )
}
