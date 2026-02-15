import { expect, test } from "bun:test"
import { constraints, Sketch, shapes } from "../src/index"

test("SpaceBetweenEdges enforces non-overlapping rectangle spacing", async () => {
  const withPerpendicular = new Sketch()
  const pR1 = new shapes.Rectangle({
    name: "R1",
    x: 40,
    y: 20,
    width: 150,
    height: 120,
  })
  const pR2 = new shapes.Rectangle({
    name: "R2",
    y: 20,
    width: 90,
    height: 120,
  })

  withPerpendicular.add(pR1)
  withPerpendicular.add(pR2)
  withPerpendicular.add(
    new constraints.PerpendicularDistance({
      edge1: "R1.rightEdge",
      edge2: "R2.leftEdge",
      distance: 40,
    }),
  )

  await withPerpendicular.solve()

  const overlapGap = pR2.points.topLeft.x - pR1.points.topRight.x
  expect(overlapGap).toBeLessThan(0)

  const sketch = new Sketch()
  const r1 = new shapes.Rectangle({
    name: "R1",
    x: 40,
    y: 20,
    width: 150,
    height: 120,
  })
  const r2 = new shapes.Rectangle({
    name: "R2",
    y: 20,
    width: 90,
    height: 120,
  })

  sketch.add(r1)
  sketch.add(r2)
  sketch.add(
    new constraints.SpaceBetweenEdges({
      edge1: "R1.rightEdge",
      edge2: "R2.leftEdge",
      distance: 40,
    }),
  )

  await sketch.solve()

  const gap = r2.points.topLeft.x - r1.points.topRight.x
  expect(gap).toBeGreaterThan(0)
  expect(gap).toBeCloseTo(40, 6)

  const svg = sketch.svg({ margin: 50 })
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
