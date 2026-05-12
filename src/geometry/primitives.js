export const TAU = Math.PI * 2;

export function point(x, y) {
  return { x, y };
}

export function add(a, b) {
  return point(a.x + b.x, a.y + b.y);
}

export function subtract(a, b) {
  return point(a.x - b.x, a.y - b.y);
}

export function scale(vector, factor) {
  return point(vector.x * factor, vector.y * factor);
}

export function length(vector) {
  return Math.hypot(vector.x, vector.y);
}

export function distance(a, b) {
  return length(subtract(a, b));
}

export function normalize(vector) {
  const value = length(vector);
  return value === 0 ? point(0, 0) : scale(vector, 1 / value);
}

export function perpendicular(vector) {
  return point(-vector.y, vector.x);
}

export function lerp(a, b, t) {
  return point(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
}

export function polar(center, radius, angle) {
  return point(center.x + Math.cos(angle) * radius, center.y + Math.sin(angle) * radius);
}

export function jitter(pointValue, rng, amount) {
  return point(pointValue.x + rng.between(-amount, amount), pointValue.y + rng.between(-amount, amount));
}

export function polylineLength(points) {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) total += distance(points[index - 1], points[index]);
  return total;
}

export function pointAlongPolyline(points, targetDistance) {
  if (points.length === 0) return point(0, 0);
  let traveled = 0;
  for (let index = 1; index < points.length; index += 1) {
    const segmentLength = distance(points[index - 1], points[index]);
    if (traveled + segmentLength >= targetDistance) {
      return lerp(points[index - 1], points[index], (targetDistance - traveled) / segmentLength);
    }
    traveled += segmentLength;
  }
  return points[points.length - 1];
}

export function wavyPolyline(a, b, rng, options = {}) {
  const steps = options.steps ?? 8;
  const amplitude = options.amplitude ?? 35;
  const bow = options.bow ?? 0;
  const direction = subtract(b, a);
  const normal = perpendicular(normalize(direction));
  const points = [];
  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps;
    const base = lerp(a, b, t);
    const taper = Math.sin(Math.PI * t);
    const wave = Math.sin(t * Math.PI * 2 + bow) * amplitude * 0.25;
    const random = rng.between(-amplitude, amplitude) * taper;
    points.push(add(base, scale(normal, wave + random)));
  }
  return points;
}
