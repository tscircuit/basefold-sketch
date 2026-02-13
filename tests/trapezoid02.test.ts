import { expect, test } from "bun:test"
import { constraints, Sketch, shapes } from "../src/index"

test("Trapezoid supports base line distance aliases", async () => {
  const sketch = new Sketch()
  const trapezoid = new shapes.Trapezoid({
    name: "T1",
    longBaseLength: 100,
    shortBaseLength: 60,
    longBaseOrientation: "left",
  })

  sketch.add(trapezoid)
  sketch.add(
    new constraints.LineToLineDistance({
      line1: "T1.longBase",
      line2: "T1.shortBase",
      distance: 50,
    }),
  )
  sketch.add(
    new constraints.Vertical({
      line: "T1.longBase",
    }),
  )

  await sketch.solve()

  const leftmostBaseStart = trapezoid.points["leftmostBase.start"]
  const leftmostBaseEnd = trapezoid.points["leftmostBase.end"]
  const shortBaseStart = trapezoid.points["shortBase.start"]
  const ux = leftmostBaseEnd.x - leftmostBaseStart.x
  const uy = leftmostBaseEnd.y - leftmostBaseStart.y
  const wx = shortBaseStart.x - leftmostBaseStart.x
  const wy = shortBaseStart.y - leftmostBaseStart.y
  const lineLength = Math.sqrt(ux * ux + uy * uy)
  const pointToLineDistance = Math.abs(ux * wy - uy * wx) / lineLength

  const rightmostBaseStart = trapezoid.points["rightmostBase.start"]
  const rightmostBaseEnd = trapezoid.points["rightmostBase.end"]
  const vx = rightmostBaseEnd.x - rightmostBaseStart.x
  const vy = rightmostBaseEnd.y - rightmostBaseStart.y

  expect(Math.sqrt(ux * ux + uy * uy)).toBeGreaterThan(0)
  expect(Math.sqrt(vx * vx + vy * vy)).toBeGreaterThan(0)
  expect(pointToLineDistance).toBeCloseTo(50, 6)

  const svg = sketch.svg({ margin: 30 })
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
