import { expect, test } from "bun:test"
import { constraints, Sketch, shapes } from "../src/index"

test("relative rectangles snapshot 02", async () => {
  const sketch = new Sketch()
  const left = new shapes.Rectangle({
    name: "R1",
    x: 40,
    y: 40,
    width: 120,
    height: 80,
  })
  const right = new shapes.Rectangle({
    name: "R2",
    x: 220,
    y: 50,
    width: 100,
    height: 60,
  })

  sketch.add(left)
  sketch.add(right)

  sketch.add(
    new constraints.FixedPoint({
      point: "R1.topLeft",
      x: 40,
      y: 40,
    }),
  )

  sketch.add(
    new constraints.PerpendicularDistance({
      edge1: "R1.right",
      edge2: "R2.left",
      distance: 40,
    }),
  )

  await sketch.solve()

  const svg = sketch.svg({ margin: 50 })

  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
