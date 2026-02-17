import type { EdgeReferenceDefinition, Point } from "./core"

export function definePointRefs(
  shapeName: string,
  points: Record<string, Point>,
  edges?: Record<string, EdgeReferenceDefinition>,
): Record<string, string> {
  const refs: Record<string, string> = {}

  for (const pointName of Object.keys(points)) {
    refs[pointName] = `${shapeName}.${pointName}`
  }

  if (edges) {
    for (const edgeName of Object.keys(edges)) {
      refs[edgeName] = `${shapeName}.${edgeName}`
    }
  }

  return refs
}
