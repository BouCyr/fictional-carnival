import { add, distance, lerp, point, scale } from "./primitives.js";

export function polygonArea(polygon) {
  let sum = 0;
  for (let index = 0; index < polygon.length; index += 1) {
    const current = polygon[index];
    const next = polygon[(index + 1) % polygon.length];
    sum += current.x * next.y - next.x * current.y;
  }
  return sum / 2;
}

export function centroid(polygon) {
  const area = polygonArea(polygon);
  if (Math.abs(area) < 0.00001) {
    const total = polygon.reduce((acc, item) => add(acc, item), point(0, 0));
    return scale(total, 1 / Math.max(1, polygon.length));
  }
  let cx = 0;
  let cy = 0;
  for (let index = 0; index < polygon.length; index += 1) {
    const current = polygon[index];
    const next = polygon[(index + 1) % polygon.length];
    const cross = current.x * next.y - next.x * current.y;
    cx += (current.x + next.x) * cross;
    cy += (current.y + next.y) * cross;
  }
  return point(cx / (6 * area), cy / (6 * area));
}

export function boundsOf(points) {
  return points.reduce(
    (bounds, item) => ({
      minX: Math.min(bounds.minX, item.x),
      minY: Math.min(bounds.minY, item.y),
      maxX: Math.max(bounds.maxX, item.x),
      maxY: Math.max(bounds.maxY, item.y),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  );
}

export function pointInPolygon(target, polygon) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const a = polygon[index];
    const b = polygon[previous];
    const intersects = a.y > target.y !== b.y > target.y && target.x < ((b.x - a.x) * (target.y - a.y)) / (b.y - a.y) + a.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function regularPolygon(center, radius, sides, startAngle = 0, radiusNoise = () => 1) {
  const vertices = [];
  for (let index = 0; index < sides; index += 1) {
    const angle = startAngle + (Math.PI * 2 * index) / sides;
    const actualRadius = radius * radiusNoise(index, angle);
    vertices.push(point(center.x + Math.cos(angle) * actualRadius, center.y + Math.sin(angle) * actualRadius));
  }
  return vertices;
}

export function insetPolygon(polygon, amount) {
  const center = centroid(polygon);
  return polygon.map((vertex) => {
    const total = distance(vertex, center);
    const factor = total === 0 ? 1 : Math.max(0.05, (total - amount) / total);
    return lerp(center, vertex, factor);
  });
}

export function splitPolygonRadial(polygon, slices, rng, jitterAmount = 0.12) {
  const center = centroid(polygon);
  const parcels = [];
  const count = polygon.length;
  for (let index = 0; index < count; index += 1) {
    const a = polygon[index];
    const b = polygon[(index + 1) % count];
    const mid = lerp(a, b, rng.between(0.38, 0.62));
    const inner = lerp(center, mid, 1 - jitterAmount * rng.next());
    parcels.push([center, a, inner]);
    parcels.push([center, inner, b]);
  }
  return parcels.slice(0, Math.max(3, slices));
}

export function polygonToPath(polygon) {
  return polygon.map((vertex) => `${vertex.x.toFixed(1)},${vertex.y.toFixed(1)}`).join(" ");
}
