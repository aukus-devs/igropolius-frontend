import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import Quill, { Delta, QuillOptions, Range } from 'quill';

import 'quill/dist/quill.snow.css';

type Props = {
  readOnly?: boolean;
  initialValue?: string;
  onTextChange?: (data: string) => void;
};

export function RichTextEditor({ readOnly, onTextChange, initialValue }: Props) {
  // Use a ref to access the quill instance directly
  const quillRef = useRef<Quill | null>(null);

  const handleTextChange = (_delta: Delta, _oldDelta: Delta, _source: string) => {
    // console.log('Text change:', delta, oldDelta, source)
    const content = quillRef.current?.getContents();
    // console.log("Content:", JSON.stringify(content));
    if (content) {
      onTextChange?.(JSON.stringify(content));
    }
  };

  useEffect(() => {
    const initialDecoded = initialValue
      ? new Delta(JSON.parse(initialValue))
      : new Delta().insert('Начни редактировать');
    quillRef.current?.setContents(initialDecoded);
  }, [initialValue]);

  return (
    <div
      className="rich-editor"
      onKeyDown={e => {
        e.stopPropagation();
      }}
    >
      <Editor ref={quillRef} readOnly={readOnly} onTextChange={handleTextChange} />
    </div>
  );
}

type DisplayProps = {
  value: string;
};

export function RichTextDisplay({ value }: DisplayProps) {
  const quillRef = useRef<Quill | null>(null);
  useEffect(() => {
    const delta = new Delta(JSON.parse(value));
    quillRef.current?.setContents(delta);
  }, [value]);

  return (
    <div className="rich-display">
      <Editor ref={quillRef} readOnly />
    </div>
  );
}

// Define the types for the props
type EditorProps = {
  readOnly?: boolean;
  defaultValue?: Delta; // You can replace `any` with a more specific type if you know the structure of the default value
  onTextChange?: (delta: Delta, oldDelta: Delta, source: string) => void;
  onSelectionChange?: (
    range: Range | null,
    oldRange: Range | null,
    source: 'user' | 'api' | 'silent'
  ) => void;
};

// Editor is an uncontrolled React component
const Editor = forwardRef<Quill | null, EditorProps>(
  ({ readOnly, defaultValue, onTextChange, onSelectionChange }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });

    useEffect(() => {
      if (ref && typeof ref === 'object' && ref.current && defaultValue && readOnly) {
        ref.current.setContents(defaultValue);
      }
    }, [defaultValue, ref, readOnly]);

    useEffect(() => {
      if (ref && typeof ref === 'object' && ref.current) {
        ref.current.enable(!readOnly);
      }
    }, [ref, readOnly]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const editorContainer = container.appendChild(container.ownerDocument.createElement('div'));

      const params: QuillOptions = {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ align: [] }, { list: 'ordered' }, { list: 'bullet' }],
            ['link'],
            ['clean'],
          ],
        },
      };
      if (readOnly) {
        params['readOnly'] = true;
        params['modules'] = {
          toolbar: false,
        };
      }

      const quill = new Quill(editorContainer, params);

      if (ref && typeof ref === 'object') {
        ref.current = quill;
      }

      if (defaultValueRef.current) {
        quill.setContents(defaultValueRef.current);
      }

      quill.on(Quill.events.TEXT_CHANGE, (...args) => {
        onTextChangeRef.current?.(...args);
      });

      quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
        onSelectionChangeRef.current?.(...args);
      });

      return () => {
        if (ref && typeof ref === 'object') {
          ref.current = null;
        }
        container.innerHTML = '';
      };
    }, [ref, readOnly]);

    return <div className={`${readOnly ? 'read-only' : ''}`} ref={containerRef} />;
  }
);

Editor.displayName = 'Editor';

type DiffProps = {
  oldContent: string;
  newContent: string;
};

export function RichTextDiff({ oldContent, newContent }: DiffProps) {
  const quillRef = useRef<Quill | null>(null);
  const diff = getLineDiffHighlight(oldContent, newContent);
  useEffect(() => {
    const diff2 = getLineDiffHighlight(oldContent, newContent);
    quillRef.current?.setContents(diff2);
  }, [oldContent, newContent]);

  if (diff.ops.length === 0) {
    return <div>Изменения стиля</div>;
  }
  return (
    <div className="rich-diff">
      <Editor ref={quillRef} readOnly />
    </div>
  );
}

// Helper to split Delta into text lines
function deltaToLines(delta: Delta): string[] {
  const text =
    delta.ops?.map(op => (typeof op.insert === 'string' ? op.insert : '')).join('') || '';
  return text.split('\n').map((line, i, arr) => (i < arr.length - 1 ? line + '\n' : line));
}

// Helper function to split a line into words, preserving whitespace
function tokenizeWords(line: string): string[] {
  return line.match(/\S+|\s+/g) || [];
}

