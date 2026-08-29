import { Checkbox } from '@/components/ui/checkbox'

export default function CheckboxDemoExample() {
  return (
    <div class="grid gap-4">
      <label class="flex items-center gap-2"><Checkbox id="terms" />Accept terms and conditions</label>
      <label class="flex items-start gap-2"><Checkbox id="terms-description" defaultChecked /><span><strong>Accept terms and conditions</strong><small class="block text-muted-foreground">By clicking this checkbox, you agree to the terms.</small></span></label>
      <label class="flex items-center gap-2"><Checkbox id="disabled" disabled />Enable notifications</label>
      <label class="flex items-start gap-2"><Checkbox id="notifications" /><span><strong>Enable notifications</strong><small class="block text-muted-foreground">You can enable or disable notifications at any time.</small></span></label>
    </div>
  )
}
