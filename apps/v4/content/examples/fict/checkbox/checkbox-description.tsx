import { Checkbox } from '@/components/ui/checkbox'

export default function CheckboxDescriptionExample() {
  return <label class="flex items-start gap-2"><Checkbox id="terms-description" defaultChecked /><span><strong>Accept terms and conditions</strong><small class="block text-muted-foreground">By clicking this checkbox, you agree to the terms and conditions.</small></span></label>
}
