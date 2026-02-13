import { expect, test } from "bun:test"
import { constraints, Sketch, shapes } from "../src/index"

function dotAtRightAngle(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
): number {
  const ux = b.x - a.x
  const uy = b.y - a.y
  const vx = c.x - a.x
  const vy = c.y - a.y
  return ux * vx + uy * vy
}

test("RightTriangle edge aliases work in PerpendicularDistance", async () => {
  const sketch = new Sketch()
  const t1 = new shapes.RightTriangle({
    name: "T1",
    baseLength: 30,
    altitudeLength: 40,
  })
  const t2 = new shapes.RightTriangle({
    name: "T2",
    baseLength: 30,
    altitudeLength: 40,
  })

  sketch.add(t1)
  sketch.add(t2)

  sketch.add(
    new constraints.PerpendicularDistance({
      edge1: "T1.base",
      edge2: "T2.a",
      distance: 120,
    }),
  )

  await sketch.solve()

  expect(
    dotAtRightAngle(t1.points.pointAB, t1.points.pointAC, t1.points.pointBC),
  ).toBeCloseTo(0, 6)
  expect(
    dotAtRightAngle(t2.points.pointAB, t2.points.pointAC, t2.points.pointBC),
  ).toBeCloseTo(0, 6)
  const t1MidX = (t1.points.pointAB.x + t1.points.pointAC.x) / 2
  const t1MidY = (t1.points.pointAB.y + t1.points.pointAC.y) / 2
  const t2MidX = (t2.points.pointAB.x + t2.points.pointAC.x) / 2
  const t2MidY = (t2.points.pointAB.y + t2.points.pointAC.y) / 2
  const midDx = t2MidX - t1MidX
  const midDy = t2MidY - t1MidY
  const midpointDistance = Math.sqrt(midDx * midDx + midDy * midDy)
  expect(midpointDistance).toBeCloseTo(120, 6)

  const svg = sketch.svg({ margin: 30 })
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
