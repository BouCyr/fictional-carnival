export function createSpatialIndex(items, getBounds) {
  const entries = items.map((item) => ({ item, bounds: getBounds(item) }));
  return {
    search(bounds) {
      return entries
        .filter((entry) => !(entry.bounds.maxX < bounds.minX || entry.bounds.minX > bounds.maxX || entry.bounds.maxY < bounds.minY || entry.bounds.minY > bounds.maxY))
        .map((entry) => entry.item);
    },
  };
}
