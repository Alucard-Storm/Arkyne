import { useState } from 'react'
import { useBuilderStore } from '../state/store'
import { findNode } from '../state/tree'

const PROP_FIELDS_BY_TYPE: Record<string, { key: string; label: string }[]> = {
  button: [{ key: 'text', label: 'Text' }],
  text: [{ key: 'text', label: 'Text' }],
  image: [
    { key: 'src', label: 'Image URL' },
    { key: 'alt', label: 'Alt text' },
  ],
  input: [{ key: 'placeholder', label: 'Placeholder' }],
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-neutral-400">
      {label}
      <input
        className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

export default function PropertiesPanel() {
  const tree = useBuilderStore((s) => s.tree)
  const selectedIds = useBuilderStore((s) => s.selectedIds)
  const updateNode = useBuilderStore((s) => s.updateNode)
  const setStyle = useBuilderStore((s) => s.setStyle)
  const deleteNode = useBuilderStore((s) => s.deleteNode)
  const deleteSelected = useBuilderStore((s) => s.deleteSelected)

  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  if (selectedIds.length === 0) {
    return (
      <aside className="w-72 shrink-0 overflow-y-auto border-l border-neutral-800 bg-neutral-900 text-neutral-200">
        <div className="p-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Properties
        </div>
        <div className="p-3 text-sm text-neutral-500">Select an element to edit its properties</div>
      </aside>
    )
  }

  if (selectedIds.length > 1) {
    return (
      <aside className="w-72 shrink-0 overflow-y-auto border-l border-neutral-800 bg-neutral-900 text-neutral-200">
        <div className="p-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Properties
        </div>
        <div className="p-3 text-sm text-neutral-500">{selectedIds.length} elements selected</div>
        <div className="border-t border-neutral-800 p-3">
          <button
            onClick={deleteSelected}
            className="w-full rounded bg-red-950 px-3 py-1.5 text-sm text-red-300 hover:bg-red-900"
          >
            Delete {selectedIds.length} elements
          </button>
        </div>
      </aside>
    )
  }

  const node = findNode(tree, selectedIds[0])

  if (!node || node.type === 'root') {
    return (
      <aside className="w-72 shrink-0 overflow-y-auto border-l border-neutral-800 bg-neutral-900 text-neutral-200">
        <div className="p-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Properties
        </div>
        <div className="p-3 text-sm text-neutral-500">Select an element to edit its properties</div>
      </aside>
    )
  }

  const propFields = PROP_FIELDS_BY_TYPE[node.type] ?? []

  const styleEntries = Object.entries(node.style)

  const setStyleEntry = (key: string, rawValue: string) => {
    const value = rawValue !== '' && !Number.isNaN(Number(rawValue)) ? Number(rawValue) : rawValue
    setStyle(node.id, { ...node.style, [key]: value })
  }

  const removeStyleEntry = (key: string) => {
    const next = { ...node.style }
    delete next[key]
    setStyle(node.id, next)
  }

  const addStyleEntry = () => {
    if (!newKey.trim()) return
    setStyleEntry(newKey.trim(), newValue)
    setNewKey('')
    setNewValue('')
  }

  return (
    <aside className="w-72 shrink-0 overflow-y-auto border-l border-neutral-800 bg-neutral-900 text-neutral-200">
      <div className="flex items-center justify-between p-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Properties
        </span>
        <span className="text-xs text-neutral-500">{node.type}</span>
      </div>

      <div className="flex flex-col gap-3 border-t border-neutral-800 p-3">
        {propFields.map(({ key, label }) => (
          <Field
            key={key}
            label={label}
            value={String(node.props[key] ?? '')}
            onChange={(value) => updateNode(node.id, { props: { [key]: value } })}
          />
        ))}
        {propFields.length === 0 && (
          <div className="text-xs text-neutral-500">This element has no editable content props.</div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-neutral-800 p-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Style</span>
        {styleEntries.map(([key, value]) => (
          <div key={key} className="flex items-center gap-1">
            <span className="w-24 shrink-0 truncate text-xs text-neutral-400" title={key}>
              {key}
            </span>
            <input
              className="min-w-0 flex-1 rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
              value={String(value)}
              onChange={(e) => setStyleEntry(key, e.target.value)}
            />
            <button
              onClick={() => removeStyleEntry(key)}
              className="shrink-0 rounded px-1.5 py-1 text-xs text-neutral-500 hover:bg-neutral-800 hover:text-red-400"
              aria-label={`Remove ${key}`}
            >
              ✕
            </button>
          </div>
        ))}
        <div className="flex items-center gap-1 pt-1">
          <input
            className="w-24 shrink-0 rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-neutral-100 focus:border-blue-500 focus:outline-none"
            placeholder="property"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <input
            className="min-w-0 flex-1 rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
            placeholder="value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addStyleEntry()}
          />
          <button
            onClick={addStyleEntry}
            className="shrink-0 rounded px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
          >
            Add
          </button>
        </div>
      </div>

      <div className="border-t border-neutral-800 p-3">
        <button
          onClick={() => deleteNode(node.id)}
          className="w-full rounded bg-red-950 px-3 py-1.5 text-sm text-red-300 hover:bg-red-900"
        >
          Delete element
        </button>
      </div>
    </aside>
  )
}
