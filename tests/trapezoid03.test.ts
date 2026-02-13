import { expect, test } from "bun:test"
import { constraints, Sketch, shapes } from "../src/index"

test("Trapezoid edge aliases work in PerpendicularDistance", async () => {
  const sketch = new Sketch()
  const t1 = new shapes.Trapezoid({
    name: "T1",
    longBaseLength: 120,
    shortBaseLength: 70,
    longBaseOrientation: "bottom",
  })
  const t2 = new shapes.Trapezoid({
    name: "T2",
    longBaseLength: 120,
    shortBaseLength: 70,
    longBaseOrientation: "right",
  })

  sketch.add(t1)
  sketch.add(t2)

  sketch.add(
    new constraints.PerpendicularDistance({
      edge1: "T1.shortBase",
      edge2: "T2.bottommostLeg",
      distance: 120,
    }),
  )

  await sketch.solve()

  const s1 = t1.points["shortBase.start"]
  const s2 = t1.points["shortBase.end"]
  const l1 = t2.points["bottommostLeg.start"]
  const l2 = t2.points["bottommostLeg.end"]

  const ux = s2.x - s1.x
  const uy = s2.y - s1.y
  const vx = l2.x - l1.x
  const vy = l2.y - l1.y

  const m1x = (s1.x + s2.x) / 2
  const m1y = (s1.y + s2.y) / 2
  const m2x = (l1.x + l2.x) / 2
  const m2y = (l1.y + l2.y) / 2
  const mdx = m2x - m1x
  const mdy = m2y - m1y

  expect(ux * vy - uy * vx).toBeCloseTo(0, 6)
  expect(Math.sqrt(mdx * mdx + mdy * mdy)).toBeCloseTo(120, 6)

  const svg = sketch.svg({ margin: 30 })
  await (expect(svg) as any).toMatchSvgSnapshot(import.meta.path)
})
