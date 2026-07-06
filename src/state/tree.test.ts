import { describe, expect, it } from 'vitest'
import { createRootNode } from './types'
import { findNode, insertNode, moveNodeInTree, removeNode, replaceNodeStyle, updateNodeInTree } from './tree'

describe('tree operations', () => {
  it('inserts, finds, updates, removes, and moves nodes immutably', () => {
    const root = createRootNode()
    const child = { id: 'a', type: 'button', props: {}, style: {}, children: [] }
    const withChild = insertNode(root, 'root', child)

    expect(root.children).toHaveLength(0) // original untouched
    expect(findNode(withChild, 'a')).toEqual(child)

    const nested = { id: 'b', type: 'text', props: {}, style: {}, children: [] }
    const withNested = insertNode(withChild, 'a', nested)
    expect(findNode(withNested, 'b')).toEqual(nested)

    const updated = updateNodeInTree(withNested, 'b', { props: { label: 'hi' } })
    expect(findNode(updated, 'b')?.props).toEqual({ label: 'hi' })

    const moved = moveNodeInTree(updated, 'b', 'root')
    expect(findNode(moved, 'root')?.children.map((c) => c.id)).toContain('b')
    expect(findNode(moved, 'a')?.children).toHaveLength(0)

    // moving a node under itself is a no-op
    const cyclic = moveNodeInTree(moved, 'a', 'a')
    expect(cyclic).toBe(moved)

    const { tree: afterRemove, removed } = removeNode(moved, 'b')
    expect(removed?.id).toBe('b')
    expect(findNode(afterRemove, 'b')).toBeNull()
  })

  it('replaceNodeStyle fully replaces style, unlike the merge-based update', () => {
    const root = createRootNode()
    const child = { id: 'a', type: 'button', props: {}, style: { color: 'red', padding: 8 }, children: [] }
    const withChild = insertNode(root, 'root', child)

    const replaced = replaceNodeStyle(withChild, 'a', { padding: 8 })
    expect(findNode(replaced, 'a')?.style).toEqual({ padding: 8 })
  })
})
