import type { RegistryEntry } from '../types'

export const builtinThemes: RegistryEntry[] = [
  {
    name: 'theme-default',
    version: '0.1.0',
    type: 'theme',
    description: 'Default neutral theme tokens',
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: '{{themesDir}}/theme-default.css',
        content: () => `.theme-default {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --ring: 222.2 84% 4.9%;
}

.dark.theme-default {
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --ring: 212.7 26.8% 83.9%;
}
`,
      },
    ],
  },
  {
    name: 'theme-slate',
    version: '0.1.0',
    type: 'theme',
    description: 'Slate color palette',
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: '{{themesDir}}/theme-slate.css',
        content: () => `.theme-slate {
  --primary: 215 28% 17%;
  --primary-foreground: 210 40% 98%;
  --secondary: 215 25% 27%;
  --secondary-foreground: 210 40% 98%;
  --accent: 217 33% 17%;
  --accent-foreground: 210 40% 98%;
  --ring: 215 20% 65%;
}

.dark.theme-slate {
  --primary: 210 40% 98%;
  --primary-foreground: 215 28% 17%;
  --secondary: 217 33% 17%;
  --secondary-foreground: 210 40% 98%;
  --accent: 215 25% 27%;
  --accent-foreground: 210 40% 98%;
  --ring: 215 20% 65%;
}
`,
      },
    ],
  },
  {
    name: 'theme-zinc',
    version: '0.1.0',
    type: 'theme',
    description: 'Zinc color palette',
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: '{{themesDir}}/theme-zinc.css',
        content: () => `.theme-zinc {
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --ring: 240 5% 64.9%;
}

.dark.theme-zinc {
  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --ring: 240 4.9% 83.9%;
}
`,
      },
    ],
  },
  {
    name: 'theme-stone',
    version: '0.1.0',
    type: 'theme',
    description: 'Stone color palette',
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: '{{themesDir}}/theme-stone.css',
        content: () => `.theme-stone {
  --primary: 24 9.8% 10%;
  --primary-foreground: 60 9.1% 97.8%;
  --secondary: 20 5.9% 90%;
  --secondary-foreground: 24 9.8% 10%;
  --accent: 12 6.5% 15.1%;
  --accent-foreground: 60 9.1% 97.8%;
  --ring: 24 5.4% 63.9%;
}

.dark.theme-stone {
  --primary: 60 9.1% 97.8%;
  --primary-foreground: 24 9.8% 10%;
  --secondary: 12 6.5% 15.1%;
  --secondary-foreground: 60 9.1% 97.8%;
  --accent: 20 5.9% 90%;
  --accent-foreground: 24 9.8% 10%;
  --ring: 24 5.4% 63.9%;
}
`,
      },
    ],
  },
  {
    name: 'theme-brand-ocean',
    version: '0.1.0',
    type: 'theme',
    description: 'Brand-oriented ocean palette',
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: '{{themesDir}}/theme-brand-ocean.css',
        content: () => `.theme-brand-ocean {
  --primary: 199 89% 48%;
  --primary-foreground: 0 0% 100%;
  --secondary: 204 94% 94%;
  --secondary-foreground: 199 89% 28%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 199 89% 28%;
  --ring: 199 89% 48%;
}

.dark.theme-brand-ocean {
  --primary: 199 89% 56%;
  --primary-foreground: 210 40% 8%;
  --secondary: 199 70% 22%;
  --secondary-foreground: 210 40% 98%;
  --accent: 199 70% 22%;
  --accent-foreground: 210 40% 98%;
  --ring: 199 89% 56%;
}
`,
      },
    ],
  },
]
