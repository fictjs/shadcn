import { createHighlighter } from "shiki"

import type { HighlightedCode, HighlightedCodeToken } from "./types"

const supportedLanguages = [
  "bash",
  "css",
  "html",
  "javascript",
  "json",
  "jsx",
  "markdown",
  "mdx",
  "text",
  "tsx",
  "typescript",
  "yaml",
] as const

const languageAliases: Record<string, (typeof supportedLanguages)[number]> = {
  js: "javascript",
  md: "markdown",
  plaintext: "text",
  shell: "bash",
  sh: "bash",
  ts: "typescript",
  txt: "text",
  yml: "yaml",
}

const highlighter = await createHighlighter({
  themes: ["github-light-default", "github-dark"],
  langs: [...supportedLanguages],
})

const highlightCache = new Map<string, HighlightedCode>()

export function highlightCode(code: string, requestedLanguage = "text"): HighlightedCode {
  const language = normalizeCodeLanguage(requestedLanguage)
  const cacheKey = `${language}\0${code}`
  const cached = highlightCache.get(cacheKey)
  if (cached) return cached

  const result = highlighter.codeToTokens(code, {
    lang: language,
    themes: {
      light: "github-light-default",
      dark: "github-dark",
    },
  })
  const highlighted = {
    language,
    lines: result.tokens.map(line => ({
      tokens: line.map(token => ({
        content: token.content,
        style: serializeTokenStyle(token.htmlStyle),
      })),
    })),
  }

  highlightCache.set(cacheKey, highlighted)
  return highlighted
}

export function normalizeCodeLanguage(language: string): (typeof supportedLanguages)[number] {
  const normalized = language.trim().toLowerCase()
  const aliased = languageAliases[normalized] ?? normalized

  return supportedLanguages.includes(aliased as (typeof supportedLanguages)[number])
    ? aliased as (typeof supportedLanguages)[number]
    : "text"
}

function serializeTokenStyle(style: HighlightedCodeToken["style"] | Record<string, string> | undefined): string {
  if (!style) return ""
  if (typeof style === "string") return style

  return Object.entries(style)
    .map(([property, value]) => `${property}:${value}`)
    .join(";")
}
