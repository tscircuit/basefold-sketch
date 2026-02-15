import {
  InfiniteLine,
  type InfiniteLineOptions,
} from "../InfiniteLine/InfiniteLine"

export type AxisDirection = InfiniteLineOptions["direction"]

export interface AxisOptions {
  name?: string
  origin?: {
    x: number
    y: number
  }
  direction: AxisDirection
}

let nextAxisAutoNameId = 1

export class Axis extends InfiniteLine {
  constructor(opts: AxisOptions) {
    if (opts.name !== undefined && !opts.name) {
      throw new Error("Axis requires a non-empty name.")
    }

    super({
      ...opts,
      name: opts.name ?? `Axis${nextAxisAutoNameId++}`,
    })
  }
}
