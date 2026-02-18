export function ensureTrailingNewline(content: string): string {
  return content.endsWith('\n') ? content : `${content}\n`
}
