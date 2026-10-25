import * as esbuild from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const PKG = 'dsh-doc-review'
/** Modules provided at runtime by the dsh web shell. */
const external = ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/*', '@deepseek-ai/*']

await esbuild.build({
  entryPoints: [join(here, 'src', 'index.ts')],
  outdir: join(here, 'lib'),
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  external,
})

const banner = [
  'window.__ModuleLoader__.load({',
  '\tid: ' + JSON.stringify(PKG) + ',',
  '\tfactory: (require) => {',
  '\t\tvar module = { exports: {} };',
  '\t\tvar exports = module.exports;',
].join('\n')
const footer = ['\t\treturn module.exports;', '\t}', '});'].join('\n')

await esbuild.build({
  entryPoints: [join(here, 'src', 'client', 'index.ts')],
  outfile: join(here, 'lib', 'client.js'),
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'chrome120',
  jsx: 'automatic',
  external,
  banner: { js: banner },
  footer: { js: footer },
})

console.log('built lib/index.js, lib/client.js')
