import type { ElementNode } from './types'

export function findNode(root: ElementNode, id: string): ElementNode | null {
  if (root.id === id) return root
  for (const child of root.children) {
    const found = findNode(child, id)
    if (found) return found
  }
  return null
}

export function findParent(root: ElementNode, childId: string): ElementNode | null {
  for (const child of root.children) {
    if (child.id === childId) return root
    const found = findParent(child, childId)
    if (found) return found
  }
  return null
}

/** Returns a new tree with `node` inserted as a child of `parentId` at `index` (default: end). */
export function insertNode(
  root: ElementNode,
  parentId: string,
  node: ElementNode,
  index?: number,
): ElementNode {
  if (root.id === parentId) {
    const children = [...root.children]
    const at = index === undefined ? children.length : Math.max(0, Math.min(index, children.length))
    children.splice(at, 0, node)
    return { ...root, children }
  }
  return {
    ...root,
    children: root.children.map((child) => insertNode(child, parentId, node, index)),
  }
}

/** Returns a new tree with the node matching `id` removed, plus the removed node (or null if not found). */
export function removeNode(
  root: ElementNode,
  id: string,
): { tree: ElementNode; removed: ElementNode | null } {
  let removed: ElementNode | null = null
  const filtered = root.children.filter((child) => {
    if (child.id === id) {
      removed = child
      return false
    }
    return true
  })
  if (removed) {
    return { tree: { ...root, children: filtered }, removed }
  }
  const nextChildren: ElementNode[] = []
  for (const child of root.children) {
    if (removed) {
      nextChildren.push(child)
      continue
    }
    const result = removeNode(child, id)
    if (result.removed) removed = result.removed
    nextChildren.push(result.tree)
  }
  return { tree: { ...root, children: nextChildren }, removed }
}

export function updateNodeInTree(
  root: ElementNode,
  id: string,
  partial: Partial<Pick<ElementNode, 'type' | 'props' | 'style'>>,
): ElementNode {
  if (root.id === id) {
    return {
      ...root,
      ...partial,
      props: partial.props ? { ...root.props, ...partial.props } : root.props,
      style: partial.style ? { ...root.style, ...partial.style } : root.style,
    }
  }
  return {
    ...root,
    children: root.children.map((child) => updateNodeInTree(child, id, partial)),
  }
}

/** Moves the node with `id` to be a child of `newParentId` at `newIndex`. No-op if the move would nest a node under itself. */
export function moveNodeInTree(
  root: ElementNode,
  id: string,
  newParentId: string,
  newIndex?: number,
): ElementNode {
  const nodeToMove = findNode(root, id)
  if (!nodeToMove) return root
  if (findNode(nodeToMove, newParentId)) return root // would create a cycle

  const { tree: withoutNode, removed } = removeNode(root, id)
  if (!removed) return root
  return insertNode(withoutNode, newParentId, removed, newIndex)
}
