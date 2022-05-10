import classNames from 'classnames';
import { useState } from 'react';
import Graph from './components/Graph';
import KnowledgeGraph from './models/KnowledgeGraph';
import storage from "./models/storage.yaml?raw";

function App() {
  const kg = new KnowledgeGraph();
  kg.load(storage);
  (window as any).kg = kg;

  return (
    <div className="flex flex-col h-screen bg-slate-300">
      <div className="flex items-center py-10">
        <div className="flex-1"></div>
        <div className='w-[300px] bg-white shadow-lg rounded-md p-5 flex-none'>
          <h1 className='font-bold text-3xl mb-2'>Nodes</h1>
          <div>
            {[...kg.nodes.values()].map((node, i) => {
              return <p key={i}>{node.title}</p>;
            })}
          </div>
        </div>
        <div className="flex-none basis-10"></div>

        <div className='w-[300px] bg-white shadow-lg rounded-md p-5 flex-none'>
          <h1 className='font-bold text-3xl mb-2'> Edges </h1>
          <div>
            {[...kg.edges.values()].map((edge, i) => {
              const from_node = kg.nodes.get(edge.from);
              const to_node = kg.nodes.get(edge.to);
              return <p key={i}>
                {from_node?.title} {edge.type} {to_node?.title}
              </p>;
            })}
          </div>
        </div>
        <div className="flex-1"></div>

      </div>
      <div className='border-t flex-1 bg-gray-400'>
        <Graph graph={kg}></Graph>
      </div>
    </div >
  );
}

export default App;
