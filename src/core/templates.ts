import { parse, type ParseError } from 'jsonc-parser'

const DESIGN_TOKENS_BLOCK = `/* @fictcn tokens:start */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}
/* @fictcn tokens:end */`

export function createGlobalsCss(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

${DESIGN_TOKENS_BLOCK}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground antialiased;
  }
}
`
}

export function createCnUtility(): string {
  return `import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
`
}

export function createVariantsUtility(): string {
  return `export { cva, type VariantProps } from 'class-variance-authority'
`
}

export function createTailwindConfig(): string {
  return `import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [animate],
}

export default config
`
}

export function createPostcssConfig(): string {
  return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`
}

export function createTsconfigPathPatch(
  tsconfigContent: string,
  aliasPathKey = '@/*',
  aliasPathTarget = 'src/*',
): string | null {
  try {
    const errors: ParseError[] = []
    const parsed = parse(tsconfigContent, errors, {
      allowTrailingComma: true,
      disallowComments: false,
    }) as
      | {
          compilerOptions?: {
            baseUrl?: string
            paths?: Record<string, string[]>
          }
        }
      | null

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || errors.length > 0) {
      return null
    }

    const tsconfig = parsed as {
      compilerOptions?: {
        baseUrl?: string
        paths?: Record<string, string[]>
      }
    }

    if (!tsconfig.compilerOptions) {
      tsconfig.compilerOptions = {}
    }
    tsconfig.compilerOptions.baseUrl = tsconfig.compilerOptions.baseUrl ?? '.'

    if (!tsconfig.compilerOptions.paths) {
      tsconfig.compilerOptions.paths = {}
    }

    tsconfig.compilerOptions.paths[aliasPathKey] = [aliasPathTarget]

    return `${JSON.stringify(tsconfig, null, 2)}\n`
  } catch {
    return null
  }
}

export function patchTailwindConfig(current: string): string {
  let patched = current

  if (!patched.includes("'./src/**/*.{ts,tsx}'") && !patched.includes('"./src/**/*.{ts,tsx}"')) {
    const contentMatch = patched.match(/content\s*:\s*\[(?<content>[\s\S]*?)\]/)
    if (contentMatch?.index !== undefined) {
      patched =
        patched.slice(0, contentMatch.index) +
        "content: ['./src/**/*.{ts,tsx}']," +
        patched.slice(contentMatch.index + contentMatch[0].length)
    }
  }

  if (!patched.includes('tailwindcss-animate')) {
    patched = `import animate from 'tailwindcss-animate'\n${patched}`
  }

  if (patched.includes('plugins: [')) {
    patched = patched.replace(/plugins\s*:\s*\[(?<plugins>[\s\S]*?)\]/m, (_, plugins: string) => {
      if (plugins.includes('animate')) return `plugins: [${plugins}]`
      const normalized = plugins.trim()
      return normalized.length > 0 ? `plugins: [${normalized}, animate]` : 'plugins: [animate]'
    })
  } else {
    patched = patched.replace(/theme\s*:\s*\{[\s\S]*?\},/, match => `${match}\n  plugins: [animate],`)
  }

  return patched
}
