import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function CardImageExample() {
  return (
    <Card><CardHeader><CardTitle>Image</CardTitle><CardDescription>Built with Fict Card primitives.</CardDescription></CardHeader><CardContent>Card content</CardContent><CardFooter><button type="button">Continue</button></CardFooter></Card>
  )
}
