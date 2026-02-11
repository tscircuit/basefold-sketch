import type { Residual } from "../core"

export interface SolveOptions {
  maxIterations?: number
  maxInnerIterations?: number
  tolerance?: number // stop when ||r|| < tolerance
  lambda?: number // initial damping
  epsilon?: number // numeric diff step scale
}

export interface SolveResult {
  iterations: number
  converged: boolean
  finalError: number
}

function l2Norm(v: Float64Array): number {
  let s = 0
  for (let i = 0; i < v.length; i++) s += v[i] * v[i]
  return Math.sqrt(s)
}

function evalResiduals(vars: Float64Array, fns: Residual[]): Float64Array {
  const r = new Float64Array(fns.length)
  for (let i = 0; i < fns.length; i++) r[i] = fns[i](vars)
  return r
}

function choleskySolve(
  A: Float64Array,
  b: Float64Array,
  n: number,
): Float64Array | null {
  // A is n*n symmetric positive definite, stored row-major.
  const L = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = A[i * n + j]
      for (let k = 0; k < j; k++) sum -= L[i * n + k] * L[j * n + k]

      if (i === j) {
        if (sum <= 0) return null
        L[i * n + j] = Math.sqrt(sum)
      } else {
        L[i * n + j] = sum / L[j * n + j]
      }
    }
  }

  // Forward solve: L y = b
  const y = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    let sum = b[i]
    for (let k = 0; k < i; k++) sum -= L[i * n + k] * y[k]
    y[i] = sum / L[i * n + i]
  }

  // Backward solve: L^T x = y
  const x = new Float64Array(n)
  for (let i = n - 1; i >= 0; i--) {
    let sum = y[i]
    for (let k = i + 1; k < n; k++) sum -= L[k * n + i] * x[k]
    x[i] = sum / L[i * n + i]
  }

  return x
}

export function solveLM(
  vars: Float64Array,
  residualFns: Residual[],
  options: SolveOptions = {},
): SolveResult {
  const n = vars.length
  const m = residualFns.length

  const maxIterations = options.maxIterations ?? 80
  const maxInner = options.maxInnerIterations ?? 12
  const tol = options.tolerance ?? 1e-8
  let lambda = options.lambda ?? 1e-2
  const epsScale = options.epsilon ?? 1e-6

  if (m === 0 || n === 0) {
    return { iterations: 0, converged: true, finalError: 0 }
  }

  let r = evalResiduals(vars, residualFns)
  let err = l2Norm(r)

  for (let iter = 0; iter < maxIterations; iter++) {
    if (err < tol) return { iterations: iter, converged: true, finalError: err }

    // Numeric Jacobian J (m x n), row-major with stride n
    const J = new Float64Array(m * n)

    for (let j = 0; j < n; j++) {
      const v0 = vars[j]
      const h = epsScale * (Math.abs(v0) + 1)

      vars[j] = v0 + h
      const r2 = evalResiduals(vars, residualFns)
      vars[j] = v0

      const invH = 1 / h
      for (let i = 0; i < m; i++) {
        J[i * n + j] = (r2[i] - r[i]) * invH
      }
    }

    // Build A = J^T J (n x n) and g = J^T r (n)
    const A = new Float64Array(n * n)
    const g = new Float64Array(n)

    for (let j = 0; j < n; j++) {
      let gj = 0
      for (let i = 0; i < m; i++) gj += J[i * n + j] * r[i]
      g[j] = gj
    }

    for (let j = 0; j < n; j++) {
      for (let k = 0; k <= j; k++) {
        let s = 0
        for (let i = 0; i < m; i++) s += J[i * n + j] * J[i * n + k]
        A[j * n + k] = s
        A[k * n + j] = s
      }
    }

    // Try a damped step; increase lambda until improvement.
    let accepted = false

    for (let inner = 0; inner < maxInner; inner++) {
      const Ad = new Float64Array(A)
      for (let d = 0; d < n; d++) Ad[d * n + d] += lambda

      // Solve (Ad) * delta = -g
      const b = new Float64Array(n)
      for (let i = 0; i < n; i++) b[i] = -g[i]

      const delta = choleskySolve(Ad, b, n)
      if (!delta) {
        lambda *= 10
        continue
      }

      const trial = new Float64Array(vars)
      for (let i = 0; i < n; i++) trial[i] += delta[i]

      const rTrial = evalResiduals(trial, residualFns)
      const errTrial = l2Norm(rTrial)

      if (errTrial < err) {
        vars.set(trial)
        r = rTrial
        err = errTrial
        lambda *= 0.3
        accepted = true
        break
      }

      lambda *= 10
    }

    if (!accepted) {
      // No progress; bail out.
      return { iterations: iter + 1, converged: false, finalError: err }
    }
  }

  return { iterations: maxIterations, converged: err < tol, finalError: err }
}
