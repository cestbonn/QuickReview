import React from 'react';
import KnowledgeGraph from '../models/KnowledgeGraph';
import Node from '../models/Node';

interface GraphProps {
  graph: KnowledgeGraph;
}
export default function Graph(props: GraphProps) {
  const root = props.graph.nodes.get('NVPA1I');
  if (!root) return <div></div>;
  const layers = bfs(props.graph, root);

  return (
    <div className='flex items-center justify-center'>
      {layers.map((layer, ilayer) => {
        return (<div key={ilayer} className="flex flex-col">
          {layer.map((node, inode) => {
            return (<div key={inode} className="p-2 bg-white m-4 mx-16 rounded-md min-w-[100px] text-center">
              {node.title}
            </div>);
          })}
        </div>);
      })}
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
