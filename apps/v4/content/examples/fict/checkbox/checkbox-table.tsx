import { Checkbox } from '@/components/ui/checkbox'

const people = [['Sarah Chen', 'sarah.chen@example.com', 'Admin'], ['Marcus Rodriguez', 'marcus.rodriguez@example.com', 'User'], ['Priya Patel', 'priya.patel@example.com', 'User'], ['David Kim', 'david.kim@example.com', 'Editor']] as const

export default function CheckboxTableExample() {
  let selected = $state(new Set([0]))
  const toggle = (index: number) => { const next = new Set(selected); next.has(index) ? next.delete(index) : next.add(index); selected = next }
  const toggleAll = () => { selected = selected.size === people.length ? new Set() : new Set(people.map((_, index) => index)) }

  return <table><thead><tr><th><Checkbox checked={() => selected.size === people.length} onCheckedChange={toggleAll} aria-label="Select all rows" /></th><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>{people.map((person, index) => <tr data-state={selected.has(index) ? 'selected' : undefined}><td><Checkbox checked={() => selected.has(index)} onCheckedChange={() => toggle(index)} aria-label={`Select ${person[0]}`} /></td><td>{person[0]}</td><td>{person[1]}</td><td>{person[2]}</td></tr>)}</tbody></table>
}
