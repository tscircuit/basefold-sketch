# @basefold/sketch

2D Sketch System in Typescript

```tsx
import { Sketch, constraints, shapes } from "@basefold/sketch"

const sketch = new Sketch()

sketch.add(
  new shapes.Rectangle({
    name: "R1",
  }),
)

sketch.add(
  new constraints.Distance({
    point1: "R1.topLeft",
    point2: "R1.topRight",
    distance: 100,
  }),
)

sketch.add(
  new constraints.Distance({
    point1: "R1.topLeft",
    point2: "R1.bottomLeft",
    distance: 100,
  }),
)

await sketch.solve()

const svg = sketch.svg()
```

```tsx
import { Sketch, constraints, shapes } from "@basefold/sketch"

const sketch = new Sketch()

sketch.add(
  new shapes.Circle({
    name: "C1",
    cx: 0,
    cy: 0,
    radius: 40,
  }),
)

sketch.add(
  new shapes.Line({
    name: "L1",
    x1: -80,
    y1: 50,
    x2: 80,
    y2: 50,
    length: 160,
  }),
)

sketch.add(
  new constraints.Tangent({
    line: "L1",
    circle: "C1",
  }),
)

await sketch.solve()
```

```tsx
import { Sketch, constraints, shapes } from "@basefold/sketch"

const sketch = new Sketch()

sketch.add(
  new shapes.Oval({
    name: "O1",
    cx: 0,
    cy: 0,
    rx: 60,
    ry: 30,
  }),
)

sketch.add(
  new constraints.FixedPoint({
    point: "O1.center",
    x: 0,
    y: 0,
  }),
)

await sketch.solve()
```

```tsx
import { Sketch, constraints, shapes } from "@basefold/sketch"

const sketch = new Sketch()

const free = shapes.Line({ length: 120 })
const horizontal = shapes.Line({ horizontal: true, length: 80 })
const vertical = true
const upright = shapes.Line({ vertical, length: 60 })

sketch.add(free)
sketch.add(horizontal)
sketch.add(upright)
sketch.add(new constraints.Horizontal({ line: horizontal.name }))
sketch.add(new constraints.Vertical({ line: upright.name }))

await sketch.solve()
```
