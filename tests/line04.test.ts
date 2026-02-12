import { expect, test } from "bun:test"
import { Sketch, shapes } from "../src/index"

test("Line shorthand supports horizontal and vertical flags", async () => {
  const sketch = new Sketch()
  const horizontal = shapes.Line({ horizontal: true, length: 40 })
  const vertical = true
  const verticalLine = shapes.Line({ vertical })

  sketch.add(horizontal)
  sketch.add(verticalLine)
  await sketch.solve()

  expect(horizontal.points.start.y).toBeCloseTo(horizontal.points.end.y, 6)
  expect(verticalLine.points.start.x).toBeCloseTo(verticalLine.points.end.x, 6)

  const svg = sketch.svg({ margin: 50 })
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
