import type { GraphicsObject } from "graphics-debug"
import { InteractiveGraphics } from "graphics-debug/react"
import Prism from "prismjs"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Editor from "react-simple-code-editor"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-typescript"
import { transform } from "sucrase"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  MenuContent,
  MenuItem,
} from "@/components/ui/dropdown-menu"
import { constraints, Sketch, shapes } from "../../src/index"

interface Example {
  name: string
  slug: string
  code: string
}

const examples: Example[] = [
  {
    name: "Rectangle",
    slug: "rectangle",
    code: `import { shapes, constraints, Sketch } from "@basefold/sketch"

const sketch = new Sketch()
const r1 = new shapes.Rectangle({
    name: "R1",
    x: 40,
    y: 20,
    width: 150,
    height: 120,
  })
const r2 = new shapes.Rectangle({
    name: "R2",
    y: 20,
    width: 90,
    height: 120,
  })

sketch.add(r1)
sketch.add(r2)
sketch.add(new constraints.SpaceBetweenEdges({ edge1: "R1.rightEdge", edge2: "R2.leftEdge", distance: 40 }))`,
  },
  {
    name: "Circle",
    slug: "circle",
    code: `import { shapes, constraints, Sketch } from "@basefold/sketch"

const sketch = new Sketch()
const axis = new shapes.Axis({
     name: "Axis",
    origin: { x: 120, y: 90 },
    direction: "x+",
   })
const wheel = new shapes.Circle({
    name: "Wheel",
    cx: 120,
    cy: 90,
    radius: 45,
  })

sketch.add(axis)
sketch.add(wheel)
sketch.add(new constraints.Tangent({ line: "Axis", circle: "Wheel" }))`,
  },
  {
    name: "Right Triangle + Anchor",
    slug: "right-triangle-anchor",
    code: `import { shapes, constraints, Sketch } from "@basefold/sketch"

const sketch = new Sketch()
const tri = new shapes.RightTriangle({
    name: "Tri",
    baseLength: 170,
    altitudeLength: 120,
  })

sketch.add(tri)
sketch.add(new constraints.FixedPoint({ point: "Tri.pointAB", x: 20, y: 20 }))`,
  },
]

const defaultExample = examples[0]

const findExampleBySlug = (slug: string | null): Example | undefined => {
  if (!slug) {
    return undefined
  }

  return examples.find((example) => example.slug === slug)
}

const getExampleFromUrl = (): Example | undefined => {
  const params = new URLSearchParams(window.location.search)
  return findExampleBySlug(params.get("example"))
}

const updateUrlForExample = (example: Example): void => {
  const url = new URL(window.location.href)
  url.searchParams.set("example", example.slug)
  window.history.replaceState(
    null,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  )
}

const highlightCode = (input: string): string => {
  return Prism.highlight(input, Prism.languages.typescript, "typescript")
}

type SketchApi = {
  Sketch: typeof Sketch
  shapes: typeof shapes
  constraints: typeof constraints
}

type CompletionItem = {
  label: string
  detail: string
  insertText: string
}

type CompletionState = {
  replaceStart: number
  items: CompletionItem[]
}

type CompletionPosition = {
  top: number
  left: number
}

const editorTextareaId = "sketch-code-editor"

const shapeCompletions: CompletionItem[] = Object.keys(shapes)
  .sort((a, b) => a.localeCompare(b))
  .map((shapeName) => {
    return {
      label: shapeName,
      detail: "Shape",
      insertText: shapeName,
    }
  })

const constraintCompletions: CompletionItem[] = Object.keys(constraints)
  .sort((a, b) => a.localeCompare(b))
  .map((constraintName) => {
    return {
      label: constraintName,
      detail: "Constraint",
      insertText: constraintName,
    }
  })

const sketchCompletions: CompletionItem[] = [
  {
    label: "add",
    detail: "Sketch method",
    insertText: "add()",
  },
  {
    label: "solve",
    detail: "Sketch method",
    insertText: "solve()",
  },
  {
    label: "svg",
    detail: "Sketch method",
    insertText: "svg()",
  },
  {
    label: "graphicsObject",
    detail: "Sketch method",
    insertText: "graphicsObject()",
  },
]

