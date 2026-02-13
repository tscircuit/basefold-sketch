import { expect, test } from "bun:test"
import { constraints, Sketch, shapes } from "../src/index"

function length(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

test("RightTriangle supports point refs and length aliases", async () => {
  const sketch = new Sketch()
  const triangle = new shapes.RightTriangle({
    name: "T1",
    acLength: 40,
    hypotenuseLength: 50,
  })

  sketch.add(triangle)
  sketch.add(
    new constraints.FixedPoint({
      point: "T1.pointAB",
      x: 0,
      y: 0,
    }),
  )
  sketch.add(
    new constraints.Distance({
      point1: "T1.pointAB",
      point2: "T1.pointAC",
      distance: 30,
    }),
  )

  await sketch.solve()

  const pointAB = triangle.points.pointAB
  const pointAC = triangle.points.pointAC
  const pointBC = triangle.points.pointBC

  const base = length(pointAB, pointAC)
  const altitude = length(pointAB, pointBC)
  const hypotenuse = length(pointAC, pointBC)

  const ux = pointAC.x - pointAB.x
  const uy = pointAC.y - pointAB.y
  const vx = pointBC.x - pointAB.x
  const vy = pointBC.y - pointAB.y
  const dot = ux * vx + uy * vy

  expect(base).toBeCloseTo(30, 6)
  expect(altitude).toBeCloseTo(40, 6)
  expect(hypotenuse).toBeCloseTo(50, 6)
  expect(dot).toBeCloseTo(0, 6)
})
