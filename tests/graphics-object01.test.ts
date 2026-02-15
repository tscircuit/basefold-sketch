import { expect, test } from "bun:test"
import { Sketch, shapes } from "../src/index"

test("All shapes export graphics objects", async () => {
  const circle = new shapes.Circle({ name: "C1", cx: 0, cy: 0, radius: 10 })
  const oval = new shapes.Oval({ name: "O1", cx: 20, cy: 0, rx: 12, ry: 6 })
  const rectangle = new shapes.Rectangle({
    name: "R1",
    x: 40,
    y: -5,
    width: 20,
    height: 10,
  })
  const triangle = new shapes.RightTriangle({
    name: "T1",
    baseLength: 8,
    altitudeLength: 6,
  })
  const trapezoid = new shapes.Trapezoid({
    name: "Z1",
    shortBaseLength: 8,
    longBaseLength: 12,
  })
  const line = new shapes.Line({ name: "L1", x1: -10, y1: -10, x2: -2, y2: -4 })

  expect(circle.toGraphicsObject().circles?.length).toBe(1)
  expect(oval.toGraphicsObject().polygons?.length).toBe(1)
  expect(rectangle.toGraphicsObject().polygons?.length).toBe(1)
  expect(triangle.toGraphicsObject().polygons?.length).toBe(1)
  expect(trapezoid.toGraphicsObject().polygons?.length).toBe(1)
  expect(line.toGraphicsObject().lines?.length).toBe(1)
  expect(circle.toGraphicsObject().circles?.[0]?.label).toBe("C1")
  expect(line.toGraphicsObject().lines?.[0]?.label).toBe("L1")
  expect(rectangle.toGraphicsObject().polygons?.[0]?.label).toBe("R1")
  expect(
    line.toGraphicsObject().points?.some((p) => p.label === "L1.start"),
  ).toBe(true)
  expect(
    trapezoid
      .toGraphicsObject()
      .points?.some((p) => p.label === "Z1.longBaseStart"),
  ).toBe(true)

  const sketch = new Sketch()
  sketch.add(circle)
  sketch.add(oval)
  sketch.add(rectangle)
  sketch.add(triangle)
  sketch.add(trapezoid)
  sketch.add(line)
  await sketch.solve()

  const graphics = sketch.graphicsObject()
  expect(graphics.circles?.length).toBe(1)
  expect(graphics.lines?.length).toBe(1)
  expect(graphics.polygons?.length).toBe(4)
  expect(graphics.points?.length).toBe(18)
  await expect(graphics).toMatchGraphicsSvg(import.meta.path, {
    svgName: "graphics-object01.graphics",
  })

  const svg = sketch.svg({ margin: 40 })
  await expect(svg).toMatchSvgSnapshot(import.meta.path)
})
