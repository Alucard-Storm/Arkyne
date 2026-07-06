export interface ComponentConfig {
  type: string
  label: string
  icon: string
  defaultProps: Record<string, unknown>
  defaultStyle: Record<string, string | number>
  allowsChildren: boolean
}

export const componentLibrary: ComponentConfig[] = [
  {
    type: 'button',
    label: 'Button',
    icon: '\u{1F518}',
    defaultProps: { text: 'Button' },
    defaultStyle: { padding: '8px 16px', background: '#2563eb', color: '#fff', borderRadius: 6, border: 'none' },
    allowsChildren: false,
  },
  {
    type: 'text',
    label: 'Text',
    icon: '\u{1F4DD}',
    defaultProps: { text: 'Text' },
    defaultStyle: { color: '#e5e5e5', fontSize: 14 },
    allowsChildren: false,
  },
  {
    type: 'image',
    label: 'Image',
    icon: '\u{1F5BC}',
    defaultProps: { src: 'https://placehold.co/160x100', alt: 'image' },
    defaultStyle: { width: 160, height: 100 },
    allowsChildren: false,
  },
  {
    type: 'container',
    label: 'Container',
    icon: '\u{1F4E6}',
    defaultProps: {},
    defaultStyle: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: 16,
      minHeight: 80,
      minWidth: 120,
      border: '1px dashed #737373',
    },
    allowsChildren: true,
  },
  {
    type: 'input',
    label: 'Input',
    icon: '\u{2328}',
    defaultProps: { placeholder: 'Input' },
    defaultStyle: { padding: '6px 10px', border: '1px solid #737373', borderRadius: 4, background: '#171717', color: '#e5e5e5' },
    allowsChildren: false,
  },
  {
    type: 'form',
    label: 'Form',
    icon: '\u{1F9FE}',
    defaultProps: {},
    defaultStyle: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: 16,
      minHeight: 80,
      minWidth: 160,
      border: '1px solid #404040',
      borderRadius: 8,
    },
    allowsChildren: true,
  },
]

export function getComponentConfig(type: string): ComponentConfig | undefined {
  return componentLibrary.find((c) => c.type === type)
}
