import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = dirname(fileURLToPath(import.meta.url))

function prerenderSeoPlugin() {
  return {
    name: 'fortis-prerender-seo',
    apply: 'build',
    closeBundle() {
      execFileSync(process.execPath, [resolve(__dirname, 'scripts/prerender-seo.mjs')], {
        cwd: __dirname,
        env: process.env,
        stdio: 'inherit',
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), prerenderSeoPlugin()],
})
