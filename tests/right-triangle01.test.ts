import { expect, test } from "bun:test"
import { shapes } from "../src/index"

test("RightTriangle validates constructor input", () => {
  expect(() => new shapes.RightTriangle({ name: "T1", baseLength: 0 })).toThrow(
    "RightTriangle base length must be a positive finite number.",
  )
  expect(
    () =>
      new shapes.RightTriangle({
        name: "T2",
        baseLength: 30,
        aLength: 20,
      }),
  ).toThrow('Conflicting length options for edge "base".')
})
