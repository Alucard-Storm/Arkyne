import { useCallback, useRef } from 'react'
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useBuilderStore } from '../state/store'
import type { ElementNode } from '../state/types'
import { getComponentConfig } from '../components/library'

const GRID = 8
function snapToGrid(value: number): number {
  return Math.round(value / GRID) * GRID
}

interface CanvasNodeProps {
  node: ElementNode
}

export default function CanvasNode({ node }: CanvasNodeProps) {
  const isRoot = node.type === 'root'
  const config = getComponentConfig(node.type)
  const selectedIds = useBuilderStore((s) => s.selectedIds)
  const select = useBuilderStore((s) => s.select)
  const updateNode = useBuilderStore((s) => s.updateNode)
  const isSelected = selectedIds.includes(node.id)

  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: node.id,
    data: { source: 'canvas', id: node.id },
    disabled: isRoot,
  })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: node.id,
    data: { parentId: node.id },
    disabled: !isRoot && !config?.allowsChildren,
  })

  const setRefs = useCallback(
    (el: HTMLElement | null) => {
      setDragRef(el)
      setDropRef(el)
    },
    [setDragRef, setDropRef],
  )

  const resizeState = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null)

  const onResizeStart = useCallback(
    (e: ReactMouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      const wrapper = (e.currentTarget as HTMLElement).parentElement as HTMLElement
      const rect = wrapper.getBoundingClientRect()
      resizeState.current = { startX: e.clientX, startY: e.clientY, startW: rect.width, startH: rect.height }

      const onMove = (ev: globalThis.MouseEvent) => {
        if (!resizeState.current) return
        const dx = ev.clientX - resizeState.current.startX
        const dy = ev.clientY - resizeState.current.startY
        const width = snapToGrid(Math.max(20, resizeState.current.startW + dx))
        const height = snapToGrid(Math.max(20, resizeState.current.startH + dy))
        updateNode(node.id, { style: { width, height } })
      }
      const onUp = () => {
        resizeState.current = null
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [node.id, updateNode],
  )

  if (isRoot) {
    return (
      <div
        ref={setRefs}
        className={`relative w-full min-h-[480px] p-6 ${isOver ? 'bg-blue-950/20' : ''}`}
        onClick={() => select(null)}
      >
        {node.children.length === 0 && (
          <div className="pointer-events-none text-sm text-neutral-600">
            Drag components here from the sidebar
          </div>
        )}
        {node.children.map((child) => (
          <CanvasNode key={child.id} node={child} />
        ))}
      </div>
    )
  }

  const style: CSSProperties = {
    ...(node.style as CSSProperties),
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : undefined,
    position: transform ? 'relative' : (node.style as CSSProperties).position,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div
      ref={setRefs}
      {...listeners}
      {...attributes}
      style={style}
      onClick={(e) => {
        e.stopPropagation()
        select(node.id, { additive: e.shiftKey })
      }}
      className={[
        'relative cursor-grab',
        isSelected ? 'outline outline-2 outline-blue-500 outline-offset-1' : '',
        isOver ? 'ring-2 ring-emerald-400' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {renderContent(node)}
      {node.children.map((child) => (
        <CanvasNode key={child.id} node={child} />
      ))}
      {isSelected && !isDragging && (
        <div
          onMouseDown={onResizeStart}
          className="absolute -bottom-1.5 -right-1.5 h-3 w-3 cursor-nwse-resize rounded-sm bg-blue-500"
        />
      )}
    </div>
  )
}

function renderContent(node: ElementNode) {
  switch (node.type) {
    case 'button':
      return <button className="pointer-events-none">{String(node.props.text ?? 'Button')}</button>
    case 'text':
      return <p className="pointer-events-none m-0">{String(node.props.text ?? 'Text')}</p>
    case 'image':
      return (
        <img
          className="pointer-events-none block max-w-full"
          src={String(node.props.src ?? '')}
          alt={String(node.props.alt ?? '')}
        />
      )
    case 'input':
      return (
        <input
          className="pointer-events-none"
          placeholder={String(node.props.placeholder ?? '')}
          readOnly
        />
      )
    case 'container':
    case 'form':
      return null
    default:
      return <div className="text-xs text-red-400">Unknown type: {node.type}</div>
  }
}
