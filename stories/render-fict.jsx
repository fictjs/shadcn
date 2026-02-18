/** @jsxImportSource fict */

import { render } from 'fict'

export function renderFict(factory) {
  const root = document.createElement('div')
  render(() => factory(), root)
  return root
}
