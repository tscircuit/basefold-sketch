export type CompletionItem = {
  label: string
  detail: string
  insertText: string
}

export type CompletionState = {
  replaceStart: number
  items: CompletionItem[]
}

export type CompletionPosition = {
  top: number
  left: number
}

export type ConstructorParameter = {
  name: string
  typeLabel: string
  required: boolean
}

export type ConstructorHint = {
  namespace: "constraints" | "shapes"
  name: string
  parameters: ReadonlyArray<ConstructorParameter>
  activeParameterName?: string
}

type ConstructorDefinition = Omit<ConstructorHint, "activeParameterName">

type CompletionTarget = "constraints" | "shapes" | "sketch"

export type SourceCompletions = Record<CompletionTarget, CompletionItem[]>

export const editorTextareaId = "sketch-code-editor"

export const sketchCompletions: CompletionItem[] = [
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

const constructorDefinitions: Record<string, ConstructorDefinition> = {
  "constraints.Coincident": {
    namespace: "constraints",
    name: "Coincident",
    parameters: [
      { name: "point1", typeLabel: "string", required: true },
      { name: "point2", typeLabel: "string", required: true },
    ],
  },
  "constraints.FixedPoint": {
    namespace: "constraints",
    name: "FixedPoint",
    parameters: [
      { name: "point", typeLabel: "string", required: true },
      { name: "x", typeLabel: "number", required: true },
      { name: "y", typeLabel: "number", required: true },
    ],
  },
  "constraints.FixedX": {
    namespace: "constraints",
    name: "FixedX",
    parameters: [
      { name: "point", typeLabel: "string", required: true },
      { name: "x", typeLabel: "number", required: true },
    ],
  },
  "constraints.FixedY": {
    namespace: "constraints",
    name: "FixedY",
    parameters: [
      { name: "point", typeLabel: "string", required: true },
      { name: "y", typeLabel: "number", required: true },
    ],
  },
  "constraints.Horizontal": {
    namespace: "constraints",
    name: "Horizontal",
    parameters: [{ name: "line", typeLabel: "string", required: true }],
  },
  "constraints.LineToLineDistance": {
    namespace: "constraints",
    name: "LineToLineDistance",
    parameters: [
      { name: "line1", typeLabel: "string", required: true },
      { name: "line2", typeLabel: "string", required: true },
      { name: "distance", typeLabel: "number", required: true },
    ],
  },
  "constraints.PerpendicularDistance": {
    namespace: "constraints",
    name: "PerpendicularDistance",
    parameters: [
      { name: "edge1", typeLabel: "string", required: true },
      { name: "edge2", typeLabel: "string", required: true },
      { name: "distance", typeLabel: "number", required: true },
    ],
  },
  "constraints.PointToPointDistance": {
    namespace: "constraints",
    name: "PointToPointDistance",
    parameters: [
      { name: "point1", typeLabel: "string", required: true },
      { name: "point2", typeLabel: "string", required: true },
      { name: "distance", typeLabel: "number", required: true },
    ],
  },
  "constraints.SpaceBetweenEdges": {
    namespace: "constraints",
    name: "SpaceBetweenEdges",
    parameters: [
      { name: "edge1", typeLabel: "string", required: true },
      { name: "edge2", typeLabel: "string", required: true },
      { name: "distance", typeLabel: "number", required: true },
    ],
  },
  "constraints.Tangent": {
    namespace: "constraints",
    name: "Tangent",
    parameters: [
      { name: "line", typeLabel: "string", required: true },
      { name: "circle", typeLabel: "string", required: true },
    ],
  },
  "constraints.Vertical": {
    namespace: "constraints",
    name: "Vertical",
    parameters: [{ name: "line", typeLabel: "string", required: true }],
  },
  "shapes.Axis": {
    namespace: "shapes",
    name: "Axis",
    parameters: [
      { name: "name", typeLabel: "string", required: false },
      {
        name: "origin",
        typeLabel: "{ x: number; y: number }",
        required: false,
      },
      {
        name: "direction",
        typeLabel: '"x+" | "x-" | "y+" | "y-" | { x: number; y: number }',
        required: true,
      },
    ],
  },
  "shapes.Circle": {
    namespace: "shapes",
    name: "Circle",
    parameters: [
      { name: "name", typeLabel: "string", required: true },
      { name: "cx", typeLabel: "number", required: false },
      { name: "cy", typeLabel: "number", required: false },
      { name: "radius", typeLabel: "number", required: false },
    ],
  },
  "shapes.InfiniteLine": {
    namespace: "shapes",
    name: "InfiniteLine",
    parameters: [
      { name: "name", typeLabel: "string", required: false },
      {
        name: "origin",
        typeLabel: "{ x: number; y: number }",
        required: false,
      },
      {
        name: "direction",
        typeLabel: '"x+" | "x-" | "y+" | "y-" | { x: number; y: number }',
        required: true,
      },
    ],
  },
  "shapes.Line": {
    namespace: "shapes",
    name: "Line",
    parameters: [
      { name: "name", typeLabel: "string", required: false },
      { name: "x1", typeLabel: "number", required: false },
      { name: "y1", typeLabel: "number", required: false },
      { name: "x2", typeLabel: "number", required: false },
      { name: "y2", typeLabel: "number", required: false },
      { name: "length", typeLabel: "number", required: false },
      { name: "horizontal", typeLabel: "boolean", required: false },
      { name: "vertical", typeLabel: "boolean", required: false },
    ],
  },
  "shapes.Oval": {
    namespace: "shapes",
    name: "Oval",
    parameters: [
      { name: "name", typeLabel: "string", required: true },
      { name: "cx", typeLabel: "number", required: false },
      { name: "cy", typeLabel: "number", required: false },
      { name: "rx", typeLabel: "number", required: false },
      { name: "ry", typeLabel: "number", required: false },
    ],
  },
  "shapes.Rectangle": {
    namespace: "shapes",
    name: "Rectangle",
    parameters: [
      { name: "name", typeLabel: "string", required: true },
      { name: "x", typeLabel: "number", required: false },
      { name: "y", typeLabel: "number", required: false },
      { name: "width", typeLabel: "number", required: false },
      { name: "height", typeLabel: "number", required: false },
    ],
  },
  "shapes.RightTriangle": {
    namespace: "shapes",
    name: "RightTriangle",
    parameters: [
      { name: "name", typeLabel: "string", required: true },
      { name: "baseLength", typeLabel: "number", required: false },
      { name: "altitudeLength", typeLabel: "number", required: false },
      { name: "hypotenuseLength", typeLabel: "number", required: false },
      { name: "aLength", typeLabel: "number", required: false },
      { name: "bLength", typeLabel: "number", required: false },
      { name: "cLength", typeLabel: "number", required: false },
      { name: "abLength", typeLabel: "number", required: false },
      { name: "acLength", typeLabel: "number", required: false },
      { name: "bcLength", typeLabel: "number", required: false },
    ],
  },
  "shapes.Trapezoid": {
    namespace: "shapes",
    name: "Trapezoid",
    parameters: [
      { name: "name", typeLabel: "string", required: true },
      { name: "shortBaseLength", typeLabel: "number", required: false },
      { name: "longBaseLength", typeLabel: "number", required: false },
      { name: "hasEqualLengthLegs", typeLabel: "true", required: false },
      {
        name: "longBaseOrientation",
        typeLabel: '"bottom" | "top" | "left" | "right" | "none"',
        required: false,
      },
    ],
  },
}

const constructorPattern =
  /new\s+(constraints|shapes)\.([A-Za-z_$][\w$]*)\s*\(\s*\{/g

export function createSourceCompletions(
  shapeNames: string[],
  constraintNames: string[],
): SourceCompletions {
  return {
    shapes: shapeNames
      .slice()
      .sort((a, b) => a.localeCompare(b))
      .map((shapeName) => {
        return {
          label: shapeName,
          detail: "Shape",
          insertText: shapeName,
        }
      }),
    constraints: constraintNames
      .slice()
      .sort((a, b) => a.localeCompare(b))
      .map((constraintName) => {
        return {
          label: constraintName,
          detail: "Constraint",
          insertText: constraintName,
        }
      }),
    sketch: sketchCompletions,
  }
}

export const getCompletionState = (
  value: string,
  cursorOffset: number,
  sourceCompletions: SourceCompletions,
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

  const target = match[1] as CompletionTarget
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

function getCurrentPropertyName(input: string): string | undefined {
  let depth = 1
  let inSingleQuote = false
  let inDoubleQuote = false
  let inTemplate = false
  let inLineComment = false
  let inBlockComment = false
  let escaped = false
  let lastCommaAtDepthOne = -1

  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    const nextChar = input[i + 1]

    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false
      }
      continue
    }

    if (inBlockComment) {
      if (char === "*" && nextChar === "/") {
        inBlockComment = false
        i += 1
      }
      continue
    }

    if (inSingleQuote || inDoubleQuote || inTemplate) {
      if (escaped) {
        escaped = false
        continue
      }

      if (char === "\\") {
        escaped = true
        continue
      }

      if (inSingleQuote && char === "'") {
        inSingleQuote = false
      } else if (inDoubleQuote && char === '"') {
        inDoubleQuote = false
      } else if (inTemplate && char === "`") {
        inTemplate = false
      }

      continue
    }

    if (char === "/" && nextChar === "/") {
      inLineComment = true
      i += 1
      continue
    }

    if (char === "/" && nextChar === "*") {
      inBlockComment = true
      i += 1
      continue
    }

    if (char === "'") {
      inSingleQuote = true
      continue
    }

    if (char === '"') {
      inDoubleQuote = true
      continue
    }

    if (char === "`") {
      inTemplate = true
      continue
    }

    if (char === "{") {
      depth += 1
      continue
    }

    if (char === "}") {
      depth -= 1
      if (depth <= 0) {
        return undefined
      }
      continue
    }

    if (char === "," && depth === 1) {
      lastCommaAtDepthOne = i
    }
  }

  const tail = input.slice(lastCommaAtDepthOne + 1)
  const keyMatch = tail.match(/^\s*([A-Za-z_$][\w$]*)\s*:/)
  return keyMatch?.[1]
}

function isUnclosedObjectLiteral(
  input: string,
  objectStartIndex: number,
): boolean {
  let depth = 0
  let inSingleQuote = false
  let inDoubleQuote = false
  let inTemplate = false
  let inLineComment = false
  let inBlockComment = false
  let escaped = false

  for (let i = objectStartIndex; i < input.length; i++) {
    const char = input[i]
    const nextChar = input[i + 1]

    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false
      }
      continue
    }

    if (inBlockComment) {
      if (char === "*" && nextChar === "/") {
        inBlockComment = false
        i += 1
      }
      continue
    }

    if (inSingleQuote || inDoubleQuote || inTemplate) {
      if (escaped) {
        escaped = false
        continue
      }

      if (char === "\\") {
        escaped = true
        continue
      }

      if (inSingleQuote && char === "'") {
        inSingleQuote = false
      } else if (inDoubleQuote && char === '"') {
        inDoubleQuote = false
      } else if (inTemplate && char === "`") {
        inTemplate = false
      }

      continue
    }

    if (char === "/" && nextChar === "/") {
      inLineComment = true
      i += 1
      continue
    }

    if (char === "/" && nextChar === "*") {
      inBlockComment = true
      i += 1
      continue
    }

    if (char === "'") {
      inSingleQuote = true
      continue
    }

    if (char === '"') {
      inDoubleQuote = true
      continue
    }

    if (char === "`") {
      inTemplate = true
      continue
    }

    if (char === "{") {
      depth += 1
      continue
    }

    if (char === "}") {
      depth -= 1
    }
  }

  return depth > 0
}

export function getConstructorHintState(
  value: string,
  cursorOffset: number,
): ConstructorHint | null {
  const beforeCursor = value.slice(0, cursorOffset)
  let nextMatch = constructorPattern.exec(beforeCursor)
  let lastHint: ConstructorHint | null = null

  while (nextMatch) {
    const namespace = nextMatch[1] as ConstructorDefinition["namespace"]
    const name = nextMatch[2]
    const definition = constructorDefinitions[`${namespace}.${name}`]

    if (definition) {
      const objectStart = nextMatch.index + nextMatch[0].lastIndexOf("{")
      if (isUnclosedObjectLiteral(beforeCursor, objectStart)) {
        const objectContent = beforeCursor.slice(objectStart + 1)
        const activeParameterName = getCurrentPropertyName(objectContent)
        lastHint = {
          ...definition,
          activeParameterName,
        }
      }
    }

    nextMatch = constructorPattern.exec(beforeCursor)
  }

  constructorPattern.lastIndex = 0
  return lastHint
}

export const getCaretPosition = (
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
