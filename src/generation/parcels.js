import { centroid, insetPolygon, splitPolygonRadial } from "../geometry/polygon.js";
import { lerp } from "../geometry/primitives.js";

function parcelUse(cell, rng) {
  if (cell.type === "jardins") return rng.chance(0.72) ? "field" : "garden";
  if (cell.type === "religieux") return rng.chance(0.42) ? "garden" : "building";
  if (cell.type === "marchand" && rng.chance(0.16)) return "place";
  if (cell.type === "faubourg" && rng.chance(0.36)) return "field";
  return rng.chance(0.72) ? "building" : rng.pick(["garden", "yard", "place"]);
}

export function createParcelsForCell(cell, rng) {
  const raw = splitPolygonRadial(cell.polygon, cell.parcelTarget, rng, 0.18);
  cell.parcels = raw.map((polygon, index) => {
    const safePolygon = insetPolygon(polygon, rng.between(0.8, 2.2));
    return {
      id: `${cell.id}-parcel-${index + 1}`,
      cellId: cell.id,
      districtId: cell.districtId,
      use: parcelUse(cell, rng),
      polygon: safePolygon,
      center: centroid(safePolygon),
      building: null,
    };
  });
  return cell.parcels;
}

export function createBuildingForParcel(parcel, rng) {
  if (parcel.use !== "building") return null;
  const c = centroid(parcel.polygon);
  const footprint = parcel.polygon.map((vertex) => lerp(c, vertex, rng.between(0.42, 0.68)));
  const building = {
    id: `${parcel.id}-building`,
    parcelId: parcel.id,
    use: rng.pick(["maison", "échoppe", "atelier", "entrepôt", "auberge"]),
    floors: rng.int(1, 3),
    polygon: footprint,
    entrance: lerp(c, footprint[0], 0.92),
  };
  parcel.building = building;
  return building;
}
