import type { GraphNodeData } from '../types'

type GraphEdgeProps = {
  source: GraphNodeData
  target: GraphNodeData
}

export default function GraphEdge({ source, target }: GraphEdgeProps) {
  return (
    <line
      x1={source.x}
      y1={source.y}
      x2={target.x}
      y2={target.y}
      stroke="#94a3b8"
      strokeWidth="2"
    />
  )
}
