import { expect, test } from "bun:test"
import { constraints, Sketch, shapes } from "../src/index"

test("README drawing snapshot", async () => {
  const sketch = new Sketch()

  sketch.add(
    new shapes.Rectangle({
      name: "R1",
    }),
  )

  sketch.add(
    new constraints.Distance({
      point1: "R1.topLeft",
      point2: "R1.topRight",
      distance: 100,
    }),
  )

  sketch.add(
    new constraints.Distance({
      point1: "R1.topLeft",
      point2: "R1.bottomLeft",
      distance: 100,
    }),
  )

  await sketch.solve()

  const svg = sketch.svg({ margin: 50 })
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
