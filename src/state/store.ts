import { create } from 'zustand'
import type { ElementNode } from './types'
import { ROOT_ID, createNodeId, createRootNode } from './types'
import { findNode, findParent, insertNode, moveNodeInTree, removeNode, replaceNodeStyle, updateNodeInTree } from './tree'

interface BuilderState {
  tree: ElementNode
  selectedIds: string[]
  clipboard: ElementNode[]
  clipboardParentId: string | null
  past: ElementNode[]
  future: ElementNode[]

  addNode: (parentId: string, node: Omit<ElementNode, 'id'> & { id?: string }, index?: number) => string
  deleteNode: (id: string) => void
  deleteSelected: () => void
  updateNode: (id: string, partial: Partial<Pick<ElementNode, 'type' | 'props' | 'style'>>) => void
  setStyle: (id: string, style: Record<string, string | number>) => void
  moveNode: (id: string, newParentId: string, newIndex?: number) => void
  select: (id: string | null, options?: { additive?: boolean }) => void
  copySelected: () => void
  pasteClipboard: () => void
  duplicateSelected: () => void
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

function cloneNodeWithNewIds(node: ElementNode): ElementNode {
  return {
    ...node,
    id: createNodeId(node.type),
    children: node.children.map(cloneNodeWithNewIds),
  }
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  tree: createRootNode(),
  selectedIds: [],
  clipboard: [],
  clipboardParentId: null,
  past: [],
  future: [],

  addNode: (parentId, node, index) => {
    const id = node.id ?? createNodeId(node.type)
    const fullNode: ElementNode = { ...node, id, children: node.children ?? [] }
    set((state) => ({
      tree: insertNode(state.tree, parentId, fullNode, index),
      past: pushHistory(state.past, state.tree),
      future: [],
      selectedIds: [id],
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
        selectedIds: state.selectedIds.filter((s) => s !== id),
      }
    })
  },

  deleteSelected: () => {
    set((state) => {
      if (state.selectedIds.length === 0) return state
      let tree = state.tree
      for (const id of state.selectedIds) {
        tree = removeNode(tree, id).tree
      }
      return {
        tree,
        past: pushHistory(state.past, state.tree),
        future: [],
        selectedIds: [],
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

  select: (id, options) => {
    set((state) => {
      if (id === null) return { selectedIds: [] }
      if (options?.additive) {
        return state.selectedIds.includes(id)
          ? { selectedIds: state.selectedIds.filter((s) => s !== id) }
          : { selectedIds: [...state.selectedIds, id] }
      }
      return { selectedIds: [id] }
    })
  },

  copySelected: () => {
    const { tree, selectedIds } = get()
    if (selectedIds.length === 0) return
    const nodes = selectedIds.map((id) => findNode(tree, id)).filter((n): n is ElementNode => n !== null)
    if (nodes.length === 0) return
    const parent = findParent(tree, nodes[0].id)
    set({ clipboard: nodes, clipboardParentId: parent?.id ?? ROOT_ID })
  },

  pasteClipboard: () => {
    const { clipboard, clipboardParentId, tree, past } = get()
    if (clipboard.length === 0) return
    const parentId = clipboardParentId && findNode(tree, clipboardParentId) ? clipboardParentId : ROOT_ID
    let nextTree = tree
    const newIds: string[] = []
    for (const node of clipboard) {
      const clone = cloneNodeWithNewIds(node)
      newIds.push(clone.id)
      nextTree = insertNode(nextTree, parentId, clone)
    }
    set({
      tree: nextTree,
      past: pushHistory(past, tree),
      future: [],
      selectedIds: newIds,
    })
  },

  duplicateSelected: () => {
    set((state) => {
      if (state.selectedIds.length === 0) return state
      let tree = state.tree
      const newIds: string[] = []
      for (const id of state.selectedIds) {
        const node = findNode(tree, id)
        if (!node) continue
        const parent = findParent(tree, id)
        const parentId = parent?.id ?? ROOT_ID
        const index = parent ? parent.children.findIndex((c) => c.id === id) : -1
        const clone = cloneNodeWithNewIds(node)
        newIds.push(clone.id)
        tree = insertNode(tree, parentId, clone, index >= 0 ? index + 1 : undefined)
      }
      return {
        tree,
        past: pushHistory(state.past, state.tree),
        future: [],
        selectedIds: newIds,
      }
    })
  },

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

  loadTree: (tree) => set({ tree, past: [], future: [], selectedIds: [] }),
}))
