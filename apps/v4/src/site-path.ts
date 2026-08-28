const configuredBasePath = import.meta.env.BASE_URL || "/"

export const siteBasePath =
  configuredBasePath === "/" ? "" : `/${configuredBasePath.replace(/^\/+|\/+$/g, "")}`

export function withSiteBasePath(value: string): string {
  if (!siteBasePath || !value.startsWith("/") || value.startsWith("//")) {
    return value
  }

  if (value === siteBasePath || value.startsWith(`${siteBasePath}/`)) {
    return value
  }

  return `${siteBasePath}${value}`
}

export function stripSiteBasePath(pathname: string): string {
  if (!siteBasePath) {
    return pathname
  }

  if (pathname === siteBasePath) {
    return "/"
  }

  if (pathname.startsWith(`${siteBasePath}/`)) {
    return pathname.slice(siteBasePath.length)
  }

  return pathname
}

export function prefixSitePathsInMarkup(markup: string): string {
  if (!siteBasePath) {
    return markup
  }

  return markup.replace(
    /(\s(?:href|src|action)=["'])\/(?!\/)/g,
    (_match, attribute: string) => `${attribute}${siteBasePath}/`,
  )
}
