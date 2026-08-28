import { defineConfig } from "vite"
import fict from "@fictjs/vite-plugin"

export default defineConfig({
  base: process.env.SITE_BASE_PATH || "/",
  plugins: [
    fict({
      resumable: true,
      autoExtractHandlers: false,
    }),
  ],
  build: {
    minify: false,
  },
  server: {
    port: 4000,
  },
})
