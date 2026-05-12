import { pointInPolygon } from "../geometry/polygon.js";
import { polygonSelfIntersects } from "../geometry/intersection.js";

export function validateCity(city) {
  const warnings = [];
  city.districts.forEach((district) => {
    if (polygonSelfIntersects(district.polygon)) warnings.push(`${district.id} est auto-intersecté.`);
  });
  city.cells.forEach((cell) => {
    if (polygonSelfIntersects(cell.polygon)) warnings.push(`${cell.id} est auto-intersecté.`);
    if (!pointInPolygon(cell.center, city.boundary)) warnings.push(`${cell.id} semble hors de l'emprise.`);
  });
  city.parcels.forEach((parcel) => {
    if (polygonSelfIntersects(parcel.polygon)) warnings.push(`${parcel.id} est auto-intersecté.`);
    const cell = city.cells.find((candidate) => candidate.id === parcel.cellId);
    if (cell && !pointInPolygon(parcel.center, cell.polygon)) warnings.push(`${parcel.id} n'est pas centré dans sa cellule.`);
  });
  if (city.features.gates.length >= 2 && city.examplePath.edges.length === 0) warnings.push("Aucun chemin d'exemple entre les portes.");
  return { ok: warnings.length === 0, warnings };
}
