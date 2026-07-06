import { describe, expect, it } from 'vitest'
import { createRootNode } from '../state/types'
import { insertNode } from '../state/tree'
import { generateReactCode } from '../export/codegen'
import { parseReactCodeToTree } from './parseCodeToTree'

describe('code generation + sync round trip', () => {
  it('generates JSX from a tree and parses it back to an equivalent tree', () => {
    const root = createRootNode()
    const container = {
      id: 'container-1',
      type: 'container',
      props: {},
      style: { display: 'flex', padding: 16 },
      children: [],
    }
    const withContainer = insertNode(root, 'root', container)
    const button = {
      id: 'button-1',
      type: 'button',
      props: { text: 'Click me' },
      style: { background: '#2563eb' },
      children: [],
    }
    const tree = insertNode(withContainer, 'container-1', button)

    const code = generateReactCode(tree)
    expect(code).toContain('Click me')

    const result = parseReactCodeToTree(code)
    expect('tree' in result).toBe(true)
    if (!('tree' in result)) return

    expect(result.tree.id).toBe('root')
    expect(result.tree.children).toHaveLength(1)
    const parsedContainer = result.tree.children[0]
    expect(parsedContainer.id).toBe('container-1')
    expect(parsedContainer.style).toEqual({ display: 'flex', padding: 16 })
    const parsedButton = parsedContainer.children[0]
    expect(parsedButton.id).toBe('button-1')
    expect(parsedButton.type).toBe('button')
    expect(parsedButton.props.text).toBe('Click me')
    expect(parsedButton.style).toEqual({ background: '#2563eb' })
  })

  it('reports an error and does not throw on invalid code', () => {
    const result = parseReactCodeToTree('this is not valid jsx {{{')
    expect('error' in result).toBe(true)
  })
})
