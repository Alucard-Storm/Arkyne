import { useDraggable } from '@dnd-kit/core'
import { componentLibrary, type ComponentConfig } from '../components/library'

function PaletteItem({ config }: { config: ComponentConfig }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${config.type}`,
    data: { source: 'palette', type: config.type },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex cursor-grab items-center gap-2 rounded p-2 text-sm text-neutral-200 hover:bg-neutral-800 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <span aria-hidden>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  )
}

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 overflow-y-auto border-r border-neutral-800 bg-neutral-900 text-neutral-200">
      <div className="p-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
        Components
      </div>
      <div className="flex flex-col gap-1 p-2">
        {componentLibrary.map((config) => (
          <PaletteItem key={config.type} config={config} />
        ))}
      </div>
    </aside>
  )
}
