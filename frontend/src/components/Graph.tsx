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
      <div className='absolute flex items-center w-full justify-evenly'>
        {layers.map((layer, ilayer) => {
          return (<div key={ilayer} className="flex flex-col">
            {layer.map((node, inode) => {
              const id = `gnode-${node.id}`;
              nodeDivIDs.push(id);
              const div = (<div
                id={id}
                key={inode}
                className="p-2 bg-white m-4 rounded-md min-w-[120px] text-center"
              >
                {node.title}
              </div>);
              return div;
            })}
          </div>);
        })}

      </div>

      <svg className="absolute h-screen w-screen">{
        Object.entries(nodePos).map(([nodeID, lInfo], i) => {
          return (<circle key={i} r={10} cx={lInfo.x} cy={lInfo.y} fill="red" />);
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
