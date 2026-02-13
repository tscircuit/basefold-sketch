import { expect, test } from "bun:test"
import { constraints, Sketch, shapes } from "../src/index"

function length(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

test("Trapezoid supports configurable base lengths and equal legs", async () => {
  const sketch = new Sketch()
  const trapezoid = new shapes.Trapezoid({
    name: "T1",
    longBaseLength: 90,
    shortBaseLength: 40,
    hasEqualLengthLegs: true,
  })

  sketch.add(trapezoid)
  sketch.add(
    new constraints.FixedPoint({
      point: "T1.longBase.start",
      x: 20,
      y: 40,
    }),
  )

  await sketch.solve()

  const longBaseLength = length(
    trapezoid.points.longBaseStart,
    trapezoid.points.longBaseEnd,
  )
  const shortBaseLength = length(
    trapezoid.points.shortBaseStart,
    trapezoid.points.shortBaseEnd,
  )
  const leg1Length = length(
    trapezoid.points["leg1.start"],
    trapezoid.points["leg1.end"],
  )
  const leg2Length = length(
    trapezoid.points["leg2.start"],
    trapezoid.points["leg2.end"],
  )

  const ux = trapezoid.points.longBaseEnd.x - trapezoid.points.longBaseStart.x
  const uy = trapezoid.points.longBaseEnd.y - trapezoid.points.longBaseStart.y
  const vx = trapezoid.points.shortBaseEnd.x - trapezoid.points.shortBaseStart.x
  const vy = trapezoid.points.shortBaseEnd.y - trapezoid.points.shortBaseStart.y

  expect(longBaseLength).toBeCloseTo(90, 6)
  expect(shortBaseLength).toBeCloseTo(40, 6)
  expect(leg1Length).toBeCloseTo(leg2Length, 6)
  expect(ux * vy - uy * vx).toBeCloseTo(0, 6)

  const svg = sketch.svg({ margin: 30 })
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
