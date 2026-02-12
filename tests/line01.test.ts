import { expect, test } from "bun:test"
import { Sketch, shapes } from "../src/index"

test("Line validates constructor input", async () => {
  expect(() => new shapes.Line({ name: "L1", length: 0 })).toThrow(
    "Line length must be a positive finite number.",
  )
  expect(
    () => new shapes.Line({ name: "L2", horizontal: true, vertical: true }),
  ).toThrow("Line cannot be both horizontal and vertical.")

  const sketch = new Sketch()
  sketch.add(
    new shapes.Line({
      name: "L3",
      x1: 0,
      y1: 0,
      x2: 20,
      y2: 0,
      length: 20,
    }),
  )
  await sketch.solve()

  const svg = sketch.svg({ margin: 50 })
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
