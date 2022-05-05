import classNames from 'classnames';
import { useState } from 'react';
import KnowledgeGraph from './models/KnowledgeGraph';

function App() {
  const kg = new KnowledgeGraph();

  return (
    <div className="flex h-screen justify-center items-center bg-slate-300">
      <div className='w-[300px] bg-white m-10 shadow-lg rounded-md p-5'>
        <h1 className='font-bold text-3xl mb-2'>Nodes</h1>
        <div>
          {[...kg.nodes.values()].map((node, i) => {
            return <p key={i}>{node.title}</p>;
          })}
        </div>
      </div>

      <div className='w-[300px] bg-white m-10 shadow-lg rounded-md p-5'>
        <h1 className='font-bold text-3xl mb-2'> Edges </h1>
        <div>
          {kg.edges.map((edge, i) => {
            const from_node = kg.nodes.get(edge.from);
            const to_node = kg.nodes.get(edge.to);
            return <p key={i}>
              {from_node?.title} {edge.type} {to_node?.title}
            </p>;
          })}
        </div>
      </div>
    </div >
  );
}

export default App;
