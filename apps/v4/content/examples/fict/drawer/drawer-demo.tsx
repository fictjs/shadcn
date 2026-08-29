import { Button } from '@/components/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'

const activity = [400, 300, 200, 300, 200, 278, 189, 239, 300, 200, 278, 189, 349]

export default function DrawerDemoExample() {
  let goal = $state(350)
  const adjust = (amount: number) => { goal = Math.max(200, Math.min(400, goal + amount)) }

  return (
    <Drawer>
      <DrawerTrigger asChild><Button variant="outline">Open Drawer</Button></DrawerTrigger>
      <DrawerContent>
        <div class="mx-auto w-full max-w-sm">
          <DrawerHeader><DrawerTitle>Move Goal</DrawerTitle><DrawerDescription>Set your daily activity goal.</DrawerDescription></DrawerHeader>
          <div class="p-4 pb-0">
            <div class="flex items-center justify-center gap-2">
              <Button variant="outline" size="icon" onClick={() => adjust(-10)} disabled={goal <= 200} aria-label="Decrease">−</Button>
              <div class="flex-1 text-center"><div class="text-7xl font-bold">{goal}</div><div class="text-xs uppercase text-muted-foreground">Calories/day</div></div>
              <Button variant="outline" size="icon" onClick={() => adjust(10)} disabled={goal >= 400} aria-label="Increase">+</Button>
            </div>
            <div class="mt-3 flex h-[120px] items-end gap-1" aria-label="Recent activity">
              {activity.map(value => <span class="flex-1 bg-primary" style={{ height: `${value / 4}%` }} />)}
            </div>
          </div>
          <DrawerFooter><Button>Submit</Button><DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose></DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
