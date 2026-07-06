export interface ElementNode {
  id: string
  type: string
  props: Record<string, unknown>
  style: Record<string, string | number>
  children: ElementNode[]
}

export const ROOT_ID = 'root'

export function createRootNode(): ElementNode {
  return {
    id: ROOT_ID,
    type: 'root',
    props: {},
    style: {},
    children: [],
  }
}

let nextId = 1
export function createNodeId(type: string): string {
  return `${type}-${nextId++}`
}
