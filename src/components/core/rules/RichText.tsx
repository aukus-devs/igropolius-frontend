import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import Quill, { Delta, QuillOptions, Range } from "quill";

import "quill/dist/quill.snow.css";

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
      : new Delta().insert("Начни редактировать");
    quillRef.current?.setContents(initialDecoded);
  }, [initialValue]);

  return (
    <div
      className="rich-editor"
      onKeyDown={(e) => {
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
    <div
      className="rich-display"
      style={{
        // backgroundColor: "darkgrey",
        borderRadius: "15px",
      }}
    >
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
    source: "user" | "api" | "silent",
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
      if (ref && typeof ref === "object" && ref.current && defaultValue && readOnly) {
        ref.current.setContents(defaultValue);
      }
    }, [defaultValue, ref, readOnly]);

    useEffect(() => {
      if (ref && typeof ref === "object" && ref.current) {
        ref.current.enable(!readOnly);
      }
    }, [ref, readOnly]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const editorContainer = container.appendChild(
        container.ownerDocument.createElement("div"),
      );

      const params: QuillOptions = {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            ["blockquote", "code-block"],
            [{ align: [] }, { list: "ordered" }, { list: "bullet" }],
            ["link"],
            ["clean"],
          ],
        },
      };
      if (readOnly) {
        params["readOnly"] = true;
        params["modules"] = {
          toolbar: false,
        };
      }

      const quill = new Quill(editorContainer, params);

      if (ref && typeof ref === "object") {
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
        if (ref && typeof ref === "object") {
          ref.current = null;
        }
        container.innerHTML = "";
      };
    }, [ref, readOnly]);

    return <div className={`rounded-2xl ${readOnly ? "read-only" : ""}`} ref={containerRef} />;
  },
);

Editor.displayName = "Editor";

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
  return <Editor ref={quillRef} readOnly />;
}

// Helper to split Delta into text lines
function deltaToLines(delta: Delta): string[] {
  const text =
    delta.ops?.map((op) => (typeof op.insert === "string" ? op.insert : "")).join("") || "";
  return text.split("\n").map((line, i, arr) => (i < arr.length - 1 ? line + "\n" : line));
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
    const oldToken = oldTokens[i] || "";
    const newToken = newTokens[i] || "";

    if (oldToken === newToken) {
      oldDelta.insert(oldToken);
      newDelta.insert(newToken);
    } else {
      if (oldToken) {
        oldDelta.insert(oldToken, { color: "salmon" });
      }
      if (newToken) {
        newDelta.insert(newToken, { color: "lightgreen" });
      }
    }
  }

  if (oldDelta.ops.length > 0) {
    oldDelta.ops.unshift({ insert: "-\t" });
  }
  if (newDelta.ops.length > 0) {
    newDelta.ops.unshift({ insert: "+\t" });
  }

  return [oldDelta, newDelta];
}

// Build diff-highlight Delta showing changed lines with inline highlights
function getLineDiffHighlight(oldJson: string, newJson: string): Delta {
  const oldLines = deltaToLines(new Delta(JSON.parse(oldJson)));
  const newLines = deltaToLines(new Delta(JSON.parse(newJson)));

  const result = new Delta();
  const maxLen = Math.max(oldLines.length, newLines.length);

  let lastCommonLine: string | null = null;

  for (let i = 0; i < maxLen; i++) {
    const oldLine = (oldLines[i] || "").trim();
    const newLine = (newLines[i] || "").trim();

    if (oldLine === newLine && oldLine !== "") {
      lastCommonLine = oldLine;
    }

    if (oldLine !== newLine) {
      if (lastCommonLine) {
        result.ops.push({ insert: lastCommonLine });
        result.ops.push({ insert: "\n" });
      }

      const deltas = getHighlightedLines(oldLine, newLine);
      if (deltas[0].ops.length > 0) {
        result.ops.push(...deltas[0].ops);
        result.ops.push({ insert: "\n" });
      }
      if (deltas[1].ops.length > 0) {
        result.ops.push(...deltas[1].ops);
        result.ops.push({ insert: "\n" });
      }
      result.ops.push({ insert: "\n" });
    }
  }

  return result;
}
