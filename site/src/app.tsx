import type { GraphicsObject } from "graphics-debug"
import { InteractiveGraphics } from "graphics-debug/react"
import Prism from "prismjs"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Editor from "react-simple-code-editor"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-typescript"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  MenuContent,
  MenuItem,
} from "@/components/ui/dropdown-menu"
import { constraints, shapes } from "../../src/index"
import {
  type CompletionItem,
  type CompletionPosition,
  type CompletionState,
  type ConstructorHint,
  createSourceCompletions,
  editorTextareaId,
  getCaretPosition,
  getCompletionState,
  getConstructorHintState,
} from "./lib/playground/editor-assist"
import {
  defaultExample,
  examples,
  getExampleFromUrl,
  updateUrlForExample,
} from "./lib/playground/examples"
import { executeCode, formatError } from "./lib/playground/runtime"

const highlightCode = (input: string): string => {
  return Prism.highlight(input, Prism.languages.typescript, "typescript")
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
  const [constructorHint, setConstructorHint] =
    useState<ConstructorHint | null>(null)
  const editorBodyRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const sourceCompletions = useMemo(() => {
    return createSourceCompletions(
      Object.keys(shapes),
      Object.keys(constraints),
    )
  }, [])

  const updateEditorAssist = useCallback(
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
        setConstructorHint(null)
        return
      }

      const offset = textarea.selectionStart ?? 0
      const nextCompletionState = getCompletionState(
        nextCode,
        offset,
        sourceCompletions,
      )

      setCompletionState(nextCompletionState)
      setConstructorHint(getConstructorHintState(nextCode, offset))
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
    [sourceCompletions],
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
        setConstructorHint(getConstructorHintState(nextCode, nextCursorOffset))
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
      setCompletionState(null)
      setCompletionPosition(null)
      setConstructorHint(null)
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
              {examples.map((example) => {
                return (
                  <MenuItem
                    key={example.name}
                    onSelect={() => {
                      setCode(example.code)
                      updateUrlForExample(example)
                      setGraphicsKey((prev) => prev + 1)
                      setCompletionState(null)
                      setCompletionPosition(null)
                      setConstructorHint(null)
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
                updateEditorAssist(nextCode)
              }}
              onClick={() => {
                textareaRef.current = document.getElementById(
                  editorTextareaId,
                ) as HTMLTextAreaElement | null
                updateEditorAssist(code)
              }}
              onFocus={() => {
                textareaRef.current = document.getElementById(
                  editorTextareaId,
                ) as HTMLTextAreaElement | null
                updateEditorAssist(code)
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setCompletionState(null)
                  setCompletionPosition(null)
                  return
                }

                if (event.key === " " && event.ctrlKey) {
                  event.preventDefault()
                  updateEditorAssist(code)
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
                  updateEditorAssist(event.target.value, {
                    preserveActiveIndex: true,
                  })
                  return
                }

                updateEditorAssist(code, {
                  preserveActiveIndex: true,
                })
              }}
              padding={18}
              textareaClassName="code-editor-input"
              textareaId={editorTextareaId}
              value={code}
            />
            {constructorHint ? (
              <div className="signature-hint" role="status">
                <strong>
                  {constructorHint.namespace}.{constructorHint.name}
                </strong>
                <div className="signature-params">
                  {constructorHint.parameters.map((parameter) => {
                    const isActive =
                      parameter.name === constructorHint.activeParameterName
                    return (
                      <code
                        className={`signature-param${isActive ? " active" : ""}`}
                        key={parameter.name}
                      >
                        {parameter.name}
                        {parameter.required ? "" : "?"}: {parameter.typeLabel}
                      </code>
                    )
                  })}
                </div>
              </div>
            ) : null}
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
          <div className="graphics-stage">
            {graphics ? (
              <InteractiveGraphics
                key={graphicsKey}
                graphics={graphics}
                height={560}
              />
            ) : null}
            {error ? <pre className="error-box">{error}</pre> : null}
          </div>
        </section>
      </main>

      <footer className="page-footer">
        <a href="https://github.com/tscircuit/basefold-sketch">GitHub</a>
        <span aria-hidden>&middot;</span>
        <a href="https://basefold.com">basefold</a>
        <span aria-hidden>&middot;</span>
        <a href="https://tscircuit.com">tscircuit</a>
      </footer>
    </div>
  )
}
