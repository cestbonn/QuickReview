import yamljs from 'js-yaml';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import Edge from '../models/Edge';
import KnowledgeGraph from '../models/KnowledgeGraph';
import Node, { NodeID } from '../models/Node';
import update from 'immutability-helper';
import { GraphView, Position, Size } from '../models/GraphView';
import NodeComponent from './NodeComponent';


const useWindowResize = () => {
  const [size, setSize] = useState({ h: 0, w: 0 });
  useLayoutEffect(() => {
    const updateWindowSize = () => {
      setSize({ h: window.innerHeight, w: window.innerWidth });
    };
    window.addEventListener('resize', updateWindowSize);
    updateWindowSize();
    return () => {
      window.removeEventListener("resize", updateWindowSize);
    };
  }, []);
  return size;
};

const calcArrowPosition = (fromPos: Position, toPos: Position, fromSize?: Size, toSize?: Size,) => {
  let { x: x1, y: y1 } = fromPos;
  let { x: x2, y: y2 } = toPos;
  fromSize = fromSize ?? { h: 0, w: 0 };
  toSize = toSize ?? { h: 0, w: 0 };
  if (Math.abs(x1 - x2) > Math.abs(y1 - y2)) {
    if (x1 > x2) {
      x1 -= fromSize.w / 2;
      x2 += toSize.w / 2;
    } else {
      x1 += fromSize.w / 2;
      x2 -= toSize.w / 2;
    }
  } else {
    if (y1 > y2) {
      y1 -= fromSize.h / 2;
      y2 += toSize.h / 2;
    } else {
      y1 += fromSize.h / 2;
      y2 -= toSize.h / 2;
    }
  }
  return { x1, x2, y1, y2 };
};


interface GraphProps {
  graph: KnowledgeGraph;
}
export default function Graph(props: GraphProps) {
  const graph = props.graph;

  const size = useWindowResize();

  const graphView: GraphView = {
    nodes: {
      "NVPA1I": { pos: { x: 0, y: 0 } },
      "KR3P4M": { pos: { x: 200, y: 0 } }
    }
  };

  const nodeSizeMap: { [key: NodeID]: { h: number, w: number; }; } = {};

  const [center, setCenter] = useState({ x: 0, y: 0 });
  useEffect(() => {
    setCenter({
      x: size.w / 2,
      y: size.h / 2,
    });
    console.log(center);

  }, [size]);


  return (
    <div className='relative'>


      <svg className="absolute h-screen w-screen stroke-slate-400 fill-slate-800" xmlns="http://www.w3.org/2000/svg" >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7"
            refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" />
          </marker>
        </defs>
        {
          [...props.graph.edges.entries()].map(([edgeID, edge], iEdge) => {
            const { from, to } = edge;
            if (!from || !to) return;
            const fromPos = graphView.nodes[from]?.pos;
            const toPos = graphView.nodes[to]?.pos;
            if (!fromPos || !toPos) return;
            // let { x1, x2, y1, y2 } = calcArrowPosition(
            //   fromPos, toPos, nodeSizeMap[from], nodeSizeMap[to]);
            // x1 += center.x; x2 += center.x; y1 += center.y; y2 += center.y;
            const x1 = fromPos.x + center.x;
            const y1 = fromPos.y + center.y;
            const x2 = toPos.x + center.x;
            const y2 = toPos.y + center.y;
            return <g key={iEdge}>
              <line
                {...{ x1, x2, y1, y2 }}
                markerEnd="url(#arrowhead)"
              />
              <text
                x={(x1 + x2) / 2} y={(y1 + y2) / 2}
                alignmentBaseline="middle"
                textAnchor='middle'
                stroke="black"
                strokeWidth={0.5}
              >
                {edge.type}
              </text>
            </g>;
          })
        }
      </svg>


      <div className='absolute w-full h-screen opacity-50'>
        <div className='w-full h-full relative'>
          {
            Object.entries(graphView.nodes).map(([nodeID, nodeView], iNode) => {
              let { x, y } = nodeView.pos;
              x += center.x; y += center.y;
              console.log({ x, y, loc: 1 });

              return (<NodeComponent key={iNode}
                pos={{ x, y }}
                graphNode={graph.getNode(nodeID)!}
              />);

            })
          }
        </div>
      </div>


    </div>
  );
}