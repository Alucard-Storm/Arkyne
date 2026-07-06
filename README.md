# Arkyne - Visual UI Builder

An interactive web-based UI builder that lets users drag and drop components
to design layouts, while also allowing direct code editing that stays in
sync with the visual canvas.

## Features

- Drag-and-drop canvas for placing and arranging UI elements
- Prebuilt component library (buttons, forms, containers, text, images)
- Live code editor (Monaco) synced bidirectionally with the canvas
- Undo/redo, multi-select, snap-to-grid
- Export to HTML/CSS/JS or React project
- Cross-platform: runs as a web app and as a desktop app (via Tauri)

## Tech Stack

- Frontend: React + TypeScript + Vite
- Canvas/Drag-Drop: dnd-kit (DOM-based) or Konva.js (canvas-based)
- Code Editor: Monaco Editor
- State Management: Zustand
- Styling: Tailwind CSS
- Desktop Shell: Tauri (Rust-based)
- Backend (optional): Node.js + Fastify + PostgreSQL

## Project Structure

```
/src
  /canvas        -> canvas rendering, drag-drop logic
  /components     -> prebuilt draggable component definitions
  /editor         -> Monaco code editor integration
  /state          -> Zustand stores (element tree, selection, history)
  /export         -> code generation and export logic
  /app            -> shell/layout of the builder UI
/src-tauri        -> Tauri desktop config (Rust)
```

## Getting Started

```bash
npm install
npm run dev        # web version
npm run tauri dev  # desktop version
```

## Documentation

See `Plan.md` for the full implementation plan and build order.
