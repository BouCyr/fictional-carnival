import { generateCity } from "../src/generation/city-generator.js";
import { validateCity } from "../src/debug/validation.js";

const city = generateCity({ seed: "ci-validation", citySize: 880, density: 0.68, districtCount: 8, wallEnabled: true, riverEnabled: true });
const validation = validateCity(city);

const failures = [];
if (city.districts.length < 5) failures.push("La ville doit contenir au moins cinq quartiers.");
if (city.cells.length <= city.districts.length) failures.push("Les quartiers doivent être divisés en cellules.");
if (city.parcels.length <= city.cells.length) failures.push("Les cellules doivent être divisées en parcelles.");
if (city.buildings.length === 0) failures.push("Des bâtiments doivent être placés dans les parcelles.");
if (city.graph.nodes.length === 0 || city.graph.edges.length === 0) failures.push("Le graphe de circulation doit contenir nœuds et arêtes.");
if (!Number.isFinite(city.examplePath.cost) || city.examplePath.edges.length === 0) failures.push("Un chemin d'exemple doit être calculable entre deux portes.");
if (!validation.ok) failures.push(...validation.warnings);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Ville validée: ${city.districts.length} quartiers, ${city.cells.length} cellules, ${city.parcels.length} parcelles, ${city.buildings.length} bâtiments.`);
