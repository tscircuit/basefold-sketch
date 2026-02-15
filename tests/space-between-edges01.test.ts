import { expect, test } from "bun:test"
import { constraints, Sketch, shapes } from "../src/index"

test("SpaceBetweenEdges falls back when interior points are unknown", async () => {
  const sketch = new Sketch()

  const line1 = new shapes.Line({
    name: "L1",
    x1: 0,
    y1: 0,
    x2: 100,
    y2: 0,
  })
  const line2 = new shapes.Line({
    name: "L2",
    x1: 0,
    y1: 20,
    x2: 100,
    y2: 20,
  })

  sketch.add(line1)
  sketch.add(line2)
  sketch.add(
    new constraints.SpaceBetweenEdges({
      edge1: "L1.segment",
      edge2: "L2.segment",
      distance: 50,
    }),
  )

  await sketch.solve()

  const m1y = (line1.points.start.y + line1.points.end.y) / 2
  const m2y = (line2.points.start.y + line2.points.end.y) / 2
  expect(Math.abs(m2y - m1y)).toBeCloseTo(50, 6)

  const svg = sketch.svg({ margin: 40 })
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
