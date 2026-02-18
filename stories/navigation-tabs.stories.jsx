/** @jsxImportSource fict */

import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { renderFict } from './render-fict'

const meta = {
  title: 'Fict Shadcn/Navigation Tabs',
  tags: ['fict', 'shadcn'],
  render: () =>
    renderFict(() => (
      <div class='w-[560px] rounded-xl border bg-card p-6'>
        <Tabs>
          <TabsList>
            <TabsTrigger active>Overview</TabsTrigger>
            <TabsTrigger>Integrations</TabsTrigger>
            <TabsTrigger>Activity</TabsTrigger>
          </TabsList>

          <TabsContent>
            <h4 class='text-sm font-semibold'>Team overview</h4>
            <p class='mt-1 text-sm text-muted-foreground'>
              12 active members, 4 environments, and 98.7% successful deployments this month.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    )),
}

export default meta

export const Default = {}
