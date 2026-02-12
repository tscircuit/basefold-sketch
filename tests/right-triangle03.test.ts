import { expect, test } from "bun:test"
import { constraints, Sketch, shapes } from "../src/index"

test("RightTriangle edge aliases work in PerpendicularDistance", async () => {
  const sketch = new Sketch()
  const t1 = new shapes.RightTriangle({
    name: "T1",
    x: 0,
    y: 0,
    baseLength: 30,
    altitudeLength: 40,
  })
  const t2 = new shapes.RightTriangle({
    name: "T2",
    x: 16,
    y: 12,
    baseLength: 30,
    altitudeLength: 40,
  })

  sketch.add(t1)
  sketch.add(t2)

  sketch.add(
    new constraints.FixedPoint({
      point: "T1.pointAB",
      x: 0,
      y: 0,
    }),
  )
  sketch.add(
    new constraints.FixedPoint({
      point: "T2.pointAB",
      x: 16,
      y: 12,
    }),
  )

  sketch.add(
    new constraints.PerpendicularDistance({
      edge1: "T1.base",
      edge2: "T2.a",
      distance: 12,
    }),
  )
  sketch.add(
    new constraints.PerpendicularDistance({
      edge1: "T1.altitude",
      edge2: "T2.b",
      distance: 16,
    }),
  )
  sketch.add(
    new constraints.PerpendicularDistance({
      edge1: "T1.hypotenuse",
      edge2: "T2.c",
      distance: 20,
    }),
  )

  await sketch.solve()
  const svg = sketch.svg({ margin: 30 })
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
