import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Kbd } from '@/components/ui/kbd'

export default function EmptyInputGroupExample() { return <Empty><EmptyHeader><EmptyTitle>404 - Not Found</EmptyTitle><EmptyDescription>The page you're looking for doesn't exist. Try searching for what you need below.</EmptyDescription></EmptyHeader><EmptyContent><InputGroup><InputGroupInput type="search" aria-label="Search pages" placeholder="Try searching for pages..." /><InputGroupAddon><Kbd>/</Kbd></InputGroupAddon></InputGroup><p>Need help? <a href="#support">Contact support</a></p></EmptyContent></Empty> }
