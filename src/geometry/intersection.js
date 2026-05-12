function orientation(a, b, c) {
  return Math.sign((b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y));
}

function onSegment(a, b, c) {
  return b.x <= Math.max(a.x, c.x) && b.x >= Math.min(a.x, c.x) && b.y <= Math.max(a.y, c.y) && b.y >= Math.min(a.y, c.y);
}

export function segmentsIntersect(a, b, c, d) {
  const o1 = orientation(a, b, c);
  const o2 = orientation(a, b, d);
  const o3 = orientation(c, d, a);
  const o4 = orientation(c, d, b);
  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && onSegment(a, c, b)) return true;
  if (o2 === 0 && onSegment(a, d, b)) return true;
  if (o3 === 0 && onSegment(c, a, d)) return true;
  return o4 === 0 && onSegment(c, b, d);
}

export function polygonSelfIntersects(polygon) {
  for (let a = 0; a < polygon.length; a += 1) {
    const aNext = (a + 1) % polygon.length;
    for (let b = a + 1; b < polygon.length; b += 1) {
      const bNext = (b + 1) % polygon.length;
      if (a === b || aNext === b || bNext === a) continue;
      if (segmentsIntersect(polygon[a], polygon[aNext], polygon[b], polygon[bNext])) return true;
    }
  }
  return false;
}
