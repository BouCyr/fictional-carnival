import { distance } from "../geometry/primitives.js";

export function createPathGraph() {
  const nodes = [];
  const edges = [];
  const keyToNode = new Map();

  function key(point) {
    return `${Math.round(point.x)},${Math.round(point.y)}`;
  }

  function addNode(point, data = {}) {
    const nodeKey = data.key ?? key(point);
    if (keyToNode.has(nodeKey)) return keyToNode.get(nodeKey);
    const node = { id: `n${nodes.length}`, point: { x: point.x, y: point.y }, ...data };
    nodes.push(node);
    keyToNode.set(nodeKey, node);
    return node;
  }

  function addEdge(a, b, data = {}) {
    if (!a || !b || a.id === b.id) return null;
    const lengthValue = distance(a.point, b.point);
    const edge = {
      id: `e${edges.length}`,
      from: a.id,
      to: b.id,
      points: data.points ?? [a.point, b.point],
      length: lengthValue,
      cost: lengthValue * (data.costMultiplier ?? 1),
      type: data.type ?? "street",
      restricted: data.restricted ?? false,
    };
    edges.push(edge);
    return edge;
  }

  function addPolyline(points, data = {}) {
    const createdNodes = points.map((item, index) => addNode(item, { key: data.nodeKeys?.[index] }));
    for (let index = 1; index < createdNodes.length; index += 1) {
      addEdge(createdNodes[index - 1], createdNodes[index], {
        ...data,
        points: [points[index - 1], points[index]],
      });
    }
    return createdNodes;
  }

  return { nodes, edges, addNode, addEdge, addPolyline };
}

export function shortestPath(graph, startId, goalId) {
  const distances = new Map(graph.nodes.map((node) => [node.id, Infinity]));
  const previous = new Map();
  const queue = new Set(graph.nodes.map((node) => node.id));
  distances.set(startId, 0);

  while (queue.size > 0) {
    let current = null;
    let best = Infinity;
    for (const candidate of queue) {
      const value = distances.get(candidate);
      if (value < best) {
        best = value;
        current = candidate;
      }
    }
    if (current === null || current === goalId) break;
    queue.delete(current);

    const incident = graph.edges.filter((edge) => edge.from === current || edge.to === current);
    for (const edge of incident) {
      if (edge.restricted) continue;
      const neighbor = edge.from === current ? edge.to : edge.from;
      if (!queue.has(neighbor)) continue;
      const alternative = distances.get(current) + edge.cost;
      if (alternative < distances.get(neighbor)) {
        distances.set(neighbor, alternative);
        previous.set(neighbor, { node: current, edge });
      }
    }
  }

  if (!previous.has(goalId) && startId !== goalId) return { nodes: [], edges: [], cost: Infinity };
  const nodes = [goalId];
  const edges = [];
  let current = goalId;
  while (current !== startId) {
    const step = previous.get(current);
    if (!step) break;
    edges.unshift(step.edge);
    current = step.node;
    nodes.unshift(current);
  }
  return { nodes, edges, cost: distances.get(goalId) };
}
