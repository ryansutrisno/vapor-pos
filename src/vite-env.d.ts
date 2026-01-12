/// <reference types="vite/client" />

// jsPDF autotable types
interface AutoTableOptions {
  head?: unknown[][]
  body?: unknown[][]
  startY?: number
  margin?: { top?: number; right?: number; bottom?: number; left?: number }
  pageBreak?: string
  rowPageBreak?: string
  tableWidth?: string | number
  showHead?: string
  showFoot?: string
  tableLineWidth?: number
  tableLineColor?: string | number[]
  [key: string]: unknown
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF
  }
}

declare module '*.svg' {
  import * as React from 'react'
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}