import type { GraphNodeData } from '../types'

type GraphNodeProps = {
  node: GraphNodeData
}


export default function GraphNode({ node }: GraphNodeProps) {
  return (
    <div
      className="pointer-events-auto absolute flex h-16 w-16
                 -translate-x-1/2 -translate-y-1/2
                 items-center justify-center rounded-full
                 border border-slate-300 bg-white text-slate-900 shadow-sm"
      style={{ left: node.x, top: node.y }}
    >
      {node.label}
    </div>
  )
}


