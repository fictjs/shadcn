/** @jsxImportSource fict */

import { Button } from './ui/button'
import { renderFict } from './render-fict'

const rows = [
  { id: 'usr_001', name: 'Jane Doe', role: 'Admin', status: 'Active' },
  { id: 'usr_002', name: 'Sam Park', role: 'Editor', status: 'Pending' },
  { id: 'usr_003', name: 'Iris Chen', role: 'Viewer', status: 'Active' },
]

const meta = {
  title: 'Fict Shadcn/Table',
  tags: ['fict', 'shadcn'],
  render: () =>
    renderFict(() => (
      <div class='w-[760px] rounded-lg border bg-card p-4'>
        <div class='mb-4 flex items-center justify-between'>
          <h3 class='text-lg font-semibold'>Users</h3>
          <Button size='sm'>Add user</Button>
        </div>
        <table class='w-full text-sm'>
          <thead>
            <tr class='border-b'>
              <th class='h-10 px-2 text-left font-medium text-muted-foreground'>Name</th>
              <th class='h-10 px-2 text-left font-medium text-muted-foreground'>Role</th>
              <th class='h-10 px-2 text-left font-medium text-muted-foreground'>Status</th>
              <th class='h-10 px-2 text-right font-medium text-muted-foreground'>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr class='border-b'>
                <td class='p-2 font-medium'>{row.name}</td>
                <td class='p-2'>{row.role}</td>
                <td class='p-2'>
                  <span class='inline-flex rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground'>
                    {row.status}
                  </span>
                </td>
                <td class='p-2 text-right'>
                  <Button variant='ghost' size='sm'>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )),
}

export default meta

export const Default = {}
