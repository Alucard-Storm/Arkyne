import { useState } from 'react'
import { useBuilderStore } from '../state/store'
import { exportReactProject, exportStaticSite } from './exportProject'

export default function ExportButton() {
  const tree = useBuilderStore((s) => s.tree)
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500"
      >
        Export Project
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-56 rounded border border-neutral-700 bg-neutral-800 shadow-lg">
          <button
            className="block w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-700"
            onClick={() => {
              void exportStaticSite(tree)
              setOpen(false)
            }}
          >
            Static HTML site (.zip)
          </button>
          <button
            className="block w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-700"
            onClick={() => {
              void exportReactProject(tree)
              setOpen(false)
            }}
          >
            React app scaffold (.zip)
          </button>
        </div>
      )}
    </div>
  )
}
