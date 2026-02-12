import { expect, test } from "bun:test"
import { constraints, Sketch, shapes } from "../src/index"

test("Circle applies fixed radius internal constraint", async () => {
  const sketch = new Sketch()
  const circle = new shapes.Circle({
    name: "C1",
    cx: 0,
    cy: 0,
    radius: 50,
  })

  sketch.add(circle)

  sketch.add(
    new constraints.FixedPoint({
      point: "C1.center",
      x: 0,
      y: 0,
    }),
  )

  sketch.add(
    new constraints.FixedY({
      point: "C1.radius",
      y: 0,
    }),
  )

  await sketch.solve()

  const center = circle.points.center
  const radiusPoint = circle.points.radius
  const dx = radiusPoint.x - center.x
  const dy = radiusPoint.y - center.y
  const radius = Math.sqrt(dx * dx + dy * dy)

  expect(center.x).toBeCloseTo(0, 6)
  expect(center.y).toBeCloseTo(0, 6)
  expect(radiusPoint.y).toBeCloseTo(0, 6)
  expect(radius).toBeCloseTo(50, 6)

  const svg = sketch.svg({ margin: 50 })
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
