import Node, { NodeID } from "./Node";


export interface Size {
  w: number;
  h: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface NodeView {
  node?: Node;
  pos: Position;
}

export interface NodeViewMap {
  [key: NodeID]: NodeView;
}

export interface GraphView {
  nodes: NodeViewMap;
}