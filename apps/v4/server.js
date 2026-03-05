import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import express from "express"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === "production"
const port = Number(process.env.PORT || 3000)

if (isProduction) {
  const manifestPath = path.resolve(__dirname, "dist/client/fict.manifest.json")
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"))
      globalThis.__FICT_MANIFEST__ = manifest
    } catch {
      void 0
    }
  }
}

globalThis.__FICT_SSR_BASE__ = __dirname

async function createServer() {
  const app = express()

  let vite
  let template
  let render

  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, "dist/client"), { index: false, redirect: false }))
    template = fs.readFileSync(path.resolve(__dirname, "dist/client/index.html"), "utf8")
    const serverEntry = await import("./dist/server/entry-server.js")
    render = serverEntry.render
  } else {
    const { createServer: createViteServer } = await import("vite")
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    })
    app.use(vite.middlewares)
  }

  app.use(async (req, res) => {
    const url = req.originalUrl

    try {
      let html

      if (isProduction) {
        html = template
      } else {
        const rawTemplate = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf8")
        html = await vite.transformIndexHtml(url, rawTemplate)
        const serverEntry = await vite.ssrLoadModule("/src/entry-server.tsx")
        render = serverEntry.render
      }

      const result = render(url)

      html = html
        .replace("__APP_HEAD__", `<title>${escapeHtml(result.title)}</title>`)
        .replace("__APP_HTML__", () => result.html)

      res.status(result.status).set({ "Content-Type": "text/html" }).end(html)
    } catch (error) {
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(error)
      }
      const message = error instanceof Error ? error.message : "Unknown SSR error"
      console.error(error)
      res.status(500).set({ "Content-Type": "text/plain" }).end(message)
    }
  })

  app.listen(port, () => {
    console.log(`[v4] SSR server listening on http://localhost:${port}`)
    console.log(`[v4] mode=${isProduction ? "production" : "development"}`)
  })
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

createServer()
