import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

export default function NativeSelectInvalidExample() {
  return (
    <NativeSelect><NativeSelectOption value="">Select Invalid</NativeSelectOption><NativeSelectOption value="fict">Fict</NativeSelectOption><NativeSelectOption value="typescript">TypeScript</NativeSelectOption></NativeSelect>
  )
}
