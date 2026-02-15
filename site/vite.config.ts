import { fileURLToPath, URL } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const rootPath = fileURLToPath(new URL("..", import.meta.url))

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [rootPath],
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
