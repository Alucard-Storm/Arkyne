import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import Sidebar from './Sidebar'
import CanvasArea from './CanvasArea'
import PropertiesPanel from './PropertiesPanel'
import CodePanel from './CodePanel'
import ExportButton from '../export/ExportButton'
import ProjectFileControls from './ProjectFileControls'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'
import { useBuilderStore } from '../state/store'
import { getComponentConfig } from '../components/library'

interface DragData {
  source?: 'palette' | 'canvas'
  type?: string
  id?: string
}

export default function AppShell() {
  const addNode = useBuilderStore((s) => s.addNode)
  const moveNode = useBuilderStore((s) => s.moveNode)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  useKeyboardShortcuts()

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    const parentId = String(over.id)
    const data = active.data.current as DragData | undefined
    if (!data?.source) return

    if (data.source === 'palette' && data.type) {
      const config = getComponentConfig(data.type)
      if (!config) return
      addNode(parentId, {
        type: config.type,
        props: { ...config.defaultProps },
        style: { ...config.defaultStyle },
        children: [],
      })
    } else if (data.source === 'canvas' && data.id && data.id !== parentId) {
      moveNode(data.id, parentId)
    }
  }

  return (
    <div className="flex h-full w-full flex-col">
      <header className="flex h-12 shrink-0 items-center border-b border-neutral-800 bg-neutral-900 px-4 text-neutral-100">
        <span className="font-semibold">Arkyne</span>
        <span className="ml-2 text-xs text-neutral-500">Visual UI Builder</span>
        <div className="ml-auto flex items-center gap-2">
          <ProjectFileControls />
          <ExportButton />
        </div>
      </header>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <CanvasArea />
            <CodePanel />
          </div>
          <PropertiesPanel />
        </div>
      </DndContext>
    </div>
  )
}
