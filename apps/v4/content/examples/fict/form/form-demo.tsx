import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

export default function FormDemoExample() {
  return (
    <Form>
      <FormField name="username">
        <FormLabel>Username</FormLabel>
        <FormControl><input name="username" placeholder="fict-user" /></FormControl>
        <FormDescription>This is your public display name.</FormDescription>
        <FormMessage />
      </FormField>
    </Form>
  )
}
