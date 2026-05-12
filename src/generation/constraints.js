import { point, polar, TAU, wavyPolyline } from "../geometry/primitives.js";
import { regularPolygon } from "../geometry/polygon.js";

export function createCityBoundary(center, radius, rng, organicNoise) {
  return regularPolygon(center, radius, 34, rng.between(0, TAU), (index, angle) => {
    const harmonic = Math.sin(angle * 3 + rng.between(-0.25, 0.25)) * 0.08;
    return 0.82 + rng.next() * 0.28 + harmonic * organicNoise;
  });
}

export function createRiver(center, radius, rng) {
  const side = rng.chance(0.5) ? -1 : 1;
  const start = point(center.x - radius * 1.25, center.y + side * rng.between(-radius * 0.45, radius * 0.15));
  const end = point(center.x + radius * 1.25, center.y + side * rng.between(-radius * 0.15, radius * 0.45));
  return wavyPolyline(start, end, rng, { steps: 12, amplitude: radius * 0.16, bow: rng.between(0, TAU) });
}

export function createWall(boundary) {
  return boundary;
}

export function createGatePoints(center, radius, count, rng) {
  const gates = [];
  const start = rng.between(0, TAU);
  for (let index = 0; index < count; index += 1) {
    gates.push(polar(center, radius * rng.between(0.78, 0.88), start + (TAU * index) / count + rng.between(-0.18, 0.18)));
  }
  return gates;
}
