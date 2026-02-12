import { expect, test } from "bun:test"
import { Sketch, shapes } from "../src/index"

test("Line callable shorthand supports implicit name and length", async () => {
  const sketch = new Sketch()
  const line = shapes.Line({ length: 50 })

  sketch.add(line)
  await sketch.solve()

  const start = line.points.start
  const end = line.points.end
  const dx = end.x - start.x
  const dy = end.y - start.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  expect(line.name).toContain("Line")
  expect(distance).toBeCloseTo(50, 6)

  const svg = sketch.svg({ margin: 50 })
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
