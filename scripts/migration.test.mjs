import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const root = fileURLToPath(new URL('../', import.meta.url))
const temp = await mkdtemp(join(tmpdir(), 'dsh-markup-migration-'))
after(() => rm(temp, { recursive: true, force: true }))

// Fixtures use the persisted format and keys shipped by dsh-doc-review 0.1.1.
const oldAnnotation = { id: 7, kind: 'comment', quote: 'Original passage', note: 'Keep this note', rowKey: 'row-1', createdAt: 1 }
const oldThread = { id: 3, anchor: null, quote: 'Original', draft: false, askOn: false, messages: [{ id: 4, role: 'user', text: 'Saved discussion' }], input: '', resolved: false, edit: null }
const oldSummary = { id: 'old-summary', sessionId: 's1', title: 'Saved reading', sub: '', lines: [], text: 'Unsaved-to-chat reading summary' }
const values = new Map([
  ['dsh-review:v3:s1', JSON.stringify({ items: [oldAnnotation], overall: 'Overall feedback' })],
  ['dsh-review:doc:v1:m1', JSON.stringify({ sessionId: 's1', messageId: 'm1', title: 'Old title', original: 'Original', markdown: 'Revised text', version: 1, highlights: [], threads: [oldThread], nextId: 5 })],
  ['dsh-review:attach:v1', JSON.stringify([oldSummary])],
  ['dsh-review:agent-default', 'off'],
])
globalThis.window = { localStorage: {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
} }

const entry = join(temp, 'stores.mjs')
await build({
  stdin: { contents: "export { ReviewStore } from './src/client/model.ts'; export { DocStore, agentDefault } from './src/client/doc/store.ts'; export { attachments } from './src/client/doc/attach.ts';", resolveDir: root },
  outfile: entry, bundle: true, format: 'esm', platform: 'node', target: 'node20',
})
const { ReviewStore, DocStore, agentDefault, attachments } = await import(pathToFileURL(entry).href)

test('existing annotations survive rename and subsequent edits', () => {
  const store = new ReviewStore('s1')
  assert.deepEqual(store.getSnapshot(), { items: [oldAnnotation], overall: 'Overall feedback' })
  store.add('agree', 'Another passage', '', null)
  const saved = JSON.parse(values.get('dsh-review:v3:s1'))
  assert.deepEqual(saved.items[0], oldAnnotation)
  assert.equal(saved.items[1].id, 8)
  assert.equal(saved.overall, 'Overall feedback')
})

test('document revisions, comment threads, and Agent preference survive rename', () => {
  const store = new DocStore({ sessionId: 's1', messageId: 'm1', title: 'Current title', markdown: 'Original' })
  assert.equal(store.getSnapshot().markdown, 'Revised text')
  assert.deepEqual(store.getSnapshot().threads, [oldThread])
  assert.equal(agentDefault(), false)
  store.update((state) => ({ ...state, markdown: 'Another revision' }))
  const saved = JSON.parse(values.get('dsh-review:doc:v1:m1'))
  assert.equal(saved.markdown, 'Another revision')
  assert.deepEqual(saved.threads, [oldThread])
})

test('pending reading references remain available alongside new references', () => {
  assert.deepEqual(attachments.get('old-summary'), oldSummary)
  const next = { ...oldSummary, id: 'new-summary', text: 'New reading' }
  attachments.stage(next)
  attachments.settle(next)
  assert.deepEqual(attachments.forSession('s1'), [oldSummary, next])
  assert.deepEqual(JSON.parse(values.get('dsh-review:attach:v1')), [oldSummary, next])
})
