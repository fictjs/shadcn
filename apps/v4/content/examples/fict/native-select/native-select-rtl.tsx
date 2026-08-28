import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

export default function NativeSelectRtlExample() {
  return (
    <NativeSelect dir="rtl"><NativeSelectOption value="">Select Rtl</NativeSelectOption><NativeSelectOption value="fict">Fict</NativeSelectOption><NativeSelectOption value="typescript">TypeScript</NativeSelectOption></NativeSelect>
  )
}
