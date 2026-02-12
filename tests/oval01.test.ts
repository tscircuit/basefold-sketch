import { expect, test } from "bun:test"
import { shapes } from "../src/index"

test("Oval validates constructor input", () => {
  expect(() => new shapes.Oval({ name: "O1", rx: 0 })).toThrow(
    "Oval rx must be a positive finite number.",
  )
  expect(() => new shapes.Oval({ name: "O2", ry: 0 })).toThrow(
    "Oval ry must be a positive finite number.",
  )
})
