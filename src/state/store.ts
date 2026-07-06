import { create } from 'zustand'
import type { ElementNode } from './types'
import { createNodeId, createRootNode } from './types'
import { insertNode, moveNodeInTree, removeNode, replaceNodeStyle, updateNodeInTree } from './tree'

interface BuilderState {
  tree: ElementNode
  selectedId: string | null
  past: ElementNode[]
  future: ElementNode[]

  addNode: (parentId: string, node: Omit<ElementNode, 'id'> & { id?: string }, index?: number) => string
  deleteNode: (id: string) => void
  updateNode: (id: string, partial: Partial<Pick<ElementNode, 'type' | 'props' | 'style'>>) => void
  setStyle: (id: string, style: Record<string, string | number>) => void
  moveNode: (id: string, newParentId: string, newIndex?: number) => void
  select: (id: string | null) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  loadTree: (tree: ElementNode) => void
}

const HISTORY_LIMIT = 100

function pushHistory(past: ElementNode[], current: ElementNode): ElementNode[] {
  const next = [...past, current]
  if (next.length > HISTORY_LIMIT) next.shift()
  return next
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  tree: createRootNode(),
  selectedId: null,
  past: [],
  future: [],

  addNode: (parentId, node, index) => {
    const id = node.id ?? createNodeId(node.type)
    const fullNode: ElementNode = { ...node, id, children: node.children ?? [] }
    set((state) => ({
      tree: insertNode(state.tree, parentId, fullNode, index),
      past: pushHistory(state.past, state.tree),
      future: [],
      selectedId: id,
    }))
    return id
  },

  deleteNode: (id) => {
    set((state) => {
      const { tree } = removeNode(state.tree, id)
      return {
        tree,
        past: pushHistory(state.past, state.tree),
        future: [],
        selectedId: state.selectedId === id ? null : state.selectedId,
      }
    })
  },

  updateNode: (id, partial) => {
    set((state) => ({
      tree: updateNodeInTree(state.tree, id, partial),
      past: pushHistory(state.past, state.tree),
      future: [],
    }))
  },

  setStyle: (id, style) => {
    set((state) => ({
      tree: replaceNodeStyle(state.tree, id, style),
      past: pushHistory(state.past, state.tree),
      future: [],
    }))
  },

  moveNode: (id, newParentId, newIndex) => {
    set((state) => ({
      tree: moveNodeInTree(state.tree, id, newParentId, newIndex),
      past: pushHistory(state.past, state.tree),
      future: [],
    }))
  },

  select: (id) => set({ selectedId: id }),

  undo: () => {
    const { past, tree, future } = get()
    if (past.length === 0) return
    const previous = past[past.length - 1]
    set({
      tree: previous,
      past: past.slice(0, -1),
      future: [tree, ...future],
    })
  },

  redo: () => {
    const { future, tree, past } = get()
    if (future.length === 0) return
    const next = future[0]
    set({
      tree: next,
      future: future.slice(1),
      past: pushHistory(past, tree),
    })
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  loadTree: (tree) => set({ tree, past: [], future: [], selectedId: null }),
}))
