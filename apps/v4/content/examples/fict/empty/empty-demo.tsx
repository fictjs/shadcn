import { Button } from '@/components/ui/button'
import { Empty, EmptyAction, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

function FolderIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h7l2 2h9v11H3z" /></svg> }
export default function EmptyDemoExample() { return <Empty><EmptyHeader><EmptyMedia><FolderIcon /></EmptyMedia><EmptyTitle>No Projects Yet</EmptyTitle><EmptyDescription>You haven't created any projects yet. Get started by creating your first project.</EmptyDescription></EmptyHeader><EmptyAction><Button>Create Project</Button><Button variant="outline">Import Project</Button></EmptyAction><a href="#learn">Learn More ↗</a></Empty> }
