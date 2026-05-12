import { createRng } from "../rng.js";
import { point, polar, polylineLength, TAU, wavyPolyline } from "../geometry/primitives.js";
import { boundsOf, centroid, polygonArea } from "../geometry/polygon.js";
import { createCityBoundary, createGatePoints, createRiver, createWall } from "./constraints.js";
import { createDistricts } from "./districts.js";
import { createCellsForDistrict } from "./cells.js";
import { createParcelsForCell } from "./parcels.js";
import { createBuildingForParcel } from "./buildings.js";
import { createPathGraph, shortestPath } from "./path-graph.js";

const ROAD_WIDTH = {
  main: 18,
  street: 10,
  alley: 5,
  gate: 14,
  bridge: 16,
};

function createMainRoads(center, gates, districts, rng, graph) {
  const roads = [];
  const market = point(center.x + rng.between(-35, 35), center.y + rng.between(-30, 30));
  const marketNode = graph.addNode(market, { key: "market", role: "market" });
  gates.forEach((gate, index) => {
    const polyline = wavyPolyline(gate, market, rng, { steps: 5, amplitude: 22, bow: index });
    roads.push({ id: `main-road-${index + 1}`, type: "main", width: ROAD_WIDTH.main, points: polyline });
    const nodeKeys = polyline.map((_, pointIndex) => (pointIndex === 0 ? `gate-${index + 1}` : pointIndex === polyline.length - 1 ? "market" : undefined));
    graph.addPolyline(polyline, { type: "main", costMultiplier: 0.7, nodeKeys });
  });

  districts.forEach((district, index) => {
    const polyline = wavyPolyline(district.center, market, rng, { steps: 3, amplitude: 14, bow: index * 0.4 });
    roads.push({ id: `${district.id}-spoke`, type: "street", width: ROAD_WIDTH.street, points: polyline });
    graph.addPolyline(polyline, { type: "street", costMultiplier: 1 });
  });
  return { roads, marketNode };
}

function addCellRoads(cells, rng, graph) {
  const roads = [];
  cells.forEach((cell, index) => {
    if (index % 2 === 0 || rng.chance(0.58)) {
      const c = cell.center;
      const target = cell.polygon[rng.int(0, cell.polygon.length - 1)];
      const points = wavyPolyline(c, target, rng, { steps: 2, amplitude: 7, bow: index });
      roads.push({ id: `${cell.id}-lane`, type: "alley", width: ROAD_WIDTH.alley, points });
      graph.addPolyline(points, { type: "alley", costMultiplier: 1.35 });
    }
  });
  return roads;
}

function createBridges(river, gates, rng, graph) {
  if (!river) return [];
  const length = polylineLength(river);
  const bridgeCount = Math.max(1, Math.min(3, Math.round(gates.length / 2)));
  const bridges = [];
  for (let index = 0; index < bridgeCount; index += 1) {
    const riverPointIndex = Math.floor(((index + 1) / (bridgeCount + 1)) * (river.length - 1));
    const a = river[riverPointIndex];
    const b = river[Math.min(river.length - 1, riverPointIndex + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const inv = 1 / Math.max(1, Math.hypot(dx, dy));
    const normal = point(-dy * inv, dx * inv);
    const mid = point((a.x + b.x) / 2, (a.y + b.y) / 2);
    const p1 = point(mid.x - normal.x * 22, mid.y - normal.y * 22);
    const p2 = point(mid.x + normal.x * 22, mid.y + normal.y * 22);
    bridges.push({ id: `bridge-${index + 1}`, points: [p1, p2], width: ROAD_WIDTH.bridge, riverDistance: length * ((index + 1) / (bridgeCount + 1)) });
    graph.addPolyline([p1, p2], { type: "bridge", costMultiplier: 0.85 });
  }
  return bridges;
}

export function generateCity(options = {}) {
  const params = {
    seed: options.seed ?? "castel-bridge-42",
    citySize: Number(options.citySize ?? 880),
    density: Number(options.density ?? 0.68),
    wallEnabled: options.wallEnabled ?? true,
    riverEnabled: options.riverEnabled ?? true,
    districtCount: Number(options.districtCount ?? 8),
    organicNoise: Number(options.organicNoise ?? 0.62),
    streetComplexity: Number(options.streetComplexity ?? 0.62),
    fieldRatio: Number(options.fieldRatio ?? 0.18),
  };
  const rng = createRng(params.seed);
  const center = point(params.citySize / 2, params.citySize / 2);
  const radius = params.citySize * 0.43;
  const graph = createPathGraph();

  const boundary = createCityBoundary(center, radius, rng, params.organicNoise);
  const river = params.riverEnabled ? createRiver(center, radius, rng) : null;
  const wall = params.wallEnabled ? createWall(boundary) : null;
  const gates = params.wallEnabled ? createGatePoints(center, radius, 4, rng) : [];
  gates.forEach((gate, index) => graph.addNode(gate, { key: `gate-${index + 1}`, role: "gate" }));

  const districts = createDistricts(boundary, params.districtCount, rng);
  const { roads } = createMainRoads(center, gates.length ? gates : [polar(center, radius * 0.82, 0), polar(center, radius * 0.82, Math.PI)], districts, rng, graph);
  const cells = [];
  const parcels = [];
  const buildings = [];

  districts.forEach((district) => {
    const districtCells = createCellsForDistrict(district, rng, params.density, params.streetComplexity);
    cells.push(...districtCells);
    districtCells.forEach((cell) => {
      const cellParcels = createParcelsForCell(cell, rng);
      parcels.push(...cellParcels);
      cellParcels.forEach((parcel) => {
        const building = createBuildingForParcel(parcel, rng);
        if (building) {
          buildings.push(building);
          const entranceNode = graph.addNode(building.entrance, { role: "entrance", parcelId: parcel.id });
          const cellNode = graph.addNode(cell.center, { role: "cell", key: cell.id });
          graph.addEdge(entranceNode, cellNode, { type: "parcel-access", costMultiplier: 1.6 });
        }
      });
    });
  });

  roads.push(...addCellRoads(cells, rng, graph));
  const bridges = createBridges(river, gates, rng, graph);
  bridges.forEach((bridge) => roads.push({ id: bridge.id, type: "bridge", width: bridge.width, points: bridge.points }));

  const routeStart = gates[0] ? graph.addNode(gates[0], { key: "gate-1" }) : graph.nodes[0];
  const routeEnd = gates[2] ? graph.addNode(gates[2], { key: "gate-3" }) : graph.nodes[graph.nodes.length - 1];
  const examplePath = routeStart && routeEnd ? shortestPath(graph, routeStart.id, routeEnd.id) : { edges: [], nodes: [], cost: Infinity };

  return {
    params,
    bounds: boundsOf(boundary),
    boundary,
    districts,
    cells,
    parcels,
    buildings,
    features: { river, wall, gates, bridges, market: center },
    roads,
    graph,
    examplePath,
    stats: {
      districts: districts.length,
      cells: cells.length,
      parcels: parcels.length,
      buildings: buildings.length,
      roads: roads.length,
      graphNodes: graph.nodes.length,
      graphEdges: graph.edges.length,
      area: Math.round(Math.abs(polygonArea(boundary))),
    },
  };
}
