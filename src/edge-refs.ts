import type { EdgeReferenceDefinition, Shape, Vector2 } from "./core"

export interface ResolvedEdgeReference {
  shapeName: string
  edge: string
  point1Ref: string
  point2Ref: string
  interiorPointRef?: string
}

export function resolveShapeEdgeRef(
  ref: string,
  resolveShape: (shapeName: string) => Shape,
): ResolvedEdgeReference {
  const dot = ref.indexOf(".")
  if (dot === -1) {
    throw new Error(`Invalid edge ref "${ref}". Expected "ShapeName.edge".`)
  }

  const shapeName = ref.slice(0, dot)
  const edge = ref.slice(dot + 1)
  const shape = resolveShape(shapeName)
  const edgeDef = shape.edges[edge]

  if (!edgeDef) {
    const knownEdges = Object.keys(shape.edges).sort().join(", ")
    throw new Error(
      `Unknown edge "${edge}" on shape "${shapeName}". Known: ${knownEdges}`,
    )
  }

  return {
    shapeName,
    edge,
    point1Ref: `${shapeName}.${edgeDef.point1}`,
    point2Ref: `${shapeName}.${edgeDef.point2}`,
    interiorPointRef: edgeDef.interiorPoint
      ? `${shapeName}.${edgeDef.interiorPoint}`
      : undefined,
  }
}

export function defineShapeEdges<K extends string>(
  defs: Readonly<Record<K, EdgeReferenceDefinition>>,
): Record<K, EdgeReferenceDefinition> {
  return Object.freeze({ ...defs })
}

export function computeInteriorUnitNormal(
  ux: number,
  uy: number,
  interiorDx: number,
  interiorDy: number,
): Vector2 {
  const len = Math.hypot(ux, uy)
  if (len === 0) {
    return { x: 0, y: 0 }
  }

  const leftX = -uy / len
  const leftY = ux / len
  const dot = leftX * interiorDx + leftY * interiorDy

  if (dot >= 0) {
    return {
      x: leftX,
      y: leftY,
    }
  }

  return {
    x: -leftX,
    y: -leftY,
  }
}
