import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Quill, { Delta, QuillOptions, Range } from 'quill';
import { LoaderCircleIcon } from 'lucide-react';

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

  useEffect(() => {
    const diffResult = getQuillDiff(oldContent, newContent);
    quillRef.current?.setContents(diffResult);
  }, [oldContent, newContent]);

  return (
    <div className="rich-diff">
      <Editor ref={quillRef} readOnly />
    </div>
  );
}

export function LazyRichTextDiff({ oldContent, newContent }: DiffProps) {
  const quillRef = useRef<Quill | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [diffCalculated, setDiffCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const calculationStartedRef = useRef(false);
  const contentKeyRef = useRef(oldContent + newContent);

  if (contentKeyRef.current !== oldContent + newContent) {
    contentKeyRef.current = oldContent + newContent;
    calculationStartedRef.current = false;
    setDiffCalculated(false);
    setIsCalculating(false);
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !diffCalculated && !calculationStartedRef.current) {
          calculationStartedRef.current = true;
          setIsCalculating(true);

          const calculateDiff = () => {
            setTimeout(() => {
              try {
                const diffResult = getQuillDiff(oldContent, newContent);

                setTimeout(() => {
                  if (quillRef.current) {
                    quillRef.current.setContents(diffResult);
                  }
                  setIsCalculating(false);
                  setDiffCalculated(true);
                }, 200);
              } catch (error) {
                console.error('LazyRichTextDiff: Error calculating diff:', error);
                if (quillRef.current) {
                  quillRef.current.setContents(
                    new Delta().insert('Ошибка при вычислении изменений')
                  );
                }
                setIsCalculating(false);
                setDiffCalculated(true);
              }
            }, 100);
          };

          calculateDiff();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [oldContent, newContent, diffCalculated]);

  return (
    <div ref={containerRef} className="rich-diff relative">
      <Editor ref={quillRef} readOnly />
      {isCalculating && (
        <div className="absolute inset-0 flex justify-center items-center">
          <LoaderCircleIcon className="animate-spin text-primary" size={24} />
          <span className="ml-2 text-muted-foreground">Вычисляем изменения...</span>
        </div>
      )}
    </div>
  );
}

function getQuillDiff(oldJson: string, newJson: string): Delta {
  try {
    const oldContent = new Delta(JSON.parse(oldJson));
    const newContent = new Delta(JSON.parse(newJson));

    const oldLines = deltaToLines(oldContent);
    const newLines = deltaToLines(newContent);

    const diffResult = getLineDiff(oldLines, newLines);

    return diffResult;
  } catch (error) {
    console.error('Error processing diff:', error);
    return new Delta().insert('Ошибка при обработке изменений');
  }
}

function deltaToLines(delta: Delta): DeltaLine[] {
  const lines: DeltaLine[] = [];
  let currentLine = new Delta();

  for (const op of delta.ops || []) {
    if (typeof op.insert === 'string') {
      const text = op.insert;
      const parts = text.split('\n');

      for (let i = 0; i < parts.length; i++) {
        if (i > 0) {
          lines.push({
            delta: currentLine,
            text:
              currentLine.ops
                ?.map(op => (typeof op.insert === 'string' ? op.insert : ''))
                .join('') || '',
          });
          currentLine = new Delta();
        }

        if (parts[i]) {
          currentLine.insert(parts[i], op.attributes || {});
        }
      }
    } else {
      currentLine.insert(op.insert || '');
    }
  }

  if (currentLine.ops && currentLine.ops.length > 0) {
    lines.push({
      delta: currentLine,
      text: currentLine.ops.map(op => (typeof op.insert === 'string' ? op.insert : '')).join(''),
    });
  }

  return lines;
}

interface DeltaLine {
  delta: Delta;
  text: string;
}

function getWordLevelDiff(oldLine: DeltaLine, newLine: DeltaLine): Delta {
  const result = new Delta();

  const oldWords = getWordsWithFormatting(oldLine.delta);
  const newWords = getWordsWithFormatting(newLine.delta);

  const oldWordsText = oldWords.map(w => w.text);
  const newWordsText = newWords.map(w => w.text);

  let oldIndex = 0;
  let newIndex = 0;

  while (oldIndex < oldWords.length || newIndex < newWords.length) {
    const oldWord = oldWords[oldIndex];
    const newWord = newWords[newIndex];

    if (oldIndex >= oldWords.length) {
      result.insert(newWord.text, {
        ...newWord.attributes,
        color: '#30D158',
      });
      newIndex++;
    } else if (newIndex >= newWords.length) {
      result.insert(oldWord.text, {
        ...oldWord.attributes,
        color: '#FF453A',
        strike: true,
      });
      oldIndex++;
    } else if (oldWord.text === newWord.text) {
      result.insert(newWord.text, newWord.attributes);
      oldIndex++;
      newIndex++;
    } else {
      const oldWordInNew = newWordsText.indexOf(oldWord.text, newIndex);
      const newWordInOld = oldWordsText.indexOf(newWord.text, oldIndex);

      if (
        oldWordInNew !== -1 &&
        (newWordInOld === -1 || oldWordInNew - newIndex < newWordInOld - oldIndex)
      ) {
        result.insert(newWord.text, {
          ...newWord.attributes,
          color: '#30D158',
        });
        newIndex++;
      } else if (newWordInOld !== -1) {
        result.insert(oldWord.text, {
          ...oldWord.attributes,
          color: '#FF453A',
          strike: true,
        });
        oldIndex++;
      } else {
        result.insert(oldWord.text, {
          ...oldWord.attributes,
          color: '#FF453A',
          strike: true,
        });
        result.insert(newWord.text, {
          ...newWord.attributes,
          color: '#30D158',
        });
        oldIndex++;
        newIndex++;
      }
    }
  }

  return result;
}

function getWordsWithFormatting(delta: Delta): Array<{ text: string; attributes: any }> {
  const words: Array<{ text: string; attributes: any }> = [];

  for (const op of delta.ops || []) {
    if (typeof op.insert === 'string') {
      const text = op.insert;
      const tokens = text.match(/\S+|\s+/g) || [];

      tokens.forEach(token => {
        words.push({
          text: token,
          attributes: op.attributes || {},
        });
      });
    }
  }

  return words;
}

function getWordsHighlightedForRemoval(oldLine: DeltaLine, newLine: DeltaLine): Delta {
  const result = new Delta();

  const oldWords = getWordsWithFormatting(oldLine.delta);
  const newWords = getWordsWithFormatting(newLine.delta);

  const newWordsText = newWords.map(w => w.text);

  oldWords.forEach(oldWord => {
    if (newWordsText.includes(oldWord.text)) {
      result.insert(oldWord.text, oldWord.attributes);
    } else {
      result.insert(oldWord.text, {
        ...oldWord.attributes,
        color: '#FF453A',
      });
    }
  });

  return result;
}

function getWordsHighlightedForAddition(oldLine: DeltaLine, newLine: DeltaLine): Delta {
  const result = new Delta();

  const oldWords = getWordsWithFormatting(oldLine.delta);
  const newWords = getWordsWithFormatting(newLine.delta);

  const oldWordsText = oldWords.map(w => w.text);

  newWords.forEach(newWord => {
    if (oldWordsText.includes(newWord.text)) {
      result.insert(newWord.text, newWord.attributes);
    } else {
      result.insert(newWord.text, {
        ...newWord.attributes,
        color: '#30D158',
      });
    }
  });

  return result;
}

function getLineDiff(
  oldLines: DeltaLine[],
  newLines: DeltaLine[],
  contextLines: number = 2
): Delta {
  const result = new Delta();
  const changes: Array<{
    type: 'removed' | 'added' | 'modified' | 'context';
    line: DeltaLine;
    index: number;
    oldLine?: DeltaLine;
  }> = [];

  const maxLen = Math.max(oldLines.length, newLines.length);
  const changedIndices = new Set<number>();

  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (!oldLine && newLine) {
      changes.push({ type: 'added', line: newLine, index: i });
      changedIndices.add(i);
    } else if (oldLine && !newLine) {
      changes.push({ type: 'removed', line: oldLine, index: i });
      changedIndices.add(i);
    } else if (oldLine && newLine && oldLine.text !== newLine.text) {
      changes.push({ type: 'modified', line: newLine, index: i, oldLine });
      changedIndices.add(i);
    }
  }

  if (changes.length === 0) {
    return new Delta().insert('Нет изменений');
  }

  const contextIndices = new Set<number>();
  changedIndices.forEach(index => {
    for (
      let i = Math.max(0, index - contextLines);
      i <= Math.min(maxLen - 1, index + contextLines);
      i++
    ) {
      contextIndices.add(i);
    }
  });

  const groupedChanges = new Map<
    number,
    Array<{ type: 'removed' | 'added' | 'modified'; line: DeltaLine; oldLine?: DeltaLine }>
  >();
  changes.forEach(change => {
    if (!groupedChanges.has(change.index)) {
      groupedChanges.set(change.index, []);
    }
    groupedChanges.get(change.index)!.push({
      type: change.type as 'removed' | 'added' | 'modified',
      line: change.line,
      oldLine: change.oldLine,
    });
  });

  let isFirst = true;
  Array.from(contextIndices)
    .sort((a, b) => a - b)
    .forEach(index => {
      if (!isFirst) {
        result.insert('\n');
      }
      isFirst = false;

      if (groupedChanges.has(index)) {
        const indexChanges = groupedChanges.get(index)!;
        indexChanges.forEach((change, changeIndex) => {
          if (changeIndex > 0) {
            result.insert('\n');
          }

          if (change.type === 'removed') {
            result.insert('- ');
            change.line.delta.ops?.forEach(op => {
              if (typeof op.insert === 'string') {
                result.insert(op.insert, {
                  ...(op.attributes || {}),
                  color: '#FF453A',
                  strike: true,
                });
              } else {
                result.insert(op.insert || '');
              }
            });
          } else if (change.type === 'added') {
            result.insert('+ ');
            change.line.delta.ops?.forEach(op => {
              if (typeof op.insert === 'string') {
                result.insert(op.insert, {
                  ...(op.attributes || {}),
                  color: '#30D158',
                });
              } else {
                result.insert(op.insert || '');
              }
            });
          } else if (change.type === 'modified' && change.oldLine) {
            result.insert('- ');
            const oldWordsHighlighted = getWordsHighlightedForRemoval(change.oldLine, change.line);
            result.ops.push(...oldWordsHighlighted.ops);

            result.insert('\n');

            result.insert('+ ');
            const newWordsHighlighted = getWordsHighlightedForAddition(change.oldLine, change.line);
            result.ops.push(...newWordsHighlighted.ops);
          }
        });
      } else {
        const contextLine = oldLines[index] || newLines[index];
        if (contextLine) {
          result.insert('  ', { color: '#666666' });
          contextLine.delta.ops?.forEach(op => {
            result.insert(op.insert || '', { color: '#666666' });
          });
        }
      }
    });

  return result;
}

// @ts-expect-error debugging
window.getQuillDiff = getQuillDiff;
// @ts-expect-error debugging
window.deltaToLines = deltaToLines;
// @ts-expect-error debugging
window.getWordLevelDiff = getWordLevelDiff;
// @ts-expect-error debugging
window.getWordsWithFormatting = getWordsWithFormatting;
// @ts-expect-error debugging
window.getWordsHighlightedForRemoval = getWordsHighlightedForRemoval;
// @ts-expect-error debugging
window.getWordsHighlightedForAddition = getWordsHighlightedForAddition;
