import React, { useEffect, useRef } from 'react';
import KnowledgeGraph from '../models/KnowledgeGraph';
import Node from '../models/Node';

interface GraphProps {
  graph: KnowledgeGraph;
}
export default function Graph(props: GraphProps) {
  const root = props.graph.nodes.get('NVPA1I');
  if (!root) return <div></div>;
  const layers = bfs(props.graph, root);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef?.current) return;
    const container = containerRef?.current;

    new ResizeObserver((divList) => {
      if (!svgRef?.current) return;
      const svg = svgRef.current;

      const { height, width } = divList[0].contentRect;
      svg.setAttribute("height", height.toString());
      svg.setAttribute("width", width.toString());
      svg.setAttribute('viewBox', `-${width / 2} -${height / 2} ${width} ${height}`);


    }).observe(container);


  }, [containerRef?.current]);




  return (
    <div ref={containerRef} className='h-full'>
      <svg ref={svgRef}>
        {
          layers.flatMap((layer, i) => {
            return layer.map((node, j) => {
              return (

                <g>
                  <rect key={`${i} ${j}`}
                    x={i * 200} y={j * 50}
                    width={120} height={40}
                    fill='white' rx={10} ry={10}>
                  </rect>
                  <text x={i * 200 + 60} y={j * 50 + 20} textAnchor="middle" alignmentBaseline='middle' >{node.title}</text>
                </g>);
            });
          })
        }


      </svg>
    </div>
  );
}

const bfs = (graph: KnowledgeGraph, root: Node) => {
  const visited = new Set<string>();
  let layer: Node[] = [root];
  let result: Node[][] = [];
  let nextLayer: Node[] = [];

  while (layer.length > 0) {
    result.push(layer);

    layer.forEach((node) => {
      visited.add(node.id);

      const related = graph.findRelated(node);
      related.forEach((rnode) => {
        if (visited.has(rnode.id)) return;
        visited.add(rnode.id);
        nextLayer.push(rnode);
      });
    });

    layer = nextLayer;
    nextLayer = [];
  }

  return result;
};
