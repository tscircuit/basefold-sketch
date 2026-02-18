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
