import { expect, test } from "bun:test"
import { constraints, Sketch, shapes } from "../src/index"

test("screw profile snapshot with center axis", async () => {
  const sketch = new Sketch()

  const axis = new shapes.Axis({
    name: "CenterAxis",
    origin: { x: 0, y: 24 },
    direction: "y-",
  })

  const crest = new shapes.Line({
    name: "P1",
    x1: 0,
    y1: 24,
    x2: 12,
    y2: 24,
    length: 12,
    horizontal: true,
  })

  const flankTop = new shapes.Line({
    name: "P2",
    x1: 12,
    y1: 24,
    x2: 18,
    y2: 16,
    length: 10,
  })

  const root = new shapes.Line({
    name: "P3",
    x1: 18,
    y1: 16,
    x2: 18,
    y2: 6,
    length: 10,
    vertical: true,
  })

  const flankBottom = new shapes.Line({
    name: "P4",
    x1: 18,
    y1: 6,
    x2: 12,
    y2: -2,
    length: 10,
  })

  const base = new shapes.Line({
    name: "P5",
    x1: 12,
    y1: -2,
    x2: 0,
    y2: -2,
    length: 12,
    horizontal: true,
  })

  sketch.add(axis)
  sketch.add(crest)
  sketch.add(flankTop)
  sketch.add(root)
  sketch.add(flankBottom)
  sketch.add(base)

  sketch.add(
    new constraints.Coincident({
      point1: "CenterAxis.start",
      point2: "P1.start",
    }),
  )
  sketch.add(
    new constraints.Coincident({
      point1: "P1.end",
      point2: "P2.start",
    }),
  )
  sketch.add(
    new constraints.Coincident({
      point1: "P2.end",
      point2: "P3.start",
    }),
  )
  sketch.add(
    new constraints.Coincident({
      point1: "P3.end",
      point2: "P4.start",
    }),
  )
  sketch.add(
    new constraints.Coincident({
      point1: "P4.end",
      point2: "P5.start",
    }),
  )
  sketch.add(
    new constraints.FixedX({
      point: "P5.end",
      x: 0,
    }),
  )

  await sketch.solve()

  expect(axis.points.start.x).toBeCloseTo(axis.points.end.x, 6)
  expect(crest.points.start.x).toBeCloseTo(axis.points.start.x, 6)
  expect(base.points.end.x).toBeCloseTo(axis.points.start.x, 6)

  const outsidePoints = [
    crest.points.end,
    flankTop.points.end,
    root.points.end,
    base.points.start,
  ]
  for (const point of outsidePoints) {
    expect(point.x).toBeGreaterThan(axis.points.start.x)
  }

  const svg = sketch.svg({ margin: 40 })
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
