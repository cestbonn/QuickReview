import { NodeID } from "./Node";


export default interface Edge {
  id: string;
  from: NodeID;
  to: NodeID;
  undirected?: boolean;
  type: string;
}
