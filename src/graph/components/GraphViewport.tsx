import './GraphViewport.css'
import GraphNode from './GraphNode'
import GraphEdge from './GraphEdge'
import type { GraphNodeData, GraphEdgeData } from '../types'

export default function GraphViewport() {

    const nodeA = {
        id: 'a',
        label: 'A',
        x: 160,
        y: 140,
        }

        const nodeB = {
        id: 'b',
        label: 'B',
        x: 360,
        y: 240,
        }

        const nodes: GraphNodeData[] = [nodeA, nodeB]

        const edges: GraphEdgeData[] = [{ id: 'ab', sourceId: 'a', targetId: 'b' },
                                        { id: 'bc', sourceId: 'b', targetId: 'c' },]

  return (
    <div className="graph-viewport relative h-full w-full overflow-hidden">
      {/* Przestrzeń grafu */}
      <div className="absolute inset-0">

        {/* Warstwa połączeń */}
        <svg className="absolute inset-0 h-full w-full">

            {edges.map((edge) => {
            const source = nodes.find((node) => node.id === edge.sourceId)
            const target = nodes.find((node) => node.id === edge.targetId)

            if (!source || !target) return null

            return (
            <GraphEdge
                key={edge.id}
                source={source}
                target={target}
            />
            )

            })}

        </svg>

        {/* Warstwa wierzchołków */}
        <div className="pointer-events-none absolute inset-0">
            
            {nodes.map((node) => (<GraphNode key={node.id} node={node} />))}

        </div>

      </div>
    </div>
  )
}
