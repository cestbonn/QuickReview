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
    <div className='h-screen w-screen bg-[url(/src/res/grid.svg)] bg-center bg-slate-50'>
      <Graph graph={kg}></Graph>
    </div>

  );
}

export default App;
