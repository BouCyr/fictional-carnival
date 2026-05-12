import { generateCity } from "./generation/city-generator.js";
import { renderCity } from "./render/svg-renderer.js";
import { validateCity } from "./debug/validation.js";
import { summarizeWarnings } from "./debug/overlays.js";

const controls = document.querySelector("#controls");
const map = document.querySelector("#map");
const stats = document.querySelector("#stats");
const pathReport = document.querySelector("#path-report");

function readOptions() {
  const data = new FormData(controls);
  return {
    seed: data.get("seed"),
    citySize: Number(data.get("citySize")),
    density: Number(data.get("density")),
    districtCount: Number(data.get("districtCount")),
    organicNoise: Number(data.get("organicNoise")),
    streetComplexity: Number(data.get("streetComplexity")),
    wallEnabled: data.has("wallEnabled"),
    riverEnabled: data.has("riverEnabled"),
  };
}

function statRow(label, value) {
  return `<dt>${label}</dt><dd>${value}</dd>`;
}

function updateStats(city, validation) {
  stats.innerHTML = [
    statRow("Quartiers", city.stats.districts),
    statRow("Cellules", city.stats.cells),
    statRow("Parcelles", city.stats.parcels),
    statRow("Bâtiments", city.stats.buildings),
    statRow("Routes / allées", city.stats.roads),
    statRow("Nœuds graphe", city.stats.graphNodes),
    statRow("Arêtes graphe", city.stats.graphEdges),
    statRow("Surface", city.stats.area.toLocaleString("fr-FR")),
    statRow("Validation", validation.ok ? "OK" : `${validation.warnings.length} alerte(s)`),
  ].join("");

  const cost = Number.isFinite(city.examplePath.cost) ? Math.round(city.examplePath.cost) : "indisponible";
  pathReport.textContent = `Chemin d'exemple : ${city.examplePath.edges.length} segment(s), coût ${cost}. ${summarizeWarnings(validation)}`;
}

function regenerate() {
  const city = generateCity(readOptions());
  window.generatedCity = city;
  const validation = validateCity(city);
  renderCity(map, city);
  updateStats(city, validation);
}

controls.addEventListener("submit", (event) => {
  event.preventDefault();
  regenerate();
});

controls.addEventListener("input", () => regenerate());

regenerate();
