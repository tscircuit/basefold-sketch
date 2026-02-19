import { expect, test } from "bun:test"
import { Sketch, shapes } from "../src/index"

test("Arc renders major sweep path", async () => {
  const sketch = new Sketch()

  const majorArc = new shapes.Arc({
    name: "A3",
    cx: 0,
    cy: 0,
    radius: 18,
    startAngleDeg: -20,
    endAngleDeg: 20,
    clockwise: true,
  })

  sketch.add(majorArc)
  await sketch.solve()

  expect(majorArc.points.start.y).toBeLessThan(0)
  expect(majorArc.points.end.y).toBeGreaterThan(0)

  const svg = sketch.svg({ margin: 30 })
  expect(svg).toContain("A 18 18 0 1 1")
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
