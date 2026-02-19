import { expect, test } from "bun:test"
import { Sketch, shapes } from "../src/index"

test("Arc renders clockwise and counterclockwise paths", async () => {
  const sketch = new Sketch()

  const clockwiseArc = new shapes.Arc({
    name: "A1",
    cx: 0,
    cy: 0,
    radius: 20,
    startAngleDeg: 60,
    endAngleDeg: -60,
    clockwise: true,
  })

  const counterclockwiseArc = new shapes.Arc({
    name: "A2",
    cx: 70,
    cy: 0,
    radius: 20,
    startAngleDeg: 60,
    endAngleDeg: -60,
    clockwise: false,
  })

  sketch.add(clockwiseArc)
  sketch.add(counterclockwiseArc)

  await sketch.solve()

  expect(clockwiseArc.points.start.x).toBeCloseTo(10, 6)
  expect(clockwiseArc.points.end.x).toBeCloseTo(10, 6)
  expect(counterclockwiseArc.points.start.x).toBeCloseTo(80, 6)
  expect(counterclockwiseArc.points.end.x).toBeCloseTo(80, 6)

  const svg = sketch.svg({ margin: 40 })
  expect(svg).toContain("A 20 20 0 0 1")
  expect(svg).toContain("A 20 20 0 1 0")
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
