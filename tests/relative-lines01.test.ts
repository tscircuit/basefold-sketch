import { expect, test } from "bun:test"
import { constraints, Sketch, shapes } from "../src/index"

test("relative lines snapshot", async () => {
  const sketch = new Sketch()

  const base = new shapes.Line({
    name: "L1",
    x1: 0,
    y1: 0,
    x2: 100,
    y2: 0,
    length: 100,
  })

  const linked = new shapes.Line({
    name: "L2",
    x1: 140,
    y1: 60,
    x2: 220,
    y2: 60,
    length: 80,
  })

  sketch.add(base)
  sketch.add(linked)

  sketch.add(
    new constraints.Coincident({
      point1: "L1.end",
      point2: "L2.start",
    }),
  )

  sketch.add(
    new constraints.PointToPointDistance({
      point1: "L1.start",
      point2: "L2.end",
      distance: 120,
    }),
  )

  await sketch.solve()

  expect(base.points.end.x).toBeCloseTo(linked.points.start.x, 6)
  expect(base.points.end.y).toBeCloseTo(linked.points.start.y, 6)

  const dx = linked.points.end.x - base.points.start.x
  const dy = linked.points.end.y - base.points.start.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  expect(distance).toBeCloseTo(120, 6)

  const graphics = sketch.graphicsObject()
  expect(graphics.arrows?.length).toBe(1)
  expect(graphics.arrows?.[0]?.inlineLabel).toBe("120")
  await (expect(graphics) as any).toMatchGraphicsSvg(import.meta.path, {
    svgName: "relative-lines01.graphics",
  })

  const svg = sketch.svg({ margin: 50 })
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
