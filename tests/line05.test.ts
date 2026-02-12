import { expect, test } from "bun:test"
import { constraints, Sketch, shapes } from "../src/index"

test("Horizontal and Vertical constraints apply to lines", async () => {
  const sketch = new Sketch()
  const horizontalLine = new shapes.Line({
    name: "H1",
    x1: 0,
    y1: 0,
    x2: 30,
    y2: 0,
    length: 30,
  })
  const verticalLine = new shapes.Line({
    name: "V1",
    x1: 80,
    y1: 0,
    x2: 80,
    y2: 20,
    length: 20,
  })

  sketch.add(horizontalLine)
  sketch.add(verticalLine)
  sketch.add(new constraints.Horizontal({ line: "H1" }))
  sketch.add(new constraints.Vertical({ line: "V1" }))
  await sketch.solve()

  expect(horizontalLine.points.start.y).toBeCloseTo(
    horizontalLine.points.end.y,
    6,
  )
  expect(verticalLine.points.start.x).toBeCloseTo(verticalLine.points.end.x, 6)

  const svg = sketch.svg({ margin: 50 })
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
