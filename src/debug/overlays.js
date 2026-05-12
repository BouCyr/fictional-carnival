export function summarizeWarnings(validation) {
  return validation.ok ? "Aucune anomalie géométrique majeure détectée." : validation.warnings.slice(0, 5).join(" ");
}
