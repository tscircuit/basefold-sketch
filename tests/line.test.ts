import { expect, test } from "bun:test"
import { Sketch, shapes } from "../src/index"

test("Line validates constructor input", () => {
  expect(() => new shapes.Line({ name: "L1", length: 0 })).toThrow(
    "Line length must be a positive finite number.",
  )
})

test("Line applies fixed length internal constraint", async () => {
  const sketch = new Sketch()
  const line = new shapes.Line({
    name: "L1",
    x1: 0,
    y1: 0,
    x2: 20,
    y2: 0,
    length: 100,
  })

  sketch.add(line)
  await sketch.solve()

  const start = line.points.start
  const end = line.points.end
  const dx = end.x - start.x
  const dy = end.y - start.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  expect(start.x).toBeCloseTo(0, 6)
  expect(start.y).toBeCloseTo(0, 6)
  expect(end.y).toBeCloseTo(0, 6)
  expect(distance).toBeCloseTo(100, 6)

  const svg = sketch.svg({ margin: 50 })
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
