import type { GraphicsObject } from "graphics-debug"
import { transform } from "sucrase"
import { constraints, Sketch, shapes } from "../../../../src/index"

type SketchApi = {
  Sketch: typeof Sketch
  shapes: typeof shapes
  constraints: typeof constraints
}

const runtimeApi: SketchApi = {
  Sketch,
  shapes,
  constraints,
}

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

export async function executeCode(code: string): Promise<GraphicsObject> {
  const runtimeCode = code.replace(
    /^\s*import\s*\{\s*shapes\s*,\s*constraints\s*,\s*Sketch\s*\}\s*from\s*["']@basefold\/sketch["']\s*;?\s*$/m,
    "",
  )
  const stripped = transform(runtimeCode, { transforms: ["typescript"] }).code
  const runner = new Function(
    "api",
    `"use strict";
return (async () => {
  const { Sketch, shapes, constraints } = api;
  ${stripped}

  if (typeof sketch === "undefined") {
    throw new Error("Define a top-level 'sketch' variable.");
  }

  if (!(sketch instanceof Sketch)) {
    throw new Error("'sketch' must be an instance of Sketch.");
  }

  await sketch.solve();
  return sketch.graphicsObject();
})();`,
  ) as (api: SketchApi) => Promise<unknown>

  const value = await Promise.resolve(runner(runtimeApi))

  if (!value || typeof value !== "object") {
    throw new Error("The executed code must produce a Sketch graphics object")
  }

  return value as GraphicsObject
}
