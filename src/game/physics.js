export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function length(x, y) {
  return Math.hypot(x, y);
}

export function normalize(x, y) {
  const magnitude = length(x, y);
  if (magnitude === 0) return { x: 0, y: 0 };
  return { x: x / magnitude, y: y / magnitude };
}

export function distanceSquared(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function circleRectCollision(circle, rect) {
  const closestX = clamp(circle.x, rect.x, rect.x + rect.w);
  const closestY = clamp(circle.y, rect.y, rect.y + rect.h);
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  const distanceSq = dx * dx + dy * dy;

  if (distanceSq > circle.radius * circle.radius) {
    return null;
  }

  if (distanceSq > 0.000001) {
    const distance = Math.sqrt(distanceSq);
    return {
      normal: { x: dx / distance, y: dy / distance },
      depth: circle.radius - distance,
    };
  }

  const distances = [
    { distance: Math.abs(circle.x - rect.x), normal: { x: -1, y: 0 } },
    { distance: Math.abs(rect.x + rect.w - circle.x), normal: { x: 1, y: 0 } },
    { distance: Math.abs(circle.y - rect.y), normal: { x: 0, y: -1 } },
    { distance: Math.abs(rect.y + rect.h - circle.y), normal: { x: 0, y: 1 } },
  ];
  const nearest = distances.sort((a, b) => a.distance - b.distance)[0];

  return {
    normal: nearest.normal,
    depth: circle.radius + nearest.distance,
  };
}

export function getLauncherOrigin(width, height, radius) {
  return {
    x: width / 2,
    y: height - Math.max(radius * 2.5, 24),
  };
}

export function circleCircleCollision(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const radius = a.radius + b.radius;
  const distanceSq = dx * dx + dy * dy;

  if (distanceSq >= radius * radius) return null;

  if (distanceSq > 0.000001) {
    const distance = Math.sqrt(distanceSq);
    return {
      normal: { x: dx / distance, y: dy / distance },
      depth: radius - distance,
    };
  }

  return {
    normal: { x: 1, y: 0 },
    depth: radius,
  };
}

export function sweepCircleCircle(from, to, radius, circle) {
  const startHit = circleCircleCollision(
    { x: from.x, y: from.y, radius },
    circle,
  );
  if (startHit) return { ...startHit, x: from.x, y: from.y };

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  const step = Math.max(radius * 0.75, 4);
  const steps = Math.max(1, Math.ceil(distance / step));

  for (let index = 1; index <= steps; index += 1) {
    const t = index / steps;
    const x = from.x + dx * t;
    const y = from.y + dy * t;
    const hit = circleCircleCollision({ x, y, radius }, circle);
    if (hit) return { ...hit, x, y };
  }

  return null;
}

export function sweepCircleRect(from, to, radius, rect) {
  const startHit = circleRectCollision({ x: from.x, y: from.y, radius }, rect);
  if (startHit) return { ...startHit, x: from.x, y: from.y };

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  const step = Math.max(radius * 0.75, 4);
  const steps = Math.max(1, Math.ceil(distance / step));

  for (let index = 1; index <= steps; index += 1) {
    const t = index / steps;
    const x = from.x + dx * t;
    const y = from.y + dy * t;
    const hit = circleRectCollision({ x, y, radius }, rect);
    if (hit) return { ...hit, x, y };
  }

  return null;
}

export function reflectVelocity(velocity, normal, restitution = 1) {
  const dot = velocity.x * normal.x + velocity.y * normal.y;
  if (dot >= 0) return velocity;

  return {
    x: velocity.x - (1 + restitution) * dot * normal.x,
    y: velocity.y - (1 + restitution) * dot * normal.y,
  };
}

export function getHoleCenter(hole, width, height, inset = 0) {
  const t = clamp(Number.isFinite(hole.t) ? hole.t : 0.5, 0, 1);
  const xInset = clamp(inset, 0, width / 2);
  const yInset = clamp(inset, 0, height / 2);

  if (hole.edge === 'left') {
    return { x: xInset, y: clamp(t * height, yInset, height - yInset) };
  }
  if (hole.edge === 'right') {
    return { x: width - xInset, y: clamp(t * height, yInset, height - yInset) };
  }
  if (hole.edge === 'bottom') {
    return { x: clamp(t * width, xInset, width - xInset), y: height - yInset };
  }
  return { x: clamp(t * width, xInset, width - xInset), y: yInset };
}

export function getPolygonVertices(piece) {
  const vertices = [];
  const sides = piece.sides ?? 5;
  const step = (Math.PI * 2) / sides;

  for (let index = 0; index < sides; index += 1) {
    const angle = piece.rotation + step * index;
    vertices.push({
      x: piece.x + Math.cos(angle) * piece.radius,
      y: piece.y + Math.sin(angle) * piece.radius,
    });
  }

  return vertices;
}
