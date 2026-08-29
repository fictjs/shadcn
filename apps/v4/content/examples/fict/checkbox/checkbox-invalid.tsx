import { Checkbox } from '@/components/ui/checkbox'

export default function CheckboxInvalidExample() {
  return <label class="flex items-center gap-2 text-destructive"><Checkbox id="terms-invalid" aria-invalid="true" />Accept terms and conditions</label>
}
