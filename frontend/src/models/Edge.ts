import { NodeID } from "./Node";


export default interface Edge {
  from: NodeID;
  to: NodeID;
  undirected?: boolean;
  type: string;
}
