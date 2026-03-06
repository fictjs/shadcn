import { defineConfig } from "vite"
import fict from "@fictjs/vite-plugin"

export default defineConfig({
  plugins: [
    fict({
      resumable: true,
      autoExtractHandlers: true,
      autoExtractThreshold: 0,
    }),
  ],
  build: {
    minify: false,
  },
  server: {
    port: 4000,
  },
})
