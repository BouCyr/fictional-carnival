import { polygonToPath } from "../geometry/polygon.js";

const SVG_NS = "http://www.w3.org/2000/svg";

function el(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined && value !== null) node.setAttribute(key, value);
  });
  return node;
}

function polylinePoints(points) {
  return points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
}

function appendPolygon(parent, polygon, attrs) {
  parent.append(el("polygon", { points: polygonToPath(polygon), ...attrs }));
}

function appendPolyline(parent, points, attrs) {
  parent.append(el("polyline", { points: polylinePoints(points), ...attrs }));
}

function layer(svg, id) {
  const group = el("g", { id });
  svg.append(group);
  return group;
}

function pathPointsFromEdges(path) {
  const points = [];
  path.edges.forEach((edge, edgeIndex) => {
    const edgePoints = edge.points ?? [];
    edgePoints.forEach((point, pointIndex) => {
      if (edgeIndex > 0 && pointIndex === 0) return;
      points.push(point);
    });
  });
  return points;
}

export function renderCity(container, city) {
  container.replaceChildren();
  const padding = 70;
  const minX = city.bounds.minX - padding;
  const minY = city.bounds.minY - padding;
  const width = city.bounds.maxX - city.bounds.minX + padding * 2;
  const height = city.bounds.maxY - city.bounds.minY + padding * 2;
  const svg = el("svg", {
    viewBox: `${minX} ${minY} ${width} ${height}`,
    role: "img",
    "aria-label": "Ville médiévale générée",
  });

  const defs = el("defs");
  const hatch = el("pattern", { id: "field-hatch", patternUnits: "userSpaceOnUse", width: 12, height: 12, patternTransform: "rotate(35)" });
  hatch.append(el("rect", { width: 12, height: 12, fill: "#a8be72" }));
  hatch.append(el("line", { x1: 0, y1: 0, x2: 0, y2: 12, stroke: "#7f974e", "stroke-width": 2, opacity: 0.5 }));
  defs.append(hatch);
  svg.append(defs);

  appendPolygon(svg, city.boundary, { class: "city-boundary" });

  const districts = layer(svg, "districts");
  city.districts.forEach((district) => {
    appendPolygon(districts, district.polygon, { class: "district-shape", fill: district.color, opacity: 0.72 });
  });

  const parcels = layer(svg, "parcels");
  city.parcels.forEach((parcel) => {
    const className = parcel.use === "field" ? "parcel-shape parcel-field" : parcel.use === "garden" ? "parcel-shape parcel-garden" : parcel.use === "place" ? "parcel-shape parcel-place" : parcel.use === "yard" ? "parcel-shape parcel-yard" : "parcel-shape";
    const fill = parcel.use === "field" ? "url(#field-hatch)" : undefined;
    appendPolygon(parcels, parcel.polygon, { class: className, fill });
  });

  const cells = layer(svg, "cells");
  city.cells.forEach((cell) => appendPolygon(cells, cell.polygon, { class: "cell-shape" }));

  const water = layer(svg, "water");
  if (city.features.river) {
    appendPolyline(water, city.features.river, { class: "river-bank", "stroke-width": 38 });
    appendPolyline(water, city.features.river, { class: "river-line", "stroke-width": 29 });
  }

  const roads = layer(svg, "roads");
  city.roads.forEach((road) => {
    appendPolyline(roads, road.points, { class: "road-edge", "stroke-width": road.width + 4 });
    appendPolyline(roads, road.points, { class: "road-line", "stroke-width": road.width });
  });

  const buildings = layer(svg, "buildings");
  city.buildings.forEach((building) => appendPolygon(buildings, building.polygon, { class: "building-shape" }));

  const defenses = layer(svg, "defenses");
  if (city.features.wall) appendPolyline(defenses, [...city.features.wall, city.features.wall[0]], { class: "wall-line" });
  city.features.gates.forEach((gate) => defenses.append(el("circle", { class: "gate", cx: gate.x, cy: gate.y, r: 12 })));
  city.features.bridges.forEach((bridge) => appendPolyline(defenses, bridge.points, { class: "bridge" }));

  const route = layer(svg, "route");
  const examplePoints = pathPointsFromEdges(city.examplePath);
  if (examplePoints.length > 1) appendPolyline(route, examplePoints, { class: "path-highlight" });

  const labels = layer(svg, "labels");
  city.districts.forEach((district) => {
    const text = el("text", { class: "label", x: district.center.x, y: district.center.y, "text-anchor": "middle" });
    text.textContent = district.type;
    labels.append(text);
  });

  container.append(svg);
}
