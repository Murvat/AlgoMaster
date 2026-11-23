import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { librarySelected, type Library } from '../features/catalog/catalogSlice';
import type { AppDispatch, RootState } from './store';
import { CodeEditor } from '../features/editor/CodeEditor';

const libraries = [
  { id: 'algorithms', label: 'Algorithms', icon: 'M8 6 2 12l6 6m8-12 6 6-6 6m-2-14-4 16' },
  { id: 'design-patterns', label: 'Design Patterns', icon: 'M12 3v5m-7 8v-4h14v4m-7-4V8M9 3h6v5H9zM2 16h6v5H2zm14 0h6v5h-6z' },
  { id: 'data-structures', label: 'Data Structures', icon: 'M12 3 2 8l10 5 10-5-10-5ZM2 12l10 5 10-5M2 16l10 5 10-5' },
] as const satisfies ReadonlyArray<{ id: Library; label: string; icon: string }>;

const railButton =
  'grid size-10 place-items-center rounded-control text-muted transition-colors hover:bg-hover hover:text-foreground aria-expanded:bg-accent-surface aria-expanded:text-accent motion-reduce:transition-none';

const desktopLayout = '(min-width: 768px)';

function RailIcon({ path }: { path: string }) {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

export function App() {
  const activeLibrary = useSelector((state: RootState) => state.catalog.activeLibrary);
  const dispatch = useDispatch<AppDispatch>();
  const [libraryOpen, setLibraryOpen] = useState(() =>
    window.matchMedia(desktopLayout).matches,
  );
  const [editorOpen, setEditorOpen] = useState(() =>
    window.matchMedia(desktopLayout).matches,
  );
  const [editorWide, setEditorWide] = useState(false);
  const library = libraries.find(({ id }) => id === activeLibrary) ?? libraries[0];

  function toggleLibrary(id: Library) {
    setLibraryOpen(!libraryOpen || id !== activeLibrary);
    dispatch(librarySelected(id));
    if (!window.matchMedia(desktopLayout).matches) setEditorOpen(false);
  }

  function toggleEditor() {
    setEditorOpen(!editorOpen);
    if (!window.matchMedia(desktopLayout).matches) setLibraryOpen(false);
  }

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden">
      <header className="flex h-16 shrink-0 items-center gap-2.5 border-b border-divider bg-toolbar px-4 sm:px-5">
        <span
          aria-hidden="true"
          className="grid size-8 place-items-center rounded-control bg-accent font-mono text-lg font-black text-on-accent"
        >
          λ
        </span>
        <h1 className="font-extrabold tracking-tight uppercase">Algorithm Lab</h1>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <nav aria-label="Study libraries" className="z-20 flex w-12 shrink-0 flex-col items-center gap-2 border-r border-divider bg-toolbar py-3 sm:w-14">
          {libraries.map(({ id, label, icon }) => (
            <button key={id} type="button" className={railButton} title={label} aria-label={label}
              aria-controls="library-panel" aria-expanded={libraryOpen && id === activeLibrary}
              onClick={() => toggleLibrary(id)}>
              <RailIcon path={icon} />
            </button>
          ))}
        </nav>

        <aside id="library-panel" aria-label={library.label} hidden={!libraryOpen}
          className="ide-panel left-12 w-[min(17.5rem,calc(100%-6rem))] border-r border-divider bg-sidebar p-5 sm:left-14 sm:w-64 xl:w-72">
          <h2 className="font-mono text-xs font-bold tracking-widest text-accent uppercase">Pattern library</h2>
          <p className="mt-2 text-lg font-bold">{library.label}</p>
          <p className="mt-1 text-sm text-muted">No study items loaded.</p>
        </aside>

        <main aria-label="Study workspace" tabIndex={0} className="ide-workspace min-w-0 flex-1 overflow-auto focus-visible:-outline-offset-3">
          <div className="mx-auto flex min-h-full max-w-5xl flex-col px-3 py-6 sm:px-8 sm:py-10">
            <p className="font-mono text-xs font-bold tracking-widest text-accent uppercase">{library.label}</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">Study workspace</h2>
          </div>
        </main>

        <aside id="editor-panel" aria-label="Code editor sidebar" hidden={!editorOpen}
          data-wide={editorWide} className="ide-panel ide-editor-panel right-12 border-l border-divider bg-code sm:right-14">
          <CodeEditor wide={editorWide} onToggleWidth={() => setEditorWide((wide) => !wide)} />
        </aside>

        <div role="group" aria-label="Workspace panels" className="z-20 flex w-12 shrink-0 justify-center border-l border-divider bg-toolbar py-3 sm:w-14">
          <button type="button" className={railButton} title="Code editor" aria-label="Code editor"
            aria-controls="editor-panel" aria-expanded={editorOpen} onClick={toggleEditor}>
            <RailIcon path="M8 6 2 12l6 6m8-12 6 6-6 6m-2-14-4 16" />
          </button>
        </div>
      </div>
    </div>
  );
}
