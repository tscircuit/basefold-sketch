import { expect, test } from "bun:test"
import { constraints, Sketch, shapes } from "../src/index"

test("line is tangent to circle", async () => {
  const sketch = new Sketch()

  const circle = new shapes.Circle({
    name: "C1",
    cx: 0,
    cy: 0,
    radius: 40,
  })

  const line = new shapes.Line({
    name: "L1",
  })

  sketch.add(circle)
  sketch.add(line)

  sketch.add(
    new constraints.FixedPoint({
      point: "C1.center",
      x: 0,
      y: 0,
    }),
  )

  sketch.add(
    new constraints.PointToPointDistance({
      point1: "L1.start",
      point2: "L1.end",
      distance: 160,
    }),
  )

  sketch.add(
    new constraints.FixedY({
      point: "L1.start",
      y: 50,
    }),
  )

  sketch.add(
    new constraints.PointToPointDistance({
      point1: "C1.center",
      point2: "L1.start",
      distance: 50,
    }),
  )

  sketch.add(
    new constraints.Tangent({
      line: "L1",
      circle: "C1",
    }),
  )

  await sketch.solve()

  const center = circle.points.center
  const radiusPoint = circle.points.radius
  const start = line.points.start
  const end = line.points.end

  const radiusDx = radiusPoint.x - center.x
  const radiusDy = radiusPoint.y - center.y
  const radius = Math.sqrt(radiusDx * radiusDx + radiusDy * radiusDy)

  const lineDx = end.x - start.x
  const lineDy = end.y - start.y
  const numerator = Math.abs(
    (center.x - start.x) * lineDy - (center.y - start.y) * lineDx,
  )
  const lineLength = Math.sqrt(lineDx * lineDx + lineDy * lineDy)
  const centerToLineDistance = numerator / lineLength

  expect(centerToLineDistance).toBeCloseTo(radius, 3)

  const svg = sketch.svg({ margin: 50 })
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
