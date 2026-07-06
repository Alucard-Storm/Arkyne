import { useBuilderStore } from '../state/store'
import CanvasNode from '../canvas/CanvasNode'

export default function CanvasArea() {
  const tree = useBuilderStore((s) => s.tree)
  return (
    <main className="flex-1 min-w-0 overflow-auto bg-neutral-950">
      <CanvasNode node={tree} />
    </main>
  )
}
