import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import type {
  JSXAttribute,
  JSXElement,
  JSXExpressionContainer,
  ObjectExpression,
} from '@babel/types'
import type { ElementNode } from '../state/types'
import { ROOT_ID, createNodeId } from '../state/types'
import { TYPE_BY_TAG } from '../export/codegen'

export type ParseResult = { tree: ElementNode } | { error: string }

function getAttrStringValue(attr: JSXAttribute): string | undefined {
  const value = attr.value
  if (!value) return undefined
  if (value.type === 'StringLiteral') return value.value
  if (value.type === 'JSXExpressionContainer' && value.expression.type === 'StringLiteral') {
    return value.expression.value
  }
  return undefined
}

function getStyleObject(attr: JSXAttribute): Record<string, string | number> {
  const style: Record<string, string | number> = {}
  const value = attr.value as JSXExpressionContainer | null
  if (!value || value.type !== 'JSXExpressionContainer') return style
  const expr = value.expression
  if (expr.type !== 'ObjectExpression') return style
  const objectExpr = expr as ObjectExpression
  for (const prop of objectExpr.properties) {
    if (prop.type !== 'ObjectProperty') continue
    const key = prop.key.type === 'Identifier' ? prop.key.name : prop.key.type === 'StringLiteral' ? prop.key.value : null
    if (!key) continue
    if (prop.value.type === 'StringLiteral') {
      style[key] = prop.value.value
    } else if (prop.value.type === 'NumericLiteral') {
      style[key] = prop.value.value
    }
  }
  return style
}

function jsxElementToNode(el: JSXElement): ElementNode {
  const nameNode = el.openingElement.name
  const tagName = nameNode.type === 'JSXIdentifier' ? nameNode.name : 'div'
  const type = TYPE_BY_TAG[tagName] ?? tagName

  let id: string | undefined
  let style: Record<string, string | number> = {}
  const props: Record<string, unknown> = {}

  for (const attr of el.openingElement.attributes) {
    if (attr.type !== 'JSXAttribute') continue
    const name = attr.name.type === 'JSXIdentifier' ? attr.name.name : ''
    if (name === 'data-id') {
      id = getAttrStringValue(attr)
    } else if (name === 'style') {
      style = getStyleObject(attr)
    } else if (name === 'src' || name === 'alt' || name === 'placeholder') {
      const v = getAttrStringValue(attr)
      if (v !== undefined) props[name] = v
    }
  }

  const childElements = el.children.filter((c): c is JSXElement => c.type === 'JSXElement')
  const textChild = el.children.find((c) => c.type === 'JSXText' && c.value.trim().length > 0)
  if (textChild && textChild.type === 'JSXText') {
    props.text = textChild.value.trim()
  }

  return {
    id: id ?? createNodeId(type),
    type,
    props,
    style,
    children: childElements.map(jsxElementToNode),
  }
}

export function parseReactCodeToTree(code: string): ParseResult {
  let ast
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    })
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to parse code' }
  }

  let rootJsx: JSXElement | null = null
  try {
    traverse(ast, {
      ReturnStatement(path) {
        let arg = path.node.argument
        if (arg && arg.type === 'ParenthesizedExpression') arg = arg.expression
        if (arg && arg.type === 'JSXElement') {
          rootJsx = arg
          path.stop()
        }
      },
    })
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to traverse AST' }
  }

  if (!rootJsx) {
    return { error: 'No JSX return statement found (expected `return (<div>...</div>)`)' }
  }

  const node = jsxElementToNode(rootJsx)
  node.id = ROOT_ID
  node.type = 'root'
  return { tree: node }
}
