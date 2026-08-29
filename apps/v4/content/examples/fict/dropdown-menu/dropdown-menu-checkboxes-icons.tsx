import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

function NotificationIcon(props: { kind: 'mail' | 'message' | 'bell' }) {
  return <span aria-hidden="true">{props.kind === 'mail' ? '✉' : props.kind === 'message' ? '▣' : '♢'}</span>
}

export default function DropdownMenuCheckboxesIconsExample() {
  let notifications = $state({ email: true, sms: false, push: true })
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="outline">Notifications</Button></DropdownMenuTrigger>
      <DropdownMenuContent class="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Notification Preferences</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={() => notifications.email} onCheckedChange={email => { notifications = { ...notifications, email } }}><NotificationIcon kind="mail" />Email notifications</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={() => notifications.sms} onCheckedChange={sms => { notifications = { ...notifications, sms } }}><NotificationIcon kind="message" />SMS notifications</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={() => notifications.push} onCheckedChange={push => { notifications = { ...notifications, push } }}><NotificationIcon kind="bell" />Push notifications</DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
