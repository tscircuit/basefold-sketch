import { expect, test } from "bun:test"
import { shapes } from "../src/index"

test("Circle validates constructor input", () => {
  expect(() => new shapes.Circle({ name: "C1", radius: 0 })).toThrow(
    "Circle radius must be a positive finite number.",
  )
})
