import path from 'node:path'
import { defineConfig, normalizePath } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const havokWasmPath = normalizePath(
  path.resolve(
    import.meta.dirname,
    '../node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm'
  )
)

export default defineConfig({
  base: './',
  cacheDir: '../node_modules/.vite/babylon',
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: havokWasmPath,
          dest: '.'
        }
      ]
    })
  ],
  worker: {
    format: 'es'
  }
})
