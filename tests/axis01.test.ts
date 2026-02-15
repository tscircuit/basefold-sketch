import { expect, test } from "bun:test"
import { Sketch, shapes } from "../src/index"

test("Axis uses origin and direction definitions", async () => {
  const sketch = new Sketch()
  const xAxis = new shapes.Axis({
    name: "X",
    direction: "x+",
  })
  const descending = new shapes.Axis({
    name: "A1",
    origin: { x: 3, y: 1 },
    direction: "y-",
  })

  sketch.add(xAxis)
  sketch.add(descending)
  await sketch.solve()

  expect(xAxis.points.start.y).toBeCloseTo(0, 6)
  expect(xAxis.points.end.y).toBeCloseTo(0, 6)
  expect(xAxis.points.end.x).toBeGreaterThan(xAxis.points.start.x)
  expect(descending.points.start.x).toBeCloseTo(3, 6)
  expect(descending.points.end.y).toBeLessThan(descending.points.start.y)

  const svg = sketch.svg({ margin: 30 })
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
