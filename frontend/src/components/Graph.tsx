import yamljs from 'js-yaml';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import Edge from '../models/Edge';
import KnowledgeGraph from '../models/KnowledgeGraph';
import Node from '../models/Node';
import update from 'immutability-helper';

interface NodeRecord {
  h?: number;
  w?: number;
  x: number;
  y: number;
  node?: Node;
}
interface EdgeRecord {
  edge?: Edge;
  fromNode?: NodeRecord;
  toNode?: NodeRecord;
}
interface GraphDocument {
  nodes: { [key: string]: NodeRecord; };
  edges: { [key: string]: EdgeRecord; };
}

const completeDocument = (gd: GraphDocument, graph: KnowledgeGraph) => {
  Object.entries(gd.nodes).forEach(([nodeID, nr]) => {
    if (nr.node === undefined) {
      nr.node = graph.getNode(nodeID);
    }
  });
  Object.entries(gd.edges).forEach(([edgeID, er]) => {
    if (er.edge === undefined) {
      er.edge = graph.getEdge(edgeID);
      er.fromNode = gd.nodes[er.edge?.from as string];
      er.toNode = gd.nodes[er.edge?.to as string];
    }
  });
};

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

interface NodeLayoutInfo {
  h: number; w: number; x: number; y: number;
}

interface NodeLayoutInfoMap {
  [key: string]: NodeLayoutInfo;
}

const calcArrowPosition = (fromPos: NodeLayoutInfo, toPos: NodeLayoutInfo) => {
  let { x: x1, y: y1 } = fromPos;
  let { x: x2, y: y2 } = toPos;
  if (Math.abs(x1 - x2) > Math.abs(y1 - y2)) {
    if (x1 > x2) {
      x1 -= fromPos.w / 2;
      x2 += toPos.w / 2;
    } else {
      x1 += fromPos.w / 2;
      x2 -= toPos.w / 2;
    }
  } else {
    if (y1 > y2) {
      y1 -= fromPos.h / 2;
      y2 += toPos.h / 2;
    } else {
      y1 += fromPos.h / 2;
      y2 -= toPos.h / 2;
    }
  }
  return { x1, x2, y1, y2 };
};


interface GraphProps {
  graph: KnowledgeGraph;
}
export default function Graph(props: GraphProps) {
  const root = props.graph.nodes.get('NVPA1I');
  if (!root) return <div></div>;
  const layers = bfs(props.graph, root);

  const nodeDivIDs: string[] = [];

  const size = useWindowResize();

  const [nodePos, setNodePos] = useState<NodeLayoutInfoMap>({});

  useLayoutEffect(() => {
    const nodePositions: NodeLayoutInfoMap = {};
    nodeDivIDs.forEach((id) => {
      const nodeID = id.slice('gnode-'.length);

      const nodeDiv = document.getElementById(id);
      const h = nodeDiv?.offsetHeight;
      const w = nodeDiv?.offsetWidth;

      if (!h || !w) return;
      const x = nodeDiv?.offsetLeft + w / 2;
      const y = nodeDiv?.offsetTop + h / 2;

      if (!x || !y) return;
      nodePositions[nodeID] = { h, w, x, y };
    });

    setNodePos(nodePositions);
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
            const fromPos = nodePos[from];
            const toPos = nodePos[to];
            if (!fromPos || !toPos) return;
            const { x1, x2, y1, y2 } = calcArrowPosition(fromPos, toPos);
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
            return <circle key={iEdge} r={10} cx={fromPos.x} cy={fromPos.y} />;
          }).filter(a => a)
        }
      </svg>


      <div className='absolute flex items-center w-full justify-evenly'>
        {layers.map((layer, ilayer) => {
          return (<div key={ilayer} className="flex flex-col">
            {layer.map((node, inode) => {
              const id = `gnode-${node.id}`;
              nodeDivIDs.push(id);
              return (<div
                id={id}
                key={`${ilayer} ${inode}`}
                className="p-2 bg-white m-4 rounded-md min-w-[120px] text-center shadow-md border"
              >
                {node.title}
              </div>);

            })}
          </div>);
        })}
      </div>
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
