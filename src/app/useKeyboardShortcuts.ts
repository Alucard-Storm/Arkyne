import { useEffect } from 'react'
import { useBuilderStore } from '../state/store'

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return true
  return target.closest('.monaco-editor') !== null
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return

      const mod = e.ctrlKey || e.metaKey
      const store = useBuilderStore.getState()

      if ((e.key === 'Delete' || e.key === 'Backspace') && store.selectedIds.length > 0) {
        e.preventDefault()
        store.deleteSelected()
        return
      }

      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) store.redo()
        else store.undo()
        return
      }

      if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        store.redo()
        return
      }

      if (mod && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        store.copySelected()
        return
      }

      if (mod && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        store.pasteClipboard()
        return
      }

      if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        store.duplicateSelected()
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
