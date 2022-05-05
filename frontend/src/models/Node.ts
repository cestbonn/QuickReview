export type NodeID = string;

export default interface Node {
  id: NodeID;
  title: string;
  content?: string;
}