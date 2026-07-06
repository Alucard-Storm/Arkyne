import type { ElementNode } from '../state/types'

export const TAG_BY_TYPE: Record<string, string> = {
  root: 'div',
  container: 'div',
  button: 'button',
  text: 'p',
  image: 'img',
  input: 'input',
  form: 'form',
}

export const TYPE_BY_TAG: Record<string, string> = {
  div: 'container',
  button: 'button',
  p: 'text',
  img: 'image',
  input: 'input',
  form: 'form',
}

const VOID_TAGS = new Set(['img', 'input'])

function camelToKebab(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

function styleToJsxObjectLiteral(style: Record<string, string | number>): string {
  const entries = Object.entries(style).map(([key, value]) => {
    const jsValue = typeof value === 'number' ? String(value) : JSON.stringify(value)
    return `${key}: ${jsValue}`
  })
  return `{{ ${entries.join(', ')} }}`
}

function styleToCss(style: Record<string, string | number>): string {
  return Object.entries(style)
    .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
    .join('; ')
}

function escapeText(text: string): string {
  return text.replace(/[{}]/g, (c) => (c === '{' ? '&#123;' : '&#125;'))
}

function jsxAttrs(node: ElementNode): string {
  const tag = TAG_BY_TYPE[node.type] ?? 'div'
  const attrs: string[] = [`data-id="${node.id}"`]
  if (tag === 'img') {
    attrs.push(`src="${String(node.props.src ?? '')}"`)
    attrs.push(`alt="${String(node.props.alt ?? '')}"`)
  }
  if (tag === 'input') {
    attrs.push(`placeholder="${String(node.props.placeholder ?? '')}"`)
    attrs.push('readOnly')
  }
  if (Object.keys(node.style).length > 0) {
    attrs.push(`style={${styleToJsxObjectLiteral(node.style).slice(1, -1)}}`)
  }
  return attrs.join(' ')
}

function renderJsxNode(node: ElementNode, depth: number): string {
  const indent = '  '.repeat(depth)
  const tag = TAG_BY_TYPE[node.type] ?? 'div'
  const attrs = jsxAttrs(node)

  if (VOID_TAGS.has(tag)) {
    return `${indent}<${tag} ${attrs} />`
  }

  const textContent = tag === 'button' || tag === 'p' ? String(node.props.text ?? '') : ''
  const childLines = node.children.map((child) => renderJsxNode(child, depth + 1))

  if (!textContent && childLines.length === 0) {
    return `${indent}<${tag} ${attrs}></${tag}>`
  }

  const inner = [textContent ? `${indent}  ${escapeText(textContent)}` : null, ...childLines]
    .filter((line): line is string => line !== null)
    .join('\n')

  return `${indent}<${tag} ${attrs}>\n${inner}\n${indent}</${tag}>`
}

export function generateReactCode(tree: ElementNode): string {
  const body = renderJsxNode(tree, 2)
  return `export default function GeneratedComponent() {\n  return (\n${body}\n  )\n}\n`
}

function htmlAttrs(node: ElementNode): string {
  const tag = TAG_BY_TYPE[node.type] ?? 'div'
  const attrs: string[] = []
  if (tag === 'img') {
    attrs.push(`src="${String(node.props.src ?? '')}"`)
    attrs.push(`alt="${String(node.props.alt ?? '')}"`)
  }
  if (tag === 'input') {
    attrs.push(`placeholder="${String(node.props.placeholder ?? '')}"`)
  }
  if (Object.keys(node.style).length > 0) {
    attrs.push(`style="${styleToCss(node.style)}"`)
  }
  return attrs.length ? ' ' + attrs.join(' ') : ''
}

function renderHtmlNode(node: ElementNode, depth: number): string {
  const indent = '  '.repeat(depth)
  const tag = TAG_BY_TYPE[node.type] ?? 'div'
  const attrs = htmlAttrs(node)

  if (VOID_TAGS.has(tag)) {
    return `${indent}<${tag}${attrs} />`
  }

  const textContent = tag === 'button' || tag === 'p' ? String(node.props.text ?? '') : ''
  const childLines = node.children.map((child) => renderHtmlNode(child, depth + 1))

  if (!textContent && childLines.length === 0) {
    return `${indent}<${tag}${attrs}></${tag}>`
  }

  const inner = [textContent ? `${indent}  ${textContent}` : null, ...childLines]
    .filter((line): line is string => line !== null)
    .join('\n')

  return `${indent}<${tag}${attrs}>\n${inner}\n${indent}</${tag}>`
}

export function generateHtmlCode(tree: ElementNode): string {
  const body = renderHtmlNode(tree, 2)
  return `<!doctype html>\n<html>\n<head>\n  <meta charset="utf-8" />\n  <title>Arkyne Export</title>\n</head>\n<body>\n${body}\n</body>\n</html>\n`
}