// Function to get highlighted differences between two lines
function getHighlightedLines(oldLine: string, newLine: string): [Delta, Delta] {
  const oldTokens = tokenizeWords(oldLine);
  const newTokens = tokenizeWords(newLine);

  const oldDelta = new Delta();
  const newDelta = new Delta();

  const maxLength = Math.max(oldTokens.length, newTokens.length);

  for (let i = 0; i < maxLength; i++) {
    const oldToken = oldTokens[i] || '';
    const newToken = newTokens[i] || '';

    if (oldToken === newToken) {
      oldDelta.insert(oldToken);
      newDelta.insert(newToken);
    } else {
      if (oldToken) {
        oldDelta.insert(oldToken, { color: '#FF453A' });
      }
      if (newToken) {
        newDelta.insert(newToken, { color: '#30D158' });
      }
    }
  }

  if (oldDelta.ops.length > 0) {
    oldDelta.ops.unshift({ insert: '-\t' });
  }
  if (newDelta.ops.length > 0) {
    newDelta.ops.unshift({ insert: '+\t' });
  }

  return [oldDelta, newDelta];
}

// Build diff-highlight Delta showing changed lines with inline highlights
function getLineDiffHighlight(oldJson: string, newJson: string): Delta {
  const oldLines = deltaToLines(new Delta(JSON.parse(oldJson)));
  const newLines = deltaToLines(new Delta(JSON.parse(newJson)));

  // console.log('old delta', oldLines);
  // console.log('new delta', newLines);

  const result = new Delta();
  const maxLen = Math.max(oldLines.length, newLines.length);

  let lastCommonLine: string | null = null;

  let oldLinesIndex = 0;
  let newLinesIndex = 0;

  for (let i = 0; i < maxLen; i++) {
    const oldLine = (oldLines[oldLinesIndex] || '').trim();
    const newLine = (newLines[newLinesIndex] || '').trim();

    oldLinesIndex++;
    newLinesIndex++;

    if (oldLine === newLine && oldLine !== '') {
      lastCommonLine = oldLine;
    }

    if (oldLine !== newLine) {
      let state: 'diff' | 'added' | 'removed' = 'diff';

      if (newLine !== '' && state === 'diff') {
        const newLineFoundLater = findStartingAt(
          oldLines,
          l => l.trim() === newLine,
          oldLinesIndex
        );
        if (newLineFoundLater) {
          // line removed
          state = 'removed';
          newLinesIndex--;
        }
      }

      if (oldLine !== '' && state === 'diff') {
        const oldLineFoundLater = findStartingAt(
          newLines,
          l => l.trim() === oldLine,
          newLinesIndex
        );
        console.log('trying to add', Boolean(oldLineFoundLater), oldLine);
        if (oldLineFoundLater) {
          // line added
          state = 'added';
          oldLinesIndex--;
        }
      }

      // console.log({ oldLinesIndex, newLinesIndex, i, oldLine, newLine, state });

      if (state === 'added' && newLine === '') {
        continue;
      }
      if (state === 'removed' && oldLine === '') {
        continue;
      }

      if (result.ops.length > 0) {
        result.ops.push({ insert: '\n' });
      }

      if (lastCommonLine) {
        result.ops.push({ insert: lastCommonLine });
        result.ops.push({ insert: '\n' });
      }

      // console.log('diff found', { oldLine, newLine, state });

      if (state === 'added') {
        result.ops.push({ insert: newLine, attributes: { color: '#30D158' } });
      } else if (state === 'removed') {
        result.ops.push({ insert: oldLine, attributes: { color: '#FF453A' } });
      } else {
        // diff
        const deltas = getHighlightedLines(oldLine, newLine);
        result.ops.push(...deltas[0].ops);
        result.ops.push({ insert: '\n' });
        result.ops.push(...deltas[1].ops);
      }
      result.ops.push({ insert: '\n' });

      // const deltas = getHighlightedLines(oldLine, newLine);

      // if (deltas[0].ops.length > 0) {
      //   result.ops.push(...deltas[0].ops);
      //   result.ops.push({ insert: '\n' });
      // }
      // if (deltas[1].ops.length > 0) {
      //   result.ops.push(...deltas[1].ops);
      //   result.ops.push({ insert: '\n' });
      // }
    }
  }

  return result;
}

function diffToReadable(diff: Delta): string[] {
  const result = [];
  const currentItem = [];
  for (const op of diff.ops) {
    if (typeof op.insert === 'string') {
      if (op.insert.endsWith('\n')) {
        currentItem.push(op.insert.slice(0, -1)); // Remove trailing newline
        result.push(currentItem.join(''));
        currentItem.length = 0; // Reset current item
      } else {
        currentItem.push(op.insert);
      }
    }
  }
  if (currentItem.length > 0) {
    result.push(currentItem.join('')); // Add any remaining text
  }
  return result;
}

function getDeltaLines(input: string) {
  return deltaToLines(new Delta(JSON.parse(input)));
}

// @ts-expect-error debugging
window.deltaToLines = deltaToLines;
// @ts-expect-error debugging
window.getHighlightedLines = getHighlightedLines;
// @ts-expect-error debugging
window.getLineDiffHighlight = getLineDiffHighlight;
// @ts-expect-error debugging
window.diffToReadable = diffToReadable;
// @ts-expect-error debugging
window.getDeltaLines = getDeltaLines;

function findStartingAt<T>(
  array: readonly T[],
  predicate: (value: T, index: number, array: readonly T[]) => boolean,
  afterIndex: number
): T | undefined {
  const len = array.length;
  if (len === 0) return undefined;

  if (afterIndex < 0 || afterIndex >= len) {
    return undefined;
  }

  for (let i = afterIndex; i < len; i++) {
    const val = array[i];
    if (predicate(val, i, array)) {
      return val;
    }
  }
  return undefined;
}
