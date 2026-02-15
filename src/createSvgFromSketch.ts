import type {
  BuildContext,
  Constraint,
  Point,
  Shape,
  SvgTransform,
} from "./core"

export interface CreateSvgFromSketchOptions {
  points: Point[]
  shapes: Iterable<Shape>
  constraints?: Iterable<Constraint>
  buildContext?: BuildContext
  margin?: number
  strokeWidth?: number
}

export function createSvgFromSketch(
  options: CreateSvgFromSketchOptions,
): string {
  const margin = options.margin ?? 10
  const strokeWidth = options.strokeWidth ?? 2
  const shapes = [...options.shapes]

  if (options.points.length === 0) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect x="0" y="0" width="100" height="100" fill="white" /></svg>'
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of options.points) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }

  for (const shape of shapes) {
    const bounds = shape.getBounds?.()
    if (!bounds) continue

    if (bounds.minX < minX) minX = bounds.minX
    if (bounds.minY < minY) minY = bounds.minY
    if (bounds.maxX > maxX) maxX = bounds.maxX
    if (bounds.maxY > maxY) maxY = bounds.maxY
  }

  const w = maxX - minX + 2 * margin
  const h = maxY - minY + 2 * margin

  const t: SvgTransform = {
    x: (x) => x - minX + margin,
    y: (y) => y - minY + margin,
  }

  let body = ""
  for (const shape of shapes) {
    body += shape.toSvg(t)
  }

  let constraintsSvg = ""
  if (options.constraints && options.buildContext) {
    for (const constraint of options.constraints) {
      if (constraint.toSvg) {
        constraintsSvg += constraint.toSvg({
          resolvePoint: options.buildContext.resolvePoint,
          transform: t,
        })
      }
    }
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect x="0" y="0" width="${w}" height="${h}" fill="white" />
  <g fill="none" stroke="black" stroke-width="${strokeWidth}">
    ${body}
  </g>
  ${constraintsSvg}
</svg>`.trim()
}
