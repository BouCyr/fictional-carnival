export function hashSeed(seed) {
  const text = String(seed ?? "medieval-city");
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createRng(seed) {
  let state = hashSeed(seed) || 1;
  return {
    next() {
      state += 0x6d2b79f5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    },
    between(min, max) {
      return min + (max - min) * this.next();
    },
    int(min, max) {
      return Math.floor(this.between(min, max + 1));
    },
    pick(items) {
      return items[Math.floor(this.next() * items.length)];
    },
    chance(probability) {
      return this.next() < probability;
    },
  };
}
