import { expect, test } from "bun:test"
import { constraints, Sketch, shapes } from "../src/index"

type XY = { x: number; y: number }

const offset = 20
const margin = 50
const arrowLength = 8
const arrowHalfWidth = 4

const constraintStroke = "#8a8a8a"
const constraintText = "#666"

const pointText = (p: XY): string => `${p.x},${p.y}`

const line = (a: XY, b: XY, stroke: string): string =>
  `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${stroke}" />`

const midpoint = (a: XY, b: XY): XY => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
})

const normalize = (v: XY): XY => {
  const mag = Math.hypot(v.x, v.y) || 1
  return { x: v.x / mag, y: v.y / mag }
}

const add = (a: XY, b: XY): XY => ({ x: a.x + b.x, y: a.y + b.y })
const sub = (a: XY, b: XY): XY => ({ x: a.x - b.x, y: a.y - b.y })
const mul = (v: XY, s: number): XY => ({ x: v.x * s, y: v.y * s })
const dot = (a: XY, b: XY): number => a.x * b.x + a.y * b.y
const normalLeft = (u: XY): XY => ({ x: -u.y, y: u.x })

const triangle = (a: XY, b: XY, c: XY, fill: string): string =>
  `<polygon points="${pointText(a)} ${pointText(b)} ${pointText(c)}" fill="${fill}" />`

const dimensionGeometry = (a: XY, b: XY) => {
  const u = normalize(sub(b, a))
  const n = normalLeft(u)

  const startTip = a
  const endTip = b

  const startBaseCenter = add(a, mul(u, arrowLength))
  const endBaseCenter = add(b, mul(u, -arrowLength))

  const startBase1 = add(startBaseCenter, mul(n, arrowHalfWidth))
  const startBase2 = add(startBaseCenter, mul(n, -arrowHalfWidth))
  const endBase1 = add(endBaseCenter, mul(n, arrowHalfWidth))
  const endBase2 = add(endBaseCenter, mul(n, -arrowHalfWidth))

  return {
    shaftStart: startBaseCenter,
    shaftEnd: endBaseCenter,
    startTip,
    startBase1,
    startBase2,
    endTip,
    endBase1,
    endBase2,
  }
}

const orientedOffset = (a: XY, b: XY, interiorProbe: XY): XY => {
  const u = normalize(sub(b, a))
  const n = normalLeft(u)
  const inward = dot(sub(interiorProbe, a), n) > 0
  return inward ? mul(n, -offset) : mul(n, offset)
}

test("README drawing snapshot", async () => {
  const sketch = new Sketch()
  const rectangle = new shapes.Rectangle({ name: "R1" })

  sketch.add(rectangle)
  sketch.add(
    new constraints.Distance({
      point1: "R1.topLeft",
      point2: "R1.topRight",
      distance: 100,
    }),
  )
  sketch.add(
    new constraints.Distance({
      point1: "R1.topLeft",
      point2: "R1.bottomLeft",
      distance: 100,
    }),
  )

  await sketch.solve()

  const tl = rectangle.points.topLeft
  const tr = rectangle.points.topRight
  const br = rectangle.points.bottomRight
  const bl = rectangle.points.bottomLeft

  const minX = Math.min(tl.x, tr.x, br.x, bl.x)
  const minY = Math.min(tl.y, tr.y, br.y, bl.y)

  const toCanvas = (p: XY): XY => ({
    x: p.x - minX + margin,
    y: p.y - minY + margin,
  })

  const topDelta = orientedOffset(tl, tr, bl)
  const topA = add(tl, topDelta)
  const topB = add(tr, topDelta)
  const topLabel = add(midpoint(topA, topB), mul(normalize(topDelta), 12))
  const topDim = dimensionGeometry(topA, topB)

  const leftDelta = orientedOffset(tl, bl, tr)
  const leftA = add(tl, leftDelta)
  const leftB = add(bl, leftDelta)
  const leftLabel = add(midpoint(leftA, leftB), mul(normalize(leftDelta), 12))
  const leftDim = dimensionGeometry(leftA, leftB)

  const baseSvg = sketch.svg({ margin })

  const overlay = `
<g fill="none" stroke-width="2">
  ${line(toCanvas(tl), toCanvas(topA), constraintStroke)}
  ${line(toCanvas(tr), toCanvas(topB), constraintStroke)}
  ${line(toCanvas(topDim.shaftStart), toCanvas(topDim.shaftEnd), constraintStroke)}
  ${line(toCanvas(tl), toCanvas(leftA), constraintStroke)}
  ${line(toCanvas(bl), toCanvas(leftB), constraintStroke)}
  ${line(toCanvas(leftDim.shaftStart), toCanvas(leftDim.shaftEnd), constraintStroke)}
</g>
${triangle(toCanvas(topDim.startTip), toCanvas(topDim.startBase1), toCanvas(topDim.startBase2), constraintStroke)}
${triangle(toCanvas(topDim.endTip), toCanvas(topDim.endBase1), toCanvas(topDim.endBase2), constraintStroke)}
${triangle(toCanvas(leftDim.startTip), toCanvas(leftDim.startBase1), toCanvas(leftDim.startBase2), constraintStroke)}
${triangle(toCanvas(leftDim.endTip), toCanvas(leftDim.endBase1), toCanvas(leftDim.endBase2), constraintStroke)}
<g fill="${constraintText}" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="12" text-anchor="middle" dominant-baseline="middle">
  <text x="${toCanvas(topLabel).x}" y="${toCanvas(topLabel).y}">100</text>
  <text x="${toCanvas(leftLabel).x}" y="${toCanvas(leftLabel).y}">100</text>
</g>`.trim()

  const svg = baseSvg.replace("</svg>", `${overlay}\n</svg>`)

  await expect(svg).toMatchSvgSnapshot(import.meta.path)
})
