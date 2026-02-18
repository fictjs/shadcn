/** @jsxImportSource fict */

import { Progress } from './ui/progress'
import { renderFict } from './render-fict'

const meta = {
  title: 'Fict Shadcn/Feedback Progress',
  tags: ['fict', 'shadcn'],
  args: {
    value: 66,
  },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
  render: args =>
    renderFict(() => (
      <div class='w-[420px] rounded-xl border bg-card p-6'>
        <div class='mb-3 flex items-center justify-between'>
          <p class='text-sm font-medium'>Deployment pipeline</p>
          <p class='text-xs text-muted-foreground'>{args.value}%</p>
        </div>
        <Progress value={args.value} />
      </div>
    )),
}

export default meta

export const Default = {}

export const Complete = {
  args: {
    value: 100,
  },
}
