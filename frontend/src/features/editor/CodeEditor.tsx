import { Fragment, useRef, useState, type KeyboardEvent } from 'react';

const tokenPattern =
  /(?<comment>\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|#[^\n]*)|(?<string>"(?:\\[^\n]|[^"\\\n])*"?|'(?:\\[^\n]|[^'\\\n])*'?)|(?<keyword>\b(?:async|await|bool|break|case|catch|class|const|continue|def|else|false|fn|for|foreach|from|function|if|import|in|int|interface|let|new|null|private|public|return|static|string|struct|switch|this|throw|true|try|type|using|var|void|while)\b)|(?<number>\b\d+(?:\.\d+)?\b)|(?<punctuation>[{}()[\];,.=+*/<>!&|:%?^-])/g;

function highlight(code: string) {
  let offset = 0;
  const tokens = Array.from(code.matchAll(tokenPattern), (match) => {
    const start = match.index;
    const text = code.slice(offset, start);
    const kind = Object.keys(match.groups ?? {}).find((key) => match.groups?.[key] !== undefined);
    offset = start + match[0].length;
    return (
      <Fragment key={start}>
        {text}
        <span className={`editor-token-${kind}`}>{match[0]}</span>
      </Fragment>
    );
  });
  return [...tokens, code.slice(offset)];
}

export function CodeEditor({ wide, onToggleWidth }: { wide: boolean; onToggleWidth: () => void }) {
  const [code, setCode] = useState('');
  const [caret, setCaret] = useState(0);
  const [copyFeedback, setCopyFeedback] = useState('');
  const highlightLayer = useRef<HTMLPreElement>(null);
  const gutter = useRef<HTMLDivElement>(null);
  const lines = code.split('\n');
  const beforeCaret = code.slice(0, caret);
  const line = beforeCaret.split('\n').length;
  const column = beforeCaret.length - beforeCaret.lastIndexOf('\n');

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyFeedback('Code copied');
    } catch {
      setCopyFeedback('Could not copy code');
    }
  }

  function insertIndentedLine(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;

    const input = event.currentTarget;
    const { selectionStart, selectionEnd, value } = input;
    const prefix = value.slice(0, selectionStart);
    const currentLine = prefix.slice(prefix.lastIndexOf('\n') + 1);
    const indent = currentLine.match(/^[\t ]*/)?.[0] ?? '';
    const extraIndent = /[{[(]$/.test(currentLine.trimEnd()) ? '  ' : '';
    if (!indent && !extraIndent) return;

    event.preventDefault();
    input.setRangeText(`\n${indent}${extraIndent}`, selectionStart, selectionEnd, 'end');
    setCode(input.value);
    setCaret(input.selectionStart);
  }

  return (
    <section aria-label="Code editor" className="flex h-full min-h-40 flex-col overflow-hidden bg-code">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-divider bg-toolbar px-3 py-2 font-mono text-xs text-muted">
        <h2 className="font-semibold text-foreground">Scratchpad</h2>
        <div className="flex items-center gap-1">
          <button type="button" onClick={copyCode}
            className="rounded-control px-2 py-1 text-accent hover:bg-hover">
            Copy
          </button>
          <button type="button" onClick={onToggleWidth}
            className="rounded-control px-2 py-1 text-accent hover:bg-hover">
            {wide ? 'Narrow' : 'Expand'}
          </button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <div ref={gutter} aria-hidden="true" className="editor-gutter shrink-0 overflow-hidden border-r border-divider bg-toolbar px-3 text-right font-mono text-muted">
          {lines.map((_, index) => (
            <div key={index} className={index === line - 1 ? 'text-accent' : undefined}>{index + 1}</div>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          <pre ref={highlightLayer} aria-hidden="true" className="editor-layer pointer-events-none overflow-hidden text-foreground">
            {highlight(code)}{code.endsWith('\n') && '\u200b'}
          </pre>
          <textarea
            aria-label="Code scratchpad"
            className="editor-layer resize-none overflow-auto bg-transparent text-transparent caret-accent placeholder:text-muted focus-visible:-outline-offset-2"
            placeholder="Type or paste code here…"
            autoCapitalize="off"
            autoComplete="off"
            spellCheck={false}
            wrap="off"
            value={code}
            onChange={(event) => {
              setCode(event.currentTarget.value);
              setCaret(event.currentTarget.selectionStart);
            }}
            onKeyDown={insertIndentedLine}
            onSelect={(event) => setCaret(event.currentTarget.selectionStart)}
            onScroll={(event) => {
              const { scrollLeft, scrollTop } = event.currentTarget;
              highlightLayer.current?.scrollTo(scrollLeft, scrollTop);
              gutter.current?.scrollTo(0, scrollTop);
            }}
          />
        </div>
      </div>
      <div className="flex flex-wrap justify-between gap-x-2 border-t border-divider bg-toolbar px-4 py-2 font-mono text-xs text-muted">
        <span role="status">{copyFeedback}</span>
        <span className="ml-auto">Ln {line}, Col {column}</span>
      </div>
    </section>
  );
}
