import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function InputFormExample() {
  return (
    <form class="grid w-full max-w-sm gap-4" onSubmit={event => event.preventDefault()}>
      <label class="grid gap-2">
        Name
        <Input name="name" placeholder="Evil Rabbit" required />
      </label>
      <label class="grid gap-2">
        Email
        <Input name="email" type="email" placeholder="john@example.com" />
        <small>We'll never share your email with anyone.</small>
      </label>
      <div class="grid grid-cols-2 gap-4">
        <label class="grid gap-2">
          Phone
          <Input name="phone" type="tel" placeholder="+1 (555) 123-4567" />
        </label>
        <label class="grid gap-2">
          Country
          <Select defaultValue="us">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="ca">Canada</SelectItem>
            </SelectContent>
          </Select>
        </label>
      </div>
      <label class="grid gap-2">
        Address
        <Input name="address" placeholder="123 Main St" />
      </label>
      <div class="flex gap-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  )
}
