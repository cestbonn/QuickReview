export type NodeID = string;

export default interface Node {
  id: NodeID;
  title: string;
  content?: string;
}

class NodeManager {
  raw: Map<NodeID, Node> = new Map();
  constructor() { }

  add(node: Node) { this.raw.set(node.id, node); }
  addAll(nodes: Node[]) {
    nodes.forEach((node) => {
      this.raw.set(node.id, node);
    });
  }

  findID(id: string) { return this.raw.get(id); }
  findTitle(title: string) {
    const results: Node[] = [];
    this.raw.forEach((node, id) => {
      if (node.title.search(title) !== -1) {
        results.push(node);
      }
    });
    return results;
  }



}