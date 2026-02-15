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
    code: `async function run(api: any): Promise<string> {
  const sketch = new api.Sketch()
  const frame = new api.shapes.Rectangle({
    name: "Frame",
    x: 40,
    y: 20,
    width: 190,
    height: 120,
  })

  sketch.add(frame)
  await sketch.solve()
  return sketch.svg({ margin: 24 })
}`,
  },
  {
    name: "Line + Circle",
    code: `async function run(api: any): Promise<string> {
  const sketch = new api.Sketch()
  const axis = new api.shapes.Line({
    name: "Axis",
    x1: 20,
    y1: 90,
    x2: 220,
    y2: 90,
  })
  const wheel = new api.shapes.Circle({
    name: "Wheel",
    cx: 120,
    cy: 90,
    radius: 45,
  })

  sketch.add(axis)
  sketch.add(wheel)
  sketch.add(new api.constraints.Tangent({ line: "Axis", circle: "Wheel" }))

  await sketch.solve()
  return sketch.svg({ margin: 20 })
}`,
  },
  {
    name: "Right Triangle + Anchor",
    code: `async function run(api: any): Promise<string> {
  const sketch = new api.Sketch()
  const tri = new api.shapes.RightTriangle({
    name: "Tri",
    baseLength: 170,
    altitudeLength: 120,
  })

  sketch.add(tri)
  sketch.add(new api.constraints.FixedPoint({ point: "Tri.pointAB", x: 20, y: 20 }))
  await sketch.solve()
  return sketch.svg({ margin: 30 })
}`,
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

async function executeCode(code: string): Promise<string> {
  const stripped = transform(code, { transforms: ["typescript"] }).code
  const runner = new Function(
    "api",
    `"use strict";\n${stripped}\nif (typeof run === "function") return run(api);\nif (typeof render === "function") return render(api);\nif (typeof svg === "string") return svg;\nthrow new Error("Define run(api) and return an SVG string.")`,
  ) as (api: SketchApi) => unknown

  const value = await Promise.resolve(runner(runtimeApi))

  if (typeof value !== "string") {
    throw new Error("run(api) must return an SVG string")
  }

  if (!value.trim().startsWith("<svg")) {
    throw new Error("Returned value is not an SVG string")
  }

  return value
}

export function App() {
  const [code, setCode] = useState<string>(starterCode)
  const [svgMarkup, setSvgMarkup] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isRunning, setIsRunning] = useState<boolean>(false)

  const runCode = useCallback(async () => {
    setIsRunning(true)
    setError("")

    try {
      const nextSvg = await executeCode(code)
      setSvgMarkup(nextSvg)
    } catch (runError) {
      setSvgMarkup("")
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
          ) : (
            <div
              className="svg-stage"
              dangerouslySetInnerHTML={{ __html: svgMarkup }}
            />
          )}
        </section>
      </main>
    </div>
  )
}
