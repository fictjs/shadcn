export function handleCliError(error: unknown): void {
  const message = error instanceof Error && error.message.length > 0 ? error.message : String(error)
  console.error(`Error: ${message}`)
  process.exitCode = 1
}
