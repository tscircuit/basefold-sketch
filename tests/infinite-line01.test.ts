import { expect, test } from "bun:test"
import { Sketch, shapes } from "../src/index"

test("InfiniteLine supports direction shorthands and vectors", async () => {
  const sketch = new Sketch()
  const horizontalAtY2 = new shapes.InfiniteLine({
    name: "Y2",
    origin: { x: 0, y: 2 },
    direction: "x+",
  })
  const diagonal = new shapes.InfiniteLine({
    name: "D1",
    origin: { x: -4, y: -1 },
    direction: { x: 2, y: 3 },
  })

  sketch.add(horizontalAtY2)
  sketch.add(diagonal)
  await sketch.solve()

  expect(horizontalAtY2.points.start.y).toBeCloseTo(2, 6)
  expect(horizontalAtY2.points.end.y).toBeCloseTo(2, 6)
  expect(horizontalAtY2.points.end.x).toBeGreaterThan(
    horizontalAtY2.points.start.x,
  )
  expect(diagonal.points.end.x - diagonal.points.start.x).toBeCloseTo(2, 6)
  expect(diagonal.points.end.y - diagonal.points.start.y).toBeCloseTo(3, 6)

  const svg = sketch.svg({ margin: 40 })
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