const sourceCompletions: Record<string, CompletionItem[]> = {
  shapes: shapeCompletions,
  constraints: constraintCompletions,
  sketch: sketchCompletions,
}

const getCompletionState = (
  value: string,
  cursorOffset: number,
): CompletionState | null => {
  const lineEndIndex = value.indexOf("\n", cursorOffset)
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex
  const textAfterCursorOnLine = value.slice(cursorOffset, lineEnd)
  if (textAfterCursorOnLine.length > 0) {
    return null
  }

  const beforeCursor = value.slice(0, cursorOffset)
  const match = beforeCursor.match(
    /(?:^|[^\w$])(sketch|shapes|constraints)\.([\w$]*)$/,
  )
  if (!match) {
    return null
  }

  const target = match[1]
  const query = match[2]
  const list = sourceCompletions[target]
  if (!list) {
    return null
  }

  const loweredQuery = query.toLowerCase()
  const items = list
    .filter((item) => {
      return item.label.toLowerCase().startsWith(loweredQuery)
    })
    .slice(0, 8)

  if (items.length === 0) {
    return null
  }

  return {
    replaceStart: cursorOffset - query.length,
    items,
  }
}

const getCaretPosition = (
  textarea: HTMLTextAreaElement,
): CompletionPosition | null => {
  const selectionStart = textarea.selectionStart ?? 0
  const style = window.getComputedStyle(textarea)
  const mirror = document.createElement("div")

  mirror.style.position = "absolute"
  mirror.style.visibility = "hidden"
  mirror.style.whiteSpace = "pre-wrap"
  mirror.style.wordWrap = "break-word"
  mirror.style.overflow = "hidden"
  mirror.style.left = "-9999px"
  mirror.style.top = "0"
  mirror.style.font = style.font
  mirror.style.lineHeight = style.lineHeight
  mirror.style.letterSpacing = style.letterSpacing
  mirror.style.padding = style.padding
  mirror.style.border = style.border
  mirror.style.width = `${textarea.clientWidth}px`

  const textBeforeCaret = textarea.value.slice(0, selectionStart)
  const textAfterCaret = textarea.value.slice(selectionStart)
  mirror.textContent = textBeforeCaret

  const marker = document.createElement("span")
  marker.textContent = textAfterCaret.length > 0 ? textAfterCaret[0] : "\u200b"
  mirror.append(marker)
  document.body.append(mirror)

  const markerRect = marker.getBoundingClientRect()
  const mirrorRect = mirror.getBoundingClientRect()
  const top = markerRect.top - mirrorRect.top - textarea.scrollTop
  const left = markerRect.left - mirrorRect.left - textarea.scrollLeft

  mirror.remove()

  return {
    top,
    left,
  }
}

