import type { EdgeReferenceDefinition, Point } from "./core"

export function definePointRefs(
  shapeName: string,
  points: Readonly<Record<string, Point>>,
  edges?: Readonly<Record<string, EdgeReferenceDefinition>>,
): Record<string, string>
export function definePointRefs<P extends string, E extends string>(
  shapeName: string,
  points: Readonly<Record<P, Point>>,
  edges?: Readonly<Record<E, EdgeReferenceDefinition>>,
): Record<P | E, string>
export function definePointRefs(
  shapeName: string,
  points: Readonly<Record<string, Point>>,
  edges?: Readonly<Record<string, EdgeReferenceDefinition>>,
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
