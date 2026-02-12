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
