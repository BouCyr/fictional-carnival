import { centroid, insetPolygon } from "../geometry/polygon.js";
import { lerp, polar, TAU } from "../geometry/primitives.js";

const DISTRICT_TYPES = ["château", "marchand", "artisanal", "résidentiel", "religieux", "faubourg", "jardins", "résidentiel"];
const COLORS = ["#d9b66f", "#e3be78", "#d5aa6c", "#dfc88e", "#cfba83", "#c9aa70", "#b9bf77", "#e2cd97"];

export function createDistricts(boundary, count, rng) {
  const center = centroid(boundary);
  const inner = insetPolygon(boundary, 18);
  const districts = [];
  const start = rng.between(0, TAU);
  for (let index = 0; index < count; index += 1) {
    const a0 = start + (TAU * index) / count + rng.between(-0.08, 0.08);
    const a1 = start + (TAU * (index + 1)) / count + rng.between(-0.08, 0.08);
    const mid0 = polar(center, 80 + rng.between(-18, 26), a0 + rng.between(-0.08, 0.08));
    const mid1 = polar(center, 82 + rng.between(-18, 26), a1 + rng.between(-0.08, 0.08));
    const outer0 = inner[Math.floor((index / count) * inner.length) % inner.length];
    const outer1 = inner[Math.floor(((index + 1) / count) * inner.length) % inner.length];
    const polygon = [center, mid0, lerp(mid0, outer0, 0.58), outer0, outer1, lerp(outer1, mid1, 0.58), mid1];
    const type = DISTRICT_TYPES[index % DISTRICT_TYPES.length];
    districts.push({
      id: `district-${index + 1}`,
      type,
      color: COLORS[index % COLORS.length],
      polygon,
      center: centroid(polygon),
      densityBias: type === "jardins" || type === "faubourg" ? -0.22 : type === "marchand" ? 0.18 : 0,
      cells: [],
    });
  }
  return districts;
}
