/** @jsxImportSource fict */

import { Button } from './ui/button'
import { renderFict } from './render-fict'

const meta = {
  title: 'Fict Shadcn/Button',
  tags: ['fict', 'shadcn'],
  args: {
    label: 'Deploy',
    variant: 'default',
    size: 'default',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary', 'outline', 'destructive', 'ghost', 'link'],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
    },
    label: { control: 'text' },
  },
  render: args =>
    renderFict(() => (
      <div class='flex items-center gap-3 p-8'>
        <Button variant={args.variant} size={args.size}>
          {args.label}
        </Button>
      </div>
    )),
}

export default meta

export const Playground = {}

export const Variants = {
  render: args =>
    renderFict(() => (
      <div class='flex flex-wrap items-center gap-3 p-8'>
        <Button variant='default' size={args.size}>
          Default
        </Button>
        <Button variant='secondary' size={args.size}>
          Secondary
        </Button>
        <Button variant='outline' size={args.size}>
          Outline
        </Button>
        <Button variant='ghost' size={args.size}>
          Ghost
        </Button>
        <Button variant='destructive' size={args.size}>
          Destructive
        </Button>
        <Button variant='link' size={args.size}>
          Link
        </Button>
      </div>
    )),
}

export const Icon = {
  args: {
    label: '→',
    size: 'icon',
  },
}
