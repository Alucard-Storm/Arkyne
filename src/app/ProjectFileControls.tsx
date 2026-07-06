import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import { saveAs } from 'file-saver'
import { useBuilderStore } from '../state/store'
import type { ElementNode } from '../state/types'

function isElementNode(value: unknown): value is ElementNode {
  if (typeof value !== 'object' || value === null) return false
  const node = value as Record<string, unknown>
  return (
    typeof node.id === 'string' &&
    typeof node.type === 'string' &&
    typeof node.props === 'object' &&
    typeof node.style === 'object' &&
    Array.isArray(node.children)
  )
}

export default function ProjectFileControls() {
  const tree = useBuilderStore((s) => s.tree)
  const loadTree = useBuilderStore((s) => s.loadTree)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    const blob = new Blob([JSON.stringify(tree, null, 2)], { type: 'application/json' })
    saveAs(blob, 'arkyne-project.json')
  }

  const handleLoadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const text = await file.text()
    try {
      const parsed = JSON.parse(text)
      if (!isElementNode(parsed)) {
        window.alert('That file does not look like a valid Arkyne project.')
        return
      }
      loadTree(parsed)
    } catch {
      window.alert('Could not parse that file as JSON.')
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleSave}
        className="rounded px-2 py-1 text-sm text-neutral-300 hover:bg-neutral-800"
      >
        Save
      </button>
      <button
        onClick={handleLoadClick}
        className="rounded px-2 py-1 text-sm text-neutral-300 hover:bg-neutral-800"
      >
        Load
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => void handleFileChange(e)}
      />
    </div>
  )
}
