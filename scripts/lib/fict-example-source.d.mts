export interface FictExampleSourceOptions {
  exampleRoot: string
  componentName: string
  previewName: string
}

export function loadFictExampleSource(options: FictExampleSourceOptions): string | null
export function extractFictRegistryDependencies(content: string): string[]
export function extractFictRegistryExports(content: string): Set<string>
export function validateFictRegistryImports(
  content: string,
  registryExports: Map<string, Set<string>>,
  sourcePath?: string,
): void
export function validateFictExampleSource(content: string, sourcePath?: string): void
