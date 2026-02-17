import { expect, test } from "bun:test"
import { constraints, Sketch, shapes } from "../src/index"

test("Shapes expose point refs for constraint wiring", async () => {
  const line = new shapes.Line({ name: "L1" })
  const infiniteLine = new shapes.InfiniteLine({
    name: "IL1",
    direction: "x+",
  })
  const axis = new shapes.Axis({ name: "A1", direction: "y+" })
  const circle = new shapes.Circle({ name: "C1", radius: 20 })
  const oval = new shapes.Oval({ name: "O1", rx: 30, ry: 10 })
  const rectangle = new shapes.Rectangle({ name: "R1", width: 40, height: 20 })
  const triangle = new shapes.RightTriangle({
    name: "T1",
    acLength: 4,
    bcLength: 5,
  })
  const trapezoid = new shapes.Trapezoid({
    name: "TZ1",
    longBaseOrientation: "left",
  })

  const allShapes = [
    line,
    infiniteLine,
    axis,
    circle,
    oval,
    rectangle,
    triangle,
    trapezoid,
  ]

  for (const shape of allShapes) {
    for (const pointName of Object.keys(shape.points)) {
      expect(shape.refs[pointName]).toBe(`${shape.name}.${pointName}`)
    }

    for (const edgeName of Object.keys(shape.edges)) {
      expect(shape.refs[edgeName]).toBe(`${shape.name}.${edgeName}`)
    }
  }

  const sketch = new Sketch()
  sketch.add(triangle)
  sketch.add(
    new constraints.FixedPoint({
      point: triangle.refs.pointAB,
      x: 0,
      y: 0,
    }),
  )
  sketch.add(
    new constraints.PointToPointDistance({
      point1: triangle.refs.pointAB,
      point2: triangle.refs.pointAC,
      distance: 3,
    }),
  )

  sketch.add(rectangle)
  sketch.add(
    new constraints.SpaceBetweenEdges({
      edge1: rectangle.refs.rightEdge,
      edge2: rectangle.refs.leftEdge,
      distance: 40,
    }),
  )

  await sketch.solve()

  expect(triangle.points.pointAC.x).toBeCloseTo(3, 5)
  expect(triangle.points.pointAB.y).toBeCloseTo(0, 5)

  const svg = sketch.svg()
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
