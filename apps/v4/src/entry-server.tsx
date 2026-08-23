import { renderToString } from "@fictjs/ssr"

import { App } from "./App"
import { localizeRtlMarkup } from "./rtl-localization"
import { resolveRoute } from "./server-data"
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
    html,
    status: route.status,
    title: route.pageTitle,
  }
}
