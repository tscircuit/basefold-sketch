import { fileURLToPath, URL } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const rootPath = fileURLToPath(new URL("..", import.meta.url))
const basePath = process.env.VITE_BASE_PATH?.trim()

const normalizeBasePath = (input: string): string => {
  if (input === "" || input === ".") {
    return "./"
  }

  if (input === "/") {
    return "/"
  }

  const withLeadingSlash = input.startsWith("/") ? input : `/${input}`
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`
}

export default defineConfig({
  base: basePath ? normalizeBasePath(basePath) : "./",
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