const runtimeApi: SketchApi = {
  Sketch,
  shapes,
  constraints,
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

async function executeCode(code: string): Promise<GraphicsObject> {
  const runtimeCode = code.replace(
    /^\s*import\s*\{\s*shapes\s*,\s*constraints\s*,\s*Sketch\s*\}\s*from\s*["']@basefold\/sketch["']\s*;?\s*$/m,
    "",
  )
  const stripped = transform(runtimeCode, { transforms: ["typescript"] }).code
  const runner = new Function(
    "api",
    `"use strict";
return (async () => {
  const { Sketch, shapes, constraints } = api;
  ${stripped}

  if (typeof sketch === "undefined") {
    throw new Error("Define a top-level 'sketch' variable.");
  }

  if (!(sketch instanceof Sketch)) {
    throw new Error("'sketch' must be an instance of Sketch.");
  }

  await sketch.solve();
  return sketch.graphicsObject();
})();`,
  ) as (api: SketchApi) => Promise<unknown>

  const value = await Promise.resolve(runner(runtimeApi))

  if (!value || typeof value !== "object") {
    throw new Error("The executed code must produce a Sketch graphics object")
  }

  return value as GraphicsObject
}

export function App() {
  const [code, setCode] = useState<string>(() => {
    return getExampleFromUrl()?.code ?? defaultExample.code
  })
  const [graphicsKey, setGraphicsKey] = useState<number>(0)
  const [graphics, setGraphics] = useState<GraphicsObject | null>(null)
  const [error, setError] = useState<string>("")
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [completionState, setCompletionState] =
    useState<CompletionState | null>(null)
  const [activeCompletionIndex, setActiveCompletionIndex] = useState<number>(0)
  const [completionPosition, setCompletionPosition] =
    useState<CompletionPosition | null>(null)
  const editorBodyRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const updateCompletionState = useCallback(
    (
      nextCode: string,
      options?: {
        preserveActiveIndex?: boolean
      },
    ): void => {
      const textarea = textareaRef.current
      if (!(textarea instanceof HTMLTextAreaElement)) {
        setCompletionState(null)
        setCompletionPosition(null)
        return
      }

      const offset = textarea.selectionStart ?? 0
      const nextCompletionState = getCompletionState(nextCode, offset)
      setCompletionState(nextCompletionState)
      setActiveCompletionIndex((prev) => {
        if (!nextCompletionState) {
          return 0
        }

        if (options?.preserveActiveIndex) {
          return Math.min(prev, nextCompletionState.items.length - 1)
        }

        return 0
      })

      if (!nextCompletionState) {
        setCompletionPosition(null)
        return
      }

      const nextPosition = getCaretPosition(textarea)
      setCompletionPosition(nextPosition)
    },
    [],
  )

  const applyCompletion = useCallback(
    (item: CompletionItem): void => {
      if (!completionState) {
        return
      }

      const textarea = textareaRef.current
      if (!(textarea instanceof HTMLTextAreaElement)) {
        return
      }

      const cursorOffset = textarea.selectionStart ?? 0
      const nextCode =
        code.slice(0, completionState.replaceStart) +
        item.insertText +
        code.slice(cursorOffset)
      const nextCursorOffset =
        completionState.replaceStart + item.insertText.length

      setCode(nextCode)
      setCompletionState(null)
      setCompletionPosition(null)
      setActiveCompletionIndex(0)

      window.requestAnimationFrame(() => {
        textarea.focus()
        textarea.selectionStart = nextCursorOffset
        textarea.selectionEnd = nextCursorOffset
      })
    },
    [code, completionState],
  )

  const runCode = useCallback(async () => {
    setIsRunning(true)
    setError("")

    try {
      const nextGraphics = await executeCode(code)
      setGraphics(nextGraphics)
    } catch (runError) {
      setGraphics(null)
      setError(formatError(runError))
    } finally {
      setIsRunning(false)
    }
  }, [code])

  useEffect(() => {
    const initialExample = getExampleFromUrl() ?? defaultExample
    updateUrlForExample(initialExample)
  }, [])

  useEffect(() => {
    const onPopState = (): void => {
      const nextExample = getExampleFromUrl() ?? defaultExample
      setCode(nextExample.code)
      setGraphicsKey((prev) => prev + 1)
    }

    window.addEventListener("popstate", onPopState)

    return () => {
      window.removeEventListener("popstate", onPopState)
    }
  }, [])

  useEffect(() => {
    runCode().catch(() => {
      setError("Unable to run initial example")
      setIsRunning(false)
    })
  }, [runCode])

  const exampleItems = useMemo(() => examples, [])

  const completionItems = completionState?.items ?? []
  const hasCompletions = completionItems.length > 0
  const popoverStyle = useMemo(() => {
    if (!completionPosition || !editorBodyRef.current || !textareaRef.current) {
      return undefined
    }

    const editorRect = editorBodyRef.current.getBoundingClientRect()
    const textareaRect = textareaRef.current.getBoundingClientRect()
    const left = textareaRect.left - editorRect.left + completionPosition.left
    const top = textareaRect.top - editorRect.top + completionPosition.top + 24

    return {
      left: Math.max(10, left),
      top: Math.max(10, top),
    }
  }, [completionPosition])

  return (
    <div className="page-shell">
      <header className="top-nav">
        <div className="top-nav-left">
          <strong className="brand">basefold sketch lab</strong>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="secondary">
                Examples
              </Button>
            </DropdownMenuTrigger>
            <MenuContent align="start">
              {exampleItems.map((example) => {
                return (
                  <MenuItem
                    key={example.name}
                    onSelect={() => {
                      setCode(example.code)
                      updateUrlForExample(example)
                      setGraphicsKey((prev) => prev + 1)
                    }}
                  >
                    {example.name}
                  </MenuItem>
                )
              })}
            </MenuContent>
          </DropdownMenu>
        </div>

        <Button disabled={isRunning} onClick={runCode}>
          {isRunning ? "Running..." : "Run"}
        </Button>
      </header>

      <main className="workspace-grid">
        <section className="panel editor-panel">
          <p className="panel-title">Code</p>
          <div className="editor-body" ref={editorBodyRef}>
            <Editor
              className="code-editor"
              highlight={highlightCode}
              onValueChange={(nextCode) => {
                setCode(nextCode)
                updateCompletionState(nextCode)
              }}
              onClick={() => {
                textareaRef.current = document.getElementById(
                  editorTextareaId,
                ) as HTMLTextAreaElement | null
                updateCompletionState(code)
              }}
              onFocus={() => {
                textareaRef.current = document.getElementById(
                  editorTextareaId,
                ) as HTMLTextAreaElement | null
                updateCompletionState(code)
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setCompletionState(null)
                  setCompletionPosition(null)
                  return
                }

                if (event.key === " " && event.ctrlKey) {
                  event.preventDefault()
                  updateCompletionState(code)
                  return
                }

                if (!hasCompletions) {
                  return
                }

                if (event.key === "ArrowDown") {
                  event.preventDefault()
                  setActiveCompletionIndex((prev) => {
                    return (prev + 1) % completionItems.length
                  })
                  return
                }

                if (event.key === "ArrowUp") {
                  event.preventDefault()
                  setActiveCompletionIndex((prev) => {
                    return (
                      (prev - 1 + completionItems.length) %
                      completionItems.length
                    )
                  })
                  return
                }

                if (event.key === "Enter" || event.key === "Tab") {
                  event.preventDefault()
                  const selected = completionItems[activeCompletionIndex]
                  if (selected) {
                    applyCompletion(selected)
                  }
                }
              }}
              onKeyUp={(event) => {
                if (
                  event.key === "ArrowDown" ||
                  event.key === "ArrowUp" ||
                  event.key === "Enter" ||
                  event.key === "Tab" ||
                  event.key === "Escape"
                ) {
                  return
                }

                if (event.target instanceof HTMLTextAreaElement) {
                  textareaRef.current = event.target
                  updateCompletionState(event.target.value, {
                    preserveActiveIndex: true,
                  })
                  return
                }

                updateCompletionState(code, {
                  preserveActiveIndex: true,
                })
              }}
              padding={18}
              textareaClassName="code-editor-input"
              textareaId={editorTextareaId}
              value={code}
            />
            {hasCompletions ? (
              <div
                className="autocomplete-popover"
                role="listbox"
                style={popoverStyle}
              >
                {completionItems.map((item, index) => {
                  const isActive = index === activeCompletionIndex
                  return (
                    <div
                      aria-selected={isActive}
                      className={`autocomplete-item${isActive ? " active" : ""}`}
                      key={`${item.detail}-${item.label}`}
                      onMouseDown={(event) => {
                        event.preventDefault()
                        applyCompletion(item)
                      }}
                      role="option"
                    >
                      <span>{item.label}</span>
                      <small>{item.detail}</small>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        </section>

        <section className="panel preview-panel">
          <p className="panel-title">Preview</p>
          {error ? (
            <pre className="error-box">{error}</pre>
          ) : graphics ? (
            <div className="graphics-stage">
              <InteractiveGraphics
                key={graphicsKey}
                graphics={graphics}
                height={560}
              />
            </div>
          ) : (
            <div className="graphics-stage" />
          )}
        </section>
      </main>

      <footer className="page-footer">
        <a href="https://github.com/tscircuit/basefold-sketch">GitHub</a>
        <span aria-hidden>&middot;</span>
        <a href="https://tscircuit.com">tscircuit</a>
      </footer>
    </div>
  )
}
