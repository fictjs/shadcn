import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

export default function NativeSelectDisabledExample() {
  return (
    <NativeSelect disabled><NativeSelectOption value="">Select Disabled</NativeSelectOption><NativeSelectOption value="fict">Fict</NativeSelectOption><NativeSelectOption value="typescript">TypeScript</NativeSelectOption></NativeSelect>
  )
}
