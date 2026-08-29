import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function ProfileForm() {
  return <form class="grid gap-6"><Label for="email">Email</Label><Input type="email" id="email" value="shadcn@example.com" /><Label for="username">Username</Label><Input id="username" value="@shadcn" /><Button type="submit">Save changes</Button></form>
}

export default function DrawerDialogExample() {
  return (
    <>
      <div class="hidden md:block">
        <Dialog><DialogTrigger asChild><Button variant="outline">Edit Profile</Button></DialogTrigger><DialogContent class="sm:max-w-[425px]"><DialogHeader><DialogTitle>Edit profile</DialogTitle><DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription></DialogHeader><ProfileForm /></DialogContent></Dialog>
      </div>
      <div class="md:hidden">
        <Drawer><DrawerTrigger asChild><Button variant="outline">Edit Profile</Button></DrawerTrigger><DrawerContent><DrawerHeader><DrawerTitle>Edit profile</DrawerTitle><DrawerDescription>Make changes to your profile here. Click save when you're done.</DrawerDescription></DrawerHeader><div class="px-4"><ProfileForm /></div><DrawerFooter><DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose></DrawerFooter></DrawerContent></Drawer>
      </div>
    </>
  )
}
