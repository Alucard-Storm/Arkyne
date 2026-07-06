import Sidebar from './Sidebar'
import CanvasArea from './CanvasArea'
import PropertiesPanel from './PropertiesPanel'
import CodePanel from './CodePanel'

export default function AppShell() {
  return (
    <div className="h-full w-full flex flex-col">
      <header className="h-12 shrink-0 flex items-center px-4 border-b border-neutral-800 bg-neutral-900 text-neutral-100">
        <span className="font-semibold">Arkyne</span>
        <span className="ml-2 text-xs text-neutral-500">Visual UI Builder</span>
      </header>
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <CanvasArea />
          <CodePanel />
        </div>
        <PropertiesPanel />
      </div>
    </div>
  )
}
