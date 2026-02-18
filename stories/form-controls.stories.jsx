/** @jsxImportSource fict */

import { Input } from './ui/input'
import { Checkbox } from './ui/checkbox'
import { Switch } from './ui/switch'
import { renderFict } from './render-fict'

const meta = {
  title: 'Fict Shadcn/Form Controls',
  tags: ['fict', 'shadcn'],
  render: () =>
    renderFict(() => (
      <div class='grid w-[420px] gap-5 rounded-xl border bg-card p-6 shadow-sm'>
        <div class='grid gap-2'>
          <label class='text-sm font-medium'>Project name</label>
          <Input placeholder='my-app' />
        </div>

        <div class='flex items-center justify-between'>
          <div>
            <p class='text-sm font-medium'>Public repo</p>
            <p class='text-xs text-muted-foreground'>Allow search engines to index this project.</p>
          </div>
          <Switch checked />
        </div>

        <div class='flex items-center gap-3 rounded-md border bg-background p-3'>
          <Checkbox checked />
          <div>
            <p class='text-sm font-medium'>Enable email alerts</p>
            <p class='text-xs text-muted-foreground'>Receive build and deploy notifications.</p>
          </div>
        </div>
      </div>
    )),
}

export default meta

export const Default = {}
