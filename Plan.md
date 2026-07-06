# Implementation Plan

Follow these phases in order. Each phase should be working and testable
before moving to the next.

## Phase 1: Project Setup

- Init React + TypeScript + Vite project
- Add Tailwind CSS
- Set up Zustand store for global state
- Set up basic app shell: sidebar (components), canvas area, right panel (properties), bottom/side code editor

## Phase 2: Element Tree & State Model

- Define JSON schema for an element node: `{ id, type, props, style, children }`
- Store the full tree in Zustand
- Implement add, delete, update, move operations on the tree
- Implement undo/redo (keep a history stack of tree snapshots)

## Phase 3: Canvas Rendering

- Render the element tree recursively as actual DOM/React components
- Add selection (click to select, show bounding box)
- Add drag-drop using dnd-kit: dragging from sidebar creates a new node, dragging within canvas reorders/nests nodes
- Add resize handles and snap-to-grid

## Phase 4: Component Library

- Build a set of base components: Button, Text, Image, Container, Input, Form
- Each component definition includes: default props, default style, icon for sidebar, allowed children (if any)
- Make library data-driven (array of component configs) so new components can be added easily

## Phase 5: Code Generation (Tree -> Code)

- Write a function that converts the element tree into JSX/HTML string
- Support both plain HTML/CSS/JS export and React component export
- Display generated code in Monaco Editor (read-only at first)

## Phase 6: Code Sync (Code -> Tree)

- Parse edited code back into the element tree (use an AST parser, e.g. Babel for JSX)
- On valid parse, update Zustand tree and re-render canvas
- On invalid/incomplete code, show inline error, do not break canvas state

## Phase 7: Properties Panel

- Right panel shows props/style of selected element
- Editing a field updates the tree, which updates both canvas and code

## Phase 8: Export

- "Export Project" button: bundles tree into a downloadable HTML/React project (zip)
- Support exporting as static site or React app scaffold

## Phase 9: Desktop Packaging

- Add Tauri, wrap the existing React app
- Confirm drag-drop and Monaco editor work inside Tauri webview
- Build for Windows/macOS/Linux

## Phase 10: Polish

- Multi-select, copy-paste elements
- Keyboard shortcuts (delete, duplicate, undo/redo)
- Save/load project as JSON file
- Optional: cloud save via backend (Node.js + Fastify + PostgreSQL)

## Notes for Claude Code

- Keep the element tree as the single source of truth; canvas and code editor are both views of it
- Any change from drag-drop, properties panel, or code editor should go through the same tree-update functions
- Write small, testable functions for tree operations (add/remove/update) before wiring up UI
- Prefer incremental commits per phase, not one large commit

## Example

Phase 3 done means: dragging a "Button" from the sidebar onto the canvas
creates a new button element, shows it visually, and selecting it shows
a bounding box with resize handles.
