import React, { useEffect, useLayoutEffect, useState } from 'react';
import { NodeViewMap, Position, Size } from '../models/GraphView';
import KnowledgeGraph from '../models/KnowledgeGraph';
import { NodeID } from '../models/Node';
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

  const [nodeViewMap, setNodeViewMap] = useState<NodeViewMap>({
    "NVPA1I": { pos: { x: 200, y: 200 } },
    "KR3P4M": { pos: { x: 500, y: 100 } },
    "D2PDWS": { pos: { x: 800, y: 100 } },
    "QX3XWG": { pos: { x: 800, y: 200 } },
    "M8GGP8": { pos: { x: 500, y: 300 } },
    "8FGBF9": { pos: { x: 800, y: 300 } },
  });
  const [nodeSizeMap, setNodeSizeMap] = useState<{ [key: NodeID]: Size; }>({});

  const [center, setCenter] = useState({ x: 0, y: 0 });
  // useEffect(() => {
  //   setCenter({
  //     x: size.w / 3,
  //     y: size.h / 2,
  //   });
  // }, [size]);

  return (
    <div className='relative'>


      <svg
        className="absolute h-screen w-screen stroke-slate-400 fill-slate-800 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
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
            const fromPos = nodeViewMap[from]?.pos;
            const toPos = nodeViewMap[to]?.pos;

            if (!fromPos || !toPos) return;
            let { x1, x2, y1, y2 } = calcArrowPosition(fromPos, toPos, nodeSizeMap[from], nodeSizeMap[to]);
            x1 += center.x; x2 += center.x; y1 += center.y; y2 += center.y;

            return <g key={iEdge}>
              <circle cx={x1} cy={y1} r={3} />
              <circle cx={x2} cy={y2} r={3} />
              <line
                {...{ x1, x2, y1, y2 }}
                markerEnd="url(#arrowhead)"
              />
              <text
                x={(x1 + x2) / 2} y={(y1 + y2) / 2}
                alignmentBaseline="central"
                textAnchor="middle"
                stroke="black"
                strokeWidth={0.5}
              >
                {edge.type}
              </text>
            </g>;
          })
        }
      </svg>


      <div className='absolute w-full h-screen'>
        <div className='w-full h-full relative'>{
          Object.entries(nodeViewMap).map(([nodeID, nodeView], iNode) => {
            let { x, y } = nodeView.pos;
            x += center.x; y += center.y;
            return (<NodeComponent key={iNode}
              pos={{ x, y }}
              graphNode={graph.getNode(nodeID)!}
              onResize={(size) => { setNodeSizeMap((original) => ({ ...original, [nodeID]: size })); }}
              onDrag={(x, y) => {
                // console.log(x, y);

                setNodeViewMap(
                  (prev) => ({ ...prev, [nodeID]: { pos: { x, y } } })
                );
              }}
            />);
          })
        }</div>
      </div>


    </div>
  );
}