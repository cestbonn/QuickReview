import Edge from "./Edge";
import Node from "./Node";
import jsyaml from "js-yaml";
import { PartialBy } from "../utils";
import _ from "lodash";


interface YAMLSchema {
  nodes: Node[];
  edges: Edge[];
}


export default class KnowledgeGraph {
  public nodes: Map<string, Node> = new Map();
  public edges: Map<string, Edge> = new Map();

  generateID(length = 6) {
    const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const idArray = _.range(length).map(
      (_) => char[Math.floor(Math.random() * char.length)]
    );
    return _.join(idArray, '');
  }

  addNode(node: PartialBy<Node, 'id'>) {
    if (node.id === undefined) {
      let id: string;
      do { id = this.generateID(); }
      while (this.nodes.has(id));

      node.id = id;
    }
    this.nodes.set(node.id, node as Node);
  }

  addEdge(edge: PartialBy<Edge, 'id'>) {
    if (edge.id === undefined) {
      let id: string;
      do { id = this.generateID(); }
      while (this.nodes.has(id));

      edge.id = id;
    }
    this.edges.set(edge.id, edge as Edge);
  }

  constructor() {
  }

  findRelated(node: Node): Node[] {
    const result = [...this.edges.values()]
      .filter((e) => { return e.to === node.id; })
      .map((e) => { return this.nodes.get(e.from); })
      .filter(n => (n != undefined)) as Node[];
    return result;
  }

  dump() {
    return jsyaml.dump({
      nodes: [...this.nodes.values()],
      edges: [...this.edges.values()],
    }, { flowLevel: 2 });
  }

  load(yaml: string) {
    const y = jsyaml.load(yaml) as YAMLSchema;
    if (y.edges === undefined || y.nodes === undefined) return;

    y.edges.forEach((edge) => { this.addEdge(edge); });
    y.nodes.forEach((node) => { this.addNode(node); });
  }

}