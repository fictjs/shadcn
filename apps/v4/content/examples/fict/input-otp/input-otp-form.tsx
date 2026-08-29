import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'

export default function InputOTPFormExample() {
  let code = $state('')

  return (
    <Card class="w-[336px]"><CardHeader><CardTitle>Verify your login</CardTitle><CardDescription>Enter the verification code we sent to <strong>m@example.com</strong>.</CardDescription></CardHeader><CardContent><Field><div class="flex items-center justify-between"><FieldLabel>Verification code</FieldLabel><Button type="button" variant="outline" size="xs">Resend Code</Button></div><InputOTP required value={() => code} onValueChange={next => { code = next }} maxLength={6}><InputOTPGroup>{[0, 1, 2].map(index => <InputOTPSlot index={index} class="h-12 w-11" />)}</InputOTPGroup><InputOTPSeparator /><InputOTPGroup>{[3, 4, 5].map(index => <InputOTPSlot index={index} class="h-12 w-11" />)}</InputOTPGroup></InputOTP><FieldDescription><a href="#">I no longer have access to this email address.</a></FieldDescription></Field></CardContent><CardFooter class="grid gap-2"><Button type="submit">Verify</Button><p>Having trouble signing in? <a href="#">Contact support</a></p></CardFooter></Card>
  )
}
