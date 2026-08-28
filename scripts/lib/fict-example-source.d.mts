export interface FictExampleSourceOptions {
  exampleRoot: string
  componentName: string
  previewName: string
}

export function loadFictExampleSource(options: FictExampleSourceOptions): string | null
export function validateFictExampleSource(content: string, sourcePath?: string): void
