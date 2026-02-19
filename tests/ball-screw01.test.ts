import { expect, test } from "bun:test"
import { constraints, Sketch, shapes } from "../src/index"

test("ball screw profile snapshot", async () => {
  const sketch = new Sketch()

  const axis = new shapes.Axis({
    name: "CenterAxis",
    origin: { x: 0, y: 20 },
    direction: "y-",
  })

  const topLand = new shapes.Line({
    name: "B1",
    x1: 0,
    y1: 20,
    x2: 12,
    y2: 20,
    length: 12,
    horizontal: true,
  })

  const upperFlank = new shapes.Line({
    name: "B2",
    x1: 12,
    y1: 20,
    x2: 28,
    y2: 7,
    length: Math.sqrt(425),
  })

  const grooveArc = new shapes.Arc({
    name: "B3",
    cx: 24,
    cy: 0,
    radius: 8,
    startAngleDeg: 60,
    endAngleDeg: -60,
    clockwise: true,
  })

  const lowerFlank = new shapes.Line({
    name: "B4",
    x1: 28,
    y1: -7,
    x2: 12,
    y2: -20,
    length: Math.sqrt(425),
  })

  const bottomLand = new shapes.Line({
    name: "B5",
    x1: 12,
    y1: -20,
    x2: 0,
    y2: -20,
    length: 12,
    horizontal: true,
  })

  const ball = new shapes.Circle({
    name: "Ball",
    cx: 24,
    cy: 0,
    radius: 6,
  })

  sketch.add(axis)
  sketch.add(topLand)
  sketch.add(upperFlank)
  sketch.add(grooveArc)
  sketch.add(lowerFlank)
  sketch.add(bottomLand)
  sketch.add(ball)

  sketch.add(
    new constraints.Coincident({
      point1: "CenterAxis.start",
      point2: "B1.start",
    }),
  )
  sketch.add(
    new constraints.Coincident({
      point1: "B1.end",
      point2: "B2.start",
    }),
  )
  sketch.add(
    new constraints.Coincident({
      point1: "B2.end",
      point2: "B3.start",
    }),
  )
  sketch.add(
    new constraints.Coincident({
      point1: "B3.end",
      point2: "B4.start",
    }),
  )
  sketch.add(
    new constraints.Coincident({
      point1: "B4.end",
      point2: "B5.start",
    }),
  )
  sketch.add(
    new constraints.FixedX({
      point: "B5.end",
      x: 0,
    }),
  )

  await sketch.solve()

  expect(Math.abs(axis.points.start.x - axis.points.end.x)).toBeLessThan(0.02)
  expect(Math.abs(topLand.points.start.x - axis.points.start.x)).toBeLessThan(
    0.02,
  )
  expect(Math.abs(bottomLand.points.end.x - axis.points.start.x)).toBeLessThan(
    0.02,
  )
  expect(ball.points.center.x).toBeGreaterThan(axis.points.start.x)
  expect(grooveArc.points.center.x).toBeGreaterThan(axis.points.start.x)

  const profileOutsidePoints = [
    topLand.points.end,
    upperFlank.points.end,
    grooveArc.points.start,
    grooveArc.points.end,
    lowerFlank.points.start,
    bottomLand.points.start,
  ]
  for (const point of profileOutsidePoints) {
    expect(point.x).toBeGreaterThan(axis.points.start.x)
  }

  const svg = sketch.svg({ margin: 40 })
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
