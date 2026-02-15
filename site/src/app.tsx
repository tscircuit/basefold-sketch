import type { GraphicsObject } from "graphics-debug"
import { InteractiveGraphics } from "graphics-debug/react"
import Prism from "prismjs"
import { useCallback, useEffect, useMemo, useState } from "react"
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
  code: string
}

const examples: Example[] = [
  {
    name: "Rectangle",
    code: `const sketch = new Sketch()
const frame = new shapes.Rectangle({
    name: "Frame",
    x: 40,
    y: 20,
    width: 190,
    height: 120,
  })

sketch.add(frame)`,
  },
  {
    name: "Line + Circle",
    code: `const sketch = new Sketch()
const axis = new shapes.Line({
    name: "Axis",
    x1: 20,
    y1: 90,
    x2: 220,
    y2: 90,
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
    code: `const sketch = new Sketch()
const tri = new shapes.RightTriangle({
    name: "Tri",
    baseLength: 170,
    altitudeLength: 120,
  })

sketch.add(tri)
sketch.add(new constraints.FixedPoint({ point: "Tri.pointAB", x: 20, y: 20 }))`,
  },
]

const starterCode = examples[0].code

const highlightCode = (input: string): string => {
  return Prism.highlight(input, Prism.languages.typescript, "typescript")
}

type SketchApi = {
  Sketch: typeof Sketch
  shapes: typeof shapes
  constraints: typeof constraints
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
  const stripped = transform(code, { transforms: ["typescript"] }).code
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
  const [code, setCode] = useState<string>(starterCode)
  const [graphics, setGraphics] = useState<GraphicsObject | null>(null)
  const [error, setError] = useState<string>("")
  const [isRunning, setIsRunning] = useState<boolean>(false)

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
    runCode().catch(() => {
      setError("Unable to run initial example")
      setIsRunning(false)
    })
  }, [runCode])

  const exampleItems = useMemo(() => examples, [])

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
          <Editor
            className="code-editor"
            highlight={highlightCode}
            onValueChange={setCode}
            padding={18}
            textareaClassName="code-editor-input"
            value={code}
          />
        </section>

        <section className="panel preview-panel">
          <p className="panel-title">Preview</p>
          {error ? (
            <pre className="error-box">{error}</pre>
          ) : graphics ? (
            <div className="graphics-stage">
              <InteractiveGraphics graphics={graphics} height={560} />
            </div>
          ) : (
            <div className="graphics-stage" />
          )}
        </section>
      </main>
    </div>
  )
}
