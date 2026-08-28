import { renderToString } from "@fictjs/ssr"

import { App } from "./App"
import { localizeRtlMarkup } from "./rtl-localization"
import { resolveRoute } from "./server-data"
import { prefixSitePathsInMarkup } from "./site-path"
import "./styles.css"

export interface RenderResult {
  html: string
  status: number
  title: string
}

export function render(url: string): RenderResult {
  const route = resolveRoute(url)
  let html = renderToString(() => <App route={route} />, {
    includeContainer: true,
    includeSnapshot: true,
    containerId: "app",
  })
  if (route.exampleSlug === "rtl") {
    html = localizeRtlMarkup(html, "ar")
  }

  return {
    html: prefixSitePathsInMarkup(html),
    status: route.status,
    title: route.pageTitle,
  }
}

export function getStaticRoutes(): string[] {
  const route = resolveRoute("/")
  const routes = [
    "/",
    "/create",
    "/docs",
    "/components",
    ...route.docs.map((doc) => (doc.slug ? `/docs/${doc.slug}` : "/docs")),
    "/examples",
    ...route.examplePages.map((example) => `/examples/${example.slug}`),
    "/charts",
    ...route.chartTypes.map((chartType) => `/charts/${chartType}`),
    "/blocks",
    ...route.blockCategories.map((category) => `/blocks/${category}`),
    "/themes",
    "/colors",
  ]

  return Array.from(new Set(routes))
}
