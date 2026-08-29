import { Button } from '@/components/ui/button'
import { Empty, EmptyAction, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

function CloudIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H6a4 4 0 0 1-.5-8A6.5 6.5 0 0 1 18 9.5a4.8 4.8 0 0 1-.5 9.5Z" /></svg> }
export default function EmptyOutlineExample() { return <Empty><EmptyHeader><EmptyMedia><CloudIcon /></EmptyMedia><EmptyTitle>Cloud Storage Empty</EmptyTitle><EmptyDescription>Upload files to your cloud storage to access them anywhere.</EmptyDescription></EmptyHeader><EmptyAction><Button size="sm" variant="outline">Upload Files</Button></EmptyAction></Empty> }
