import { beforeEach, describe, expect, it } from 'vitest'
import { useBuilderStore } from './store'
import { ROOT_ID } from './types'
import { findNode } from './tree'

beforeEach(() => {
  const { loadTree } = useBuilderStore.getState()
  loadTree({ id: ROOT_ID, type: 'root', props: {}, style: {}, children: [] })
})

describe('builder store: multi-select, copy/paste, duplicate, delete', () => {
  it('supports additive (shift-click) multi-select and plain single-select', () => {
    const { addNode, select } = useBuilderStore.getState()
    const a = addNode(ROOT_ID, { type: 'button', props: {}, style: {}, children: [] })
    const b = addNode(ROOT_ID, { type: 'text', props: {}, style: {}, children: [] })

    select(a)
    select(b, { additive: true })
    expect(useBuilderStore.getState().selectedIds.sort()).toEqual([a, b].sort())

    select(a)
    expect(useBuilderStore.getState().selectedIds).toEqual([a])
  })

  it('duplicateSelected inserts a sibling clone with a new id, right after the original', () => {
    const { addNode, select, duplicateSelected } = useBuilderStore.getState()
    const a = addNode(ROOT_ID, { type: 'button', props: { text: 'Hi' }, style: {}, children: [] })
    select(a)
    duplicateSelected()

    const tree = useBuilderStore.getState().tree
    expect(tree.children).toHaveLength(2)
    expect(tree.children[0].id).toBe(a)
    expect(tree.children[1].id).not.toBe(a)
    expect(tree.children[1].props.text).toBe('Hi')
    expect(useBuilderStore.getState().selectedIds).toEqual([tree.children[1].id])
  })

  it('copySelected + pasteClipboard clones the node with a fresh id into the recorded parent', () => {
    const { addNode, select, copySelected, pasteClipboard } = useBuilderStore.getState()
    const container = addNode(ROOT_ID, { type: 'container', props: {}, style: {}, children: [] })
    const button = addNode(container, { type: 'button', props: { text: 'Copy me' }, style: {}, children: [] })

    select(button)
    copySelected()
    pasteClipboard()

    const tree = useBuilderStore.getState().tree
    const containerNode = findNode(tree, container)
    expect(containerNode?.children).toHaveLength(2)
    const pasted = containerNode?.children[1]
    expect(pasted?.id).not.toBe(button)
    expect(pasted?.props.text).toBe('Copy me')
  })

  it('deleteSelected removes all currently selected nodes in one step', () => {
    const { addNode, select, deleteSelected } = useBuilderStore.getState()
    const a = addNode(ROOT_ID, { type: 'button', props: {}, style: {}, children: [] })
    const b = addNode(ROOT_ID, { type: 'text', props: {}, style: {}, children: [] })
    select(a)
    select(b, { additive: true })

    deleteSelected()

    const tree = useBuilderStore.getState().tree
    expect(tree.children).toHaveLength(0)
    expect(useBuilderStore.getState().selectedIds).toEqual([])
  })
})
