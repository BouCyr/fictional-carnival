import { centroid, insetPolygon } from "../geometry/polygon.js";
import { lerp } from "../geometry/primitives.js";

export function createCellsForDistrict(district, rng, density, streetComplexity) {
  const center = centroid(district.polygon);
  const outer = district.polygon.slice(1);
  const cells = [];
  const rings = district.type === "jardins" ? 1 : rng.int(2, 3);
  const usableDensity = Math.max(0.2, Math.min(1, density + district.densityBias));
  const segmentCount = Math.max(3, outer.length - 1);

  function ringT(value) {
    return Math.max(0.08, Math.min(0.98, value));
  }

  for (let ring = 0; ring < rings; ring += 1) {
    const innerT = ring / rings;
    const outerT = (ring + 1) / rings;
    for (let segment = 0; segment < segmentCount; segment += 1) {
      const a = outer[segment % outer.length];
      const b = outer[(segment + 1) % outer.length];
      const p0 = lerp(center, a, ringT(innerT + rng.between(-0.015, 0.015)));
      const p1 = lerp(center, b, ringT(innerT + rng.between(-0.015, 0.015)));
      const p2 = lerp(center, b, ringT(outerT + rng.between(-0.015, 0.015)));
      const p3 = lerp(center, a, ringT(outerT + rng.between(-0.015, 0.015)));
      const polygon = insetPolygon([p0, p1, p2, p3], rng.between(1.5, 4.5));
      cells.push({
        id: `${district.id}-cell-${cells.length + 1}`,
        districtId: district.id,
        type: district.type,
        polygon,
        center: centroid(polygon),
        parcelTarget: Math.max(2, Math.round(rng.between(3, 8) * usableDensity)),
        parcels: [],
      });
    }
  }
  district.cells = cells;
  return cells;
}
