import type { RegistryEntry } from '../types'

export const builtinBlocks: RegistryEntry[] = [
  {
    name: 'auth/login-form',
    version: '0.1.0',
    type: 'block',
    description: 'Authentication login form block',
    dependencies: [],
    registryDependencies: ['button', 'card', 'input', 'label'],
    files: [
      {
        path: '{{blocksDir}}/auth/login-form.tsx',
        content: context => `import { Button } from '${context.uiImport('button')}'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '${context.uiImport('card')}'
import { Input } from '${context.uiImport('input')}'
import { Label } from '${context.uiImport('label')}'

export function LoginForm() {
  return (
    <Card class='mx-auto w-full max-w-md'>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in with your email and password.</CardDescription>
      </CardHeader>
      <CardContent class='grid gap-4'>
        <div class='grid gap-2'>
          <Label htmlFor='email'>Email</Label>
          <Input id='email' type='email' placeholder='you@example.com' required />
        </div>
        <div class='grid gap-2'>
          <Label htmlFor='password'>Password</Label>
          <Input id='password' type='password' required />
        </div>
      </CardContent>
      <CardFooter>
        <Button class='w-full'>Sign in</Button>
      </CardFooter>
    </Card>
  )
}
`,
      },
    ],
  },
  {
    name: 'auth/signup-form',
    version: '0.1.0',
    type: 'block',
    description: 'Authentication sign-up form block',
    dependencies: [],
    registryDependencies: ['button', 'card', 'input', 'label'],
    files: [
      {
        path: '{{blocksDir}}/auth/signup-form.tsx',
        content: context => `import { Button } from '${context.uiImport('button')}'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '${context.uiImport('card')}'
import { Input } from '${context.uiImport('input')}'
import { Label } from '${context.uiImport('label')}'

export function SignupForm() {
  return (
    <Card class='mx-auto w-full max-w-md'>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Use your email to create a new workspace account.</CardDescription>
      </CardHeader>
      <CardContent class='grid gap-4'>
        <div class='grid gap-2'>
          <Label htmlFor='name'>Name</Label>
          <Input id='name' placeholder='Jane Doe' required />
        </div>
        <div class='grid gap-2'>
          <Label htmlFor='signup-email'>Email</Label>
          <Input id='signup-email' type='email' placeholder='you@example.com' required />
        </div>
        <div class='grid gap-2'>
          <Label htmlFor='signup-password'>Password</Label>
          <Input id='signup-password' type='password' required />
        </div>
      </CardContent>
      <CardFooter>
        <Button class='w-full'>Create account</Button>
      </CardFooter>
    </Card>
  )
}
`,
      },
    ],
  },
  {
    name: 'settings/profile',
    version: '0.1.0',
    type: 'block',
    description: 'Profile settings block',
    dependencies: [],
    registryDependencies: ['button', 'card', 'input', 'label', 'textarea', 'switch'],
    files: [
      {
        path: '{{blocksDir}}/settings/profile.tsx',
        content: context => `import { Button } from '${context.uiImport('button')}'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '${context.uiImport('card')}'
import { Input } from '${context.uiImport('input')}'
import { Label } from '${context.uiImport('label')}'
import { Switch } from '${context.uiImport('switch')}'
import { Textarea } from '${context.uiImport('textarea')}'

export function ProfileSettingsBlock() {
  return (
    <Card class='w-full max-w-2xl'>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Manage your public profile and notification preferences.</CardDescription>
      </CardHeader>
      <CardContent class='grid gap-6'>
        <div class='grid gap-2'>
          <Label htmlFor='display-name'>Display name</Label>
          <Input id='display-name' placeholder='Jane Doe' />
        </div>
        <div class='grid gap-2'>
          <Label htmlFor='bio'>Bio</Label>
          <Textarea id='bio' placeholder='Tell people what you are building...' />
        </div>
        <div class='flex items-center justify-between rounded-md border p-4'>
          <div class='space-y-0.5'>
            <Label htmlFor='marketing-emails'>Marketing emails</Label>
            <p class='text-sm text-muted-foreground'>Receive occasional feature updates.</p>
          </div>
          <Switch id='marketing-emails' />
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save profile</Button>
      </CardFooter>
    </Card>
  )
}
`,
      },
    ],
  },
  {
    name: 'dashboard/layout',
    version: '0.1.0',
    type: 'block',
    description: 'Dashboard layout scaffold',
    dependencies: [],
    registryDependencies: ['badge', 'card', 'separator'],
    files: [
      {
        path: '{{blocksDir}}/dashboard/layout.tsx',
        content: context => `import { Badge } from '${context.uiImport('badge')}'
import { Card, CardContent, CardHeader, CardTitle } from '${context.uiImport('card')}'
import { Separator } from '${context.uiImport('separator')}'

export function DashboardLayoutBlock() {
  return (
    <div class='grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]'>
      <aside class='border-r p-4'>
        <h2 class='text-lg font-semibold'>Fict Admin</h2>
        <p class='text-sm text-muted-foreground'>Fast UI with source ownership.</p>
      </aside>
      <main class='space-y-6 p-6'>
        <header class='space-y-2'>
          <div class='flex items-center gap-2'>
            <h1 class='text-2xl font-semibold'>Overview</h1>
            <Badge>Live</Badge>
          </div>
          <Separator />
        </header>
        <div class='grid gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader>
              <CardTitle>Signups</CardTitle>
            </CardHeader>
            <CardContent>
              <p class='text-3xl font-semibold'>1,284</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>MRR</CardTitle>
            </CardHeader>
            <CardContent>
              <p class='text-3xl font-semibold'>$18,402</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Churn</CardTitle>
            </CardHeader>
            <CardContent>
              <p class='text-3xl font-semibold'>1.8%</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
`,
      },
    ],
  },
  {
    name: 'dashboard/sidebar',
    version: '0.1.0',
    type: 'block',
    description: 'Dashboard sidebar navigation',
    dependencies: [],
    registryDependencies: ['button', 'separator'],
    files: [
      {
        path: '{{blocksDir}}/dashboard/sidebar.tsx',
        content: context => `import { Button } from '${context.uiImport('button')}'
import { Separator } from '${context.uiImport('separator')}'

const items = ['Overview', 'Analytics', 'Billing', 'Settings']

export function DashboardSidebarBlock() {
  return (
    <aside class='w-full max-w-xs rounded-lg border bg-card p-3'>
      <div class='px-2 py-3'>
        <h2 class='text-sm font-semibold'>Workspace</h2>
        <p class='text-xs text-muted-foreground'>Project navigation</p>
      </div>
      <Separator class='my-2' />
      <nav class='grid gap-1'>
        {items.map(item => (
          <Button variant='ghost' class='justify-start'>
            {item}
          </Button>
        ))}
      </nav>
    </aside>
  )
}
`,
      },
    ],
  },
  {
    name: 'tables/users-table',
    version: '0.1.0',
    type: 'block',
    description: 'Users table with filter and row actions',
    dependencies: [],
    registryDependencies: ['badge', 'button', 'input', 'table'],
    files: [
      {
        path: '{{blocksDir}}/tables/users-table.tsx',
        content: context => `import { Badge } from '${context.uiImport('badge')}'
import { Button } from '${context.uiImport('button')}'
import { Input } from '${context.uiImport('input')}'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '${context.uiImport('table')}'

const rows = [
  { id: 'u_001', name: 'Jane Doe', email: 'jane@example.com', role: 'Admin', status: 'Active' },
  { id: 'u_002', name: 'Sam Park', email: 'sam@example.com', role: 'Editor', status: 'Pending' },
  { id: 'u_003', name: 'Iris Chen', email: 'iris@example.com', role: 'Viewer', status: 'Active' },
]

export function UsersTableBlock() {
  return (
    <div class='space-y-4'>
      <div class='flex items-center justify-between gap-4'>
        <Input placeholder='Search users...' class='max-w-sm' />
        <Button>Add user</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class='text-right'>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(row => (
            <TableRow>
              <TableCell class='font-medium'>{row.name}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.role}</TableCell>
              <TableCell>
                <Badge variant={row.status === 'Active' ? 'default' : 'secondary'}>{row.status}</Badge>
              </TableCell>
              <TableCell class='text-right'>
                <Button variant='ghost' size='sm'>
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
`,
      },
    ],
  },
  {
    name: 'dialogs/confirm-delete',
    version: '0.1.0',
    type: 'block',
    description: 'Delete confirmation dialog block',
    dependencies: [],
    registryDependencies: ['alert-dialog', 'button'],
    files: [
      {
        path: '{{blocksDir}}/dialogs/confirm-delete.tsx',
        content: context => `import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '${context.uiImport('alert-dialog')}'
import { Button } from '${context.uiImport('button')}'

export function ConfirmDeleteBlock() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button variant='destructive'>Delete project</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your project and remove all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
`,
      },
    ],
  },
  {
    name: 'forms/validated-form',
    version: '0.1.0',
    type: 'block',
    description: 'Validated profile form block',
    dependencies: [],
    registryDependencies: ['button', 'form', 'input'],
    files: [
      {
        path: '{{blocksDir}}/forms/validated-form.tsx',
        content: context => `import { Button } from '${context.uiImport('button')}'
import { Form, FormControl, FormDescription, FormField, FormLabel, FormMessage } from '${context.uiImport('form')}'

export function ValidatedFormBlock() {
  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault()
    const form = event.currentTarget as HTMLFormElement | null
    if (!form) return

    const emailInput = form.elements.namedItem('email') as HTMLInputElement | null
    const message = form.querySelector('[data-form-message]') as HTMLElement | null
    if (!emailInput || !message) return

    const value = emailInput.value.trim()
    if (value.length === 0 || !value.includes('@')) {
      message.textContent = 'Please enter a valid email address.'
      return
    }
    message.textContent = 'Saved successfully.'
  }

  return (
    <Form class='grid gap-4 max-w-md' onSubmit={onSubmit}>
      <FormField name='email'>
        <FormLabel>Email</FormLabel>
        <FormControl
          as='input'
          name='email'
          type='email'
          placeholder='you@example.com'
          required
        />
        <FormDescription>We will only use this for account notifications.</FormDescription>
        <FormMessage data-form-message>Enter an email and submit to validate.</FormMessage>
      </FormField>
      <Button type='submit'>Save changes</Button>
    </Form>
  )
}
`,
      },
    ],
  },
]
