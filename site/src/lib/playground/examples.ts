export interface Example {
  name: string
  slug: string
  code: string
}

export const examples: Example[] = [
  {
    name: "Rectangle",
    slug: "rectangle",
    code: `import { shapes, constraints, Sketch } from "@basefold/sketch"

const sketch = new Sketch()
const r1 = new shapes.Rectangle({
    name: "R1",
    x: 40,
    y: 20,
    width: 150,
    height: 120,
  })
const r2 = new shapes.Rectangle({
    name: "R2",
    y: 20,
    width: 90,
    height: 120,
  })

sketch.add(r1)
sketch.add(r2)
sketch.add(new constraints.SpaceBetweenEdges({ edge1: "R1.rightEdge", edge2: "R2.leftEdge", distance: 40 }))`,
  },
  {
    name: "Circle",
    slug: "circle",
    code: `import { shapes, constraints, Sketch } from "@basefold/sketch"

const sketch = new Sketch()
const axis = new shapes.Axis({
     name: "Axis",
    origin: { x: 120, y: 90 },
    direction: "x+",
   })
const wheel = new shapes.Circle({
    name: "Wheel",
    cx: 120,
    cy: 90,
    radius: 45,
  })

sketch.add(axis)
sketch.add(wheel)
sketch.add(new constraints.Tangent({ line: "Axis", circle: "Wheel" }))`,
  },
  {
    name: "Right Triangle + Anchor",
    slug: "right-triangle-anchor",
    code: `import { shapes, constraints, Sketch } from "@basefold/sketch"

const sketch = new Sketch()
const tri = new shapes.RightTriangle({
    name: "Tri",
    baseLength: 170,
    altitudeLength: 120,
  })

sketch.add(tri)
sketch.add(new constraints.FixedPoint({ point: "Tri.pointAB", x: 20, y: 20 }))`,
  },
  {
    name: "Ball Screw Profile",
    slug: "ball-screw-profile",
    code: `import { shapes, constraints, Sketch } from "@basefold/sketch"

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

sketch.add(new constraints.Coincident({ point1: "CenterAxis.start", point2: "B1.start" }))
sketch.add(new constraints.Coincident({ point1: "B1.end", point2: "B2.start" }))
sketch.add(new constraints.Coincident({ point1: "B2.end", point2: "B3.start" }))
sketch.add(new constraints.Coincident({ point1: "B3.end", point2: "B4.start" }))
sketch.add(new constraints.Coincident({ point1: "B4.end", point2: "B5.start" }))
sketch.add(new constraints.FixedX({ point: "B5.end", x: 0 }))`,
  },
]

export const defaultExample = examples[0]

const findExampleBySlug = (slug: string | null): Example | undefined => {
  if (!slug) {
    return undefined
  }

  return examples.find((example) => example.slug === slug)
}

export const getExampleFromUrl = (): Example | undefined => {
  const params = new URLSearchParams(window.location.search)
  return findExampleBySlug(params.get("example"))
}

export const updateUrlForExample = (example: Example): void => {
  const url = new URL(window.location.href)
  url.searchParams.set("example", example.slug)
  window.history.replaceState(
    null,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  )
}
