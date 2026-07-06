import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { createRootNode } from '../state/types'
import { insertNode } from '../state/tree'
import { exportReactProject, exportStaticSite } from './exportProject'

function buildSampleTree() {
  const root = createRootNode()
  const button = { id: 'button-1', type: 'button', props: { text: 'Hi' }, style: { color: 'red' }, children: [] }
  return insertNode(root, 'root', button)
}

describe('project export', () => {
  it('exports a static site zip containing index.html with the button text', async () => {
    const tree = buildSampleTree()
    const blob = await zipFromExport(() => exportStaticSite(tree))
    const zip = await JSZip.loadAsync(blob)
    const html = await zip.file('index.html')?.async('string')
    expect(html).toContain('Hi')
    expect(html).toContain('<!doctype html>')
  })

  it('exports a React project zip with package.json and the generated component', async () => {
    const tree = buildSampleTree()
    const blob = await zipFromExport(() => exportReactProject(tree))
    const zip = await JSZip.loadAsync(blob)
    expect(zip.file('package.json')).not.toBeNull()
    const component = await zip.file('src/GeneratedComponent.jsx')?.async('string')
    expect(component).toContain('Hi')
    expect(component).toContain('export default function GeneratedComponent')
  })
})

async function zipFromExport(run: () => Promise<void>): Promise<Blob> {
  let captured: Blob | null = null
  const originalCreateObjectURL = URL.createObjectURL
  URL.createObjectURL = ((blob: Blob) => {
    captured = blob
    return 'blob:mock'
  }) as typeof URL.createObjectURL
  try {
    await run()
  } finally {
    URL.createObjectURL = originalCreateObjectURL
  }
  if (!captured) throw new Error('No blob was created')
  return captured
}
