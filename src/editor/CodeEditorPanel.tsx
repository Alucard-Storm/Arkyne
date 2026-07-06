import { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import { useBuilderStore } from '../state/store'
import { generateHtmlCode, generateReactCode } from '../export/codegen'
import { parseReactCodeToTree } from './parseCodeToTree'

type Mode = 'react' | 'html'

const SYNC_DEBOUNCE_MS = 500

export default function CodeEditorPanel() {
  const tree = useBuilderStore((s) => s.tree)
  const loadTree = useBuilderStore((s) => s.loadTree)

  const [mode, setMode] = useState<Mode>('react')
  const [code, setCode] = useState(() => generateReactCode(tree))
  const [error, setError] = useState<string | null>(null)

  const dirtyRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (dirtyRef.current) return
    setCode(mode === 'react' ? generateReactCode(tree) : generateHtmlCode(tree))
    setError(null)
  }, [tree, mode])

  const handleChange = (value: string | undefined) => {
    const next = value ?? ''
    setCode(next)
    if (mode !== 'react') return

    dirtyRef.current = true
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const result = parseReactCodeToTree(next)
      if ('error' in result) {
        setError(result.error)
      } else {
        setError(null)
        loadTree(result.tree)
      }
      dirtyRef.current = false
    }, SYNC_DEBOUNCE_MS)
  }

  return (
    <section className="flex h-56 shrink-0 flex-col border-t border-neutral-800 bg-neutral-900 text-neutral-200">
      <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Code</span>
        <div className="flex gap-1 text-xs">
          <button
            className={`rounded px-2 py-1 ${mode === 'react' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:bg-neutral-800'}`}
            onClick={() => setMode('react')}
          >
            React
          </button>
          <button
            className={`rounded px-2 py-1 ${mode === 'html' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:bg-neutral-800'}`}
            onClick={() => setMode('html')}
          >
            HTML
          </button>
        </div>
      </div>
      {error && (
        <div className="border-b border-red-900 bg-red-950/60 px-3 py-1 text-xs text-red-300">{error}</div>
      )}
      <div className="min-h-0 flex-1">
        <Editor
          height="100%"
          language={mode === 'react' ? 'typescript' : 'html'}
          theme="vs-dark"
          value={code}
          onChange={handleChange}
          options={{
            readOnly: mode !== 'react',
            minimap: { enabled: false },
            fontSize: 12,
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </section>
  )
}
