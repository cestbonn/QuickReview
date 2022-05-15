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

interface GraphProps {
  graph: KnowledgeGraph;
}
export default function Graph(props: GraphProps) {
  const [gd, setGd] = useState<GraphDocument>({ edges: {}, nodes: {} });
  useEffect(() => {
    console.log('update');

    const gd: GraphDocument = {
      nodes: {
        "NVPA1I": { x: 120, y: 144, w: 112, h: 40 },
        "KR3P4M": { x: 354, y: 102, w: 100, h: 40 },
        "D2PDWS": { x: 582, y: 66, w: 100, h: 40 },
        "QX3XWG": { x: 582, y: 138, w: 100, h: 40 },
        "M8GGP8": { x: 354, y: 174, w: 100, h: 40 },
        "8FGBF9": { x: 582, y: 210, w: 100, h: 40 },
      },
      edges: {
        "z340QL": {},
        "bTTmkj": {},
        "gJNLTA": {},
        "15obuo": {},
        "OLwevw": {},
        "HEiKHG": {},
      }
    };

    completeDocument(gd, props.graph);
    setGd(gd);
  }, []);

  const root = props.graph.nodes.get('NVPA1I');
  if (!root) return <div></div>;
  const layers = bfs(props.graph, root);

  const nodeOnScreen: string[] = [];

  useLayoutEffect(() => {
    const observer = new ResizeObserver((elements) => {
      console.log(gd);
      const result = elements.map((ele) => {
        const nodeID = ele.target.id.slice("gnode-".length);
        const { offsetLeft, offsetTop, offsetHeight, offsetWidth } = ele.target as HTMLDivElement;
        const x = Math.round(offsetLeft);
        const y = Math.round(offsetTop);
        const w = Math.ceil(offsetWidth);
        const h = Math.ceil(offsetHeight);



        setGd((prev) => {
          return update(prev, {
            nodes: {
              [nodeID]: {
                $set: { x, y, w, h }
              }
            }

          });
        });


      });
      console.log(gd);

      // console.log(yamljs.dump(gd.nodes, { flowLevel: 1 }));
    });

    nodeOnScreen.forEach((id) => {
      const ele = document.getElementById(id);
      observer.observe(ele as HTMLDivElement);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className='relative'>
      <svg className="absolute h-screen w-screen">{
        Object.entries(gd.edges).map(([edgeID, ed], i) => {
          return (<circle key={i} r={10} cx={ed.fromNode?.x} cy={ed.fromNode?.y} fill="red" />);
        })
      }
      </svg>

      <div className='absolute flex items-center justify-center'>
        {layers.map((layer, ilayer) => {
          return (<div key={ilayer} className="flex flex-col">
            {layer.map((node, inode) => {
              const id = `gnode-${node.id}`;
              nodeOnScreen.push(id);
              const div = (<div
                id={id}
                key={inode}
                className="p-2 bg-white m-4 mx-16 rounded-md min-w-[120px] text-center"
              >
                {node.title}
              </div>);
              return div;
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
