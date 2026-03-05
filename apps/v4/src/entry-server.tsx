import { renderToString } from "@fictjs/ssr"

import { App } from "./App"
import { resolveRoute } from "./server-data"
import "./styles.css"

export interface RenderResult {
  html: string
  status: number
  title: string
}

export function render(url: string): RenderResult {
  const route = resolveRoute(url)
  const html = renderToString(() => <App route={route} />, {
    includeContainer: true,
    includeSnapshot: true,
    containerId: "app",
  })

  return {
    html,
    status: route.status,
    title: route.pageTitle,
  }
}
