/** @jsxImportSource fict */

import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { renderFict } from './render-fict'

const meta = {
  title: 'Fict Shadcn/Form Card',
  tags: ['fict', 'shadcn'],
  render: () =>
    renderFict(() => (
      <div class='w-[420px] p-6'>
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Enter your account credentials below.</CardDescription>
          </CardHeader>
          <CardContent class='grid gap-4'>
            <div class='grid gap-2'>
              <label class='text-sm font-medium'>Email</label>
              <Input type='email' placeholder='you@example.com' />
            </div>
            <div class='grid gap-2'>
              <label class='text-sm font-medium'>Password</label>
              <Input type='password' />
            </div>
          </CardContent>
          <CardFooter class='flex justify-end gap-2'>
            <Button variant='secondary'>Cancel</Button>
            <Button>Continue</Button>
          </CardFooter>
        </Card>
      </div>
    )),
}

export default meta

export const Default = {}
