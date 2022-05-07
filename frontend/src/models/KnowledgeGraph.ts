import Edge from "./Edge";
import Node, { NodeID } from "./Node";

interface Graph {
  nodes: Map<NodeID, Node>;
  edges: Edge[];
}

export default class KnowledgeGraph {
  public nodes: Map<NodeID, Node> = new Map();
  public edges: Edge[] = [];

  addNode(node: Node) {
    this.nodes.set(node.id, node);
  }

  addEdge(edge: Edge) {
    this.edges.push(edge);
  }

  constructor() {
    this.addNode({ id: "NVPA1I", title: "Living Things" });
    this.addNode({ id: "KR3P4M", title: "Animal" });
    this.addNode({ id: "D2PDWS", title: "Dogs" });
    this.addNode({ id: "QX3XWG", title: "Cows" });
    this.addNode({ id: "M8GGP8", title: "Plants" });
    this.addNode({ id: "8FGBF9", title: "Herbs" });
    // this.addNode({ id: "KUGYY6", title: "" });
    // this.addNode({ id: "NAKDZL", title: "" });
    // this.addNode({ id: "9HGCK8", title: "" });
    // this.addNode({ id: "2C65Y4", title: "" });

    this.addEdge({ from: "KR3P4M", to: "NVPA1I", type: "is" });
    this.addEdge({ from: "D2PDWS", to: "KR3P4M", type: "is" });
    this.addEdge({ from: "QX3XWG", to: "KR3P4M", type: "is" });
    this.addEdge({ from: "M8GGP8", to: "NVPA1I", type: "is" });
    this.addEdge({ from: "8FGBF9", to: "M8GGP8", type: "is" });
    this.addEdge({ from: "QX3XWG", to: "8FGBF9", type: "eat" });
  }

  getGraph(): Graph {
    const { nodes, edges } = this;
    return { nodes, edges };
  }

  findRelated(node: Node): Node[] {
    const result = this.edges
      .filter((e) => { return e.to === node.id; })
      .map((e) => { return this.nodes.get(e.from); })
      .filter(n => (n != undefined)) as Node[];

    return result;
  }
}