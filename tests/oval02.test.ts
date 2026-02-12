import { expect, test } from "bun:test"
import { constraints, Sketch, shapes } from "../src/index"

test("Oval applies axis and fixed radii internal constraints", async () => {
  const sketch = new Sketch()
  const oval = new shapes.Oval({
    name: "O1",
    cx: 0,
    cy: 0,
    rx: 60,
    ry: 30,
  })

  sketch.add(oval)

  sketch.add(
    new constraints.FixedPoint({
      point: "O1.center",
      x: 0,
      y: 0,
    }),
  )

  await sketch.solve()

  const center = oval.points.center
  const radiusX = oval.points.radiusX
  const radiusY = oval.points.radiusY

  const dx = radiusX.x - center.x
  const dy = radiusX.y - center.y
  const rx = Math.sqrt(dx * dx + dy * dy)

  const ex = radiusY.x - center.x
  const ey = radiusY.y - center.y
  const ry = Math.sqrt(ex * ex + ey * ey)

  expect(center.x).toBeCloseTo(0, 6)
  expect(center.y).toBeCloseTo(0, 6)
  expect(radiusX.y).toBeCloseTo(center.y, 6)
  expect(radiusY.x).toBeCloseTo(center.x, 6)
  expect(rx).toBeCloseTo(60, 6)
  expect(ry).toBeCloseTo(30, 6)

  const svg = sketch.svg({ margin: 50 })
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
