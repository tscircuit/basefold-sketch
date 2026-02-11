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
