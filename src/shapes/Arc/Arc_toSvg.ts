import type { Point, SvgTransform } from "../../core"

type ArcPoints = Record<string, Point>

function normalizeSweep(
  startAngle: number,
  endAngle: number,
  clockwise: boolean,
): number {
  const twoPi = Math.PI * 2
  const delta = (((endAngle - startAngle) % twoPi) + twoPi) % twoPi

  if (clockwise) {
    if (delta === 0) {
      return -twoPi
    }
    return delta - twoPi
  }

  if (delta === 0) {
    return twoPi
  }
  return delta
}

function getArcGeometry(
  points: ArcPoints,
  clockwise: boolean,
): {
  center: Point
  start: Point
  end: Point
  radius: number
  sweep: number
  startAngle: number
} {
  const center = points.center
  const start = points.start
  const end = points.end

  const startDx = start.x - center.x
  const startDy = start.y - center.y
  const endDx = end.x - center.x
  const endDy = end.y - center.y

  const startRadius = Math.hypot(startDx, startDy)
  const endRadius = Math.hypot(endDx, endDy)
  const radius = (startRadius + endRadius) / 2

  const startAngle = Math.atan2(startDy, startDx)
  const endAngle = Math.atan2(endDy, endDx)
  const sweep = normalizeSweep(startAngle, endAngle, clockwise)

  return {
    center,
    start,
    end,
    radius,
    sweep,
    startAngle,
  }
}

export function Arc_toSvg(
  points: ArcPoints,
  clockwise: boolean,
  t: SvgTransform,
): string {
  const { start, end, radius, sweep } = getArcGeometry(points, clockwise)
  const largeArcFlag = Math.abs(sweep) > Math.PI ? 1 : 0
  const sweepFlag = clockwise ? 1 : 0

  return `<path d="M ${t.x(start.x)} ${t.y(start.y)} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${t.x(end.x)} ${t.y(end.y)}" />`
}

export function Arc_getBounds(
  points: ArcPoints,
  clockwise: boolean,
): {
  minX: number
  minY: number
  maxX: number
  maxY: number
} {
  const { center, radius, sweep, startAngle } = getArcGeometry(
    points,
    clockwise,
  )
  const steps = 64

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + (sweep * i) / steps
    const x = center.x + Math.cos(angle) * radius
    const y = center.y + Math.sin(angle) * radius

    if (x < minX) minX = x
    if (y < minY) minY = y
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
  }

  return { minX, minY, maxX, maxY }
}

export function Arc_samplePoints(
  points: ArcPoints,
  clockwise: boolean,
  segments = 24,
): Point[] {
  const { center, radius, sweep, startAngle } = getArcGeometry(
    points,
    clockwise,
  )
  const sampled: Point[] = []

  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + (sweep * i) / segments
    sampled.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
      __varIndex: null,
    })
  }

  return sampled
}
