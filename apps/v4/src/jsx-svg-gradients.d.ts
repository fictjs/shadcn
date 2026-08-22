/**
 * `@fictjs/runtime` ships JSX intrinsics for the SVG shape elements but omits the
 * gradient ones, even though its DOM layer already case-normalizes
 * `linearGradient` / `radialGradient` and its attribute types cover
 * `stopColor` / `stopOpacity`. Declare them here so the dashboard area chart can
 * render the same gradient fills the React example uses.
 */

import type { FictNode } from "@fictjs/runtime"

interface SvgGradientAttributes {
  id?: string
  x1?: string | number
  y1?: string | number
  x2?: string | number
  y2?: string | number
  gradientUnits?: string
  gradientTransform?: string
  children?: FictNode
}

interface SvgGradientStopAttributes {
  offset?: string | number
  "stop-color"?: string
  "stop-opacity"?: string | number
  children?: FictNode
}

declare module "@fictjs/runtime/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      linearGradient: SvgGradientAttributes
      radialGradient: SvgGradientAttributes
      stop: SvgGradientStopAttributes
    }
  }
}
