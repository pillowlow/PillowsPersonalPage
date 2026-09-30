import { getHoleCenter, getLauncherOrigin, getPolygonVertices, normalize } from './physics';

function drawPixelGrid(context, width, height) {
  context.save();
  context.globalAlpha = 0.14;
  context.strokeStyle = '#F4F4F4';
  context.lineWidth = 1;
  const size = 24;

  for (let x = 0; x <= width; x += size) {
    context.beginPath();
    context.moveTo(x + 0.5, 0);
    context.lineTo(x + 0.5, height);
    context.stroke();
  }

  for (let y = 0; y <= height; y += size) {
    context.beginPath();
    context.moveTo(0, y + 0.5);
    context.lineTo(width, y + 0.5);
    context.stroke();
  }
  context.restore();
}

function drawGate(context, hole, center, radius, color, visual = {}) {
  const angles = {
    top: [0, Math.PI],
    bottom: [Math.PI, Math.PI * 2],
    left: [-Math.PI / 2, Math.PI / 2],
    right: [Math.PI / 2, Math.PI * 1.5],
  };
  const [startAngle, endAngle] = angles[hole.edge] ?? angles.top;
  const innerScale = visual.innerScale ?? 0.62;

  context.save();
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = visual.thickness ?? 2.5;
  context.shadowColor = color;
  context.shadowBlur = 14;

  const start = {
    x: center.x + Math.cos(startAngle) * radius,
    y: center.y + Math.sin(startAngle) * radius,
  };
  const end = {
    x: center.x + Math.cos(endAngle) * radius,
    y: center.y + Math.sin(endAngle) * radius,
  };

  context.beginPath();
  context.moveTo(start.x, start.y);
  context.arc(center.x, center.y, radius, startAngle, endAngle);
  context.lineTo(start.x, start.y);
  context.closePath();
  context.globalAlpha = 0.2;
  context.fill();
  context.globalAlpha = 1;
  context.stroke();

  context.beginPath();
  context.setLineDash([3, 3]);
  context.arc(center.x, center.y, radius * innerScale, startAngle, endAngle);
  context.stroke();
  context.setLineDash([]);

  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.globalAlpha = 0.75;
  context.stroke();
  context.restore();
}

function drawPoolSpot(context, state, config) {
  const { x, y } = getLauncherOrigin(state.width, state.height, config.piece.radius);
  const spotRadius = config.piece.radius * 1.35;
  const cooldownMs = config.launch.cooldownMs ?? 2000;
  const elapsed = state.lastLaunchAt == null
    ? cooldownMs
    : performance.now() - state.lastLaunchAt;
  const ready = elapsed >= cooldownMs;
  const progress = ready ? 1 : Math.max(0, Math.min(1, elapsed / cooldownMs));

  context.save();
  context.strokeStyle = '#F4F4F4';
  context.fillStyle = ready ? 'rgba(244, 244, 244, 0.38)' : 'rgba(244, 244, 244, 0.12)';
  context.lineWidth = 1.5;
  context.beginPath();
  context.arc(x, y, spotRadius, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.fillStyle = '#F4F4F4';
  context.font = '12px "VT323", monospace';
  context.textAlign = 'center';
  context.textBaseline = 'bottom';
  context.fillText('START', x, y - spotRadius - 6);

  if (!ready) {
    context.beginPath();
    context.strokeStyle = '#F6B80E';
    context.lineWidth = 2;
    context.arc(
      x,
      y,
      spotRadius + 4,
      -Math.PI / 2,
      -Math.PI / 2 + progress * Math.PI * 2,
    );
    context.stroke();
  }
  context.restore();
}

function drawBursts(context, state, config, palette) {
  const now = performance.now();
  const burstMs = config.piece.burstMs ?? 320;

  state.bursts.forEach((burst) => {
    const t = (now - burst.bornAt) / burstMs;
    if (t < 0 || t > 1) return;

    const color = burst.colorKey ? palette[burst.colorKey] : '#F4F4F4';
    const radius = config.piece.radius * (1.2 + t * 2.8);

    context.save();
    context.globalAlpha = 1 - t;
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = 1.5;
    context.beginPath();
    context.arc(burst.x, burst.y, radius, 0, Math.PI * 2);
    context.stroke();

    for (let index = 0; index < 6; index += 1) {
      const angle = (Math.PI * 2 * index) / 6;
      const inner = radius * 0.35;
      const outer = radius * 1.15;
      context.beginPath();
      context.moveTo(burst.x + Math.cos(angle) * inner, burst.y + Math.sin(angle) * inner);
      context.lineTo(burst.x + Math.cos(angle) * outer, burst.y + Math.sin(angle) * outer);
      context.stroke();
    }
    context.restore();
  });
}

function drawAimGuide(context, aiming, state, config, color) {
  if (!aiming) return;

  const direction = normalize(
    aiming.current.x - aiming.origin.x,
    aiming.current.y - aiming.origin.y,
  );
  if (direction.x === 0 && direction.y === 0) return;

  const adjustedDirection = direction;
  const maxBounces = config.play?.aimBounces ?? 0;
  const radius = config.piece.radius;
  let start = { ...aiming.origin };
  let remaining = Math.max(state.width, state.height) * 1.5;
  let currentDirection = adjustedDirection;

  context.save();
  context.strokeStyle = color;
  context.globalAlpha = 0.72;
  context.setLineDash([3, 7]);
  context.lineWidth = 1;
  for (let bounce = 0; bounce <= maxBounces && remaining > 0; bounce += 1) {
    const minX = radius;
    const maxX = state.width - radius;
    const minY = radius;
    const maxY = state.height - radius;
    const distanceToX = currentDirection.x > 0
      ? (maxX - start.x) / currentDirection.x
      : currentDirection.x < 0
        ? (minX - start.x) / currentDirection.x
        : Infinity;
    const distanceToY = currentDirection.y > 0
      ? (maxY - start.y) / currentDirection.y
      : currentDirection.y < 0
        ? (minY - start.y) / currentDirection.y
        : Infinity;
    const segmentDistance = Math.min(
      remaining,
      Math.max(1, Math.min(distanceToX, distanceToY)),
    );
    const end = {
      x: start.x + currentDirection.x * segmentDistance,
      y: start.y + currentDirection.y * segmentDistance,
    };

    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();

    remaining -= segmentDistance;
    if (segmentDistance >= Math.min(distanceToX, distanceToY) - 0.5) {
      if (distanceToX < distanceToY) {
        currentDirection = { x: -currentDirection.x, y: currentDirection.y };
      } else {
        currentDirection = { x: currentDirection.x, y: -currentDirection.y };
      }
    }
    start = end;
  }
  context.restore();
}

function drawPiece(context, piece, palette) {
  const color = piece.colorKey ? palette[piece.colorKey] : '#F4F4F4';
  const vertices = getPolygonVertices(piece);

  context.save();
  context.fillStyle = color;
  context.strokeStyle = '#F4F4F4';
  context.lineWidth = 1.5;
  context.shadowColor = color;
  context.shadowBlur = 10;
  context.beginPath();
  vertices.forEach((vertex, index) => {
    if (index === 0) context.moveTo(vertex.x, vertex.y);
    else context.lineTo(vertex.x, vertex.y);
  });
  context.closePath();
  context.fill();
  context.stroke();
  context.restore();
}

function drawMonster(context, state, config) {
  if (!config.monster?.enabled || !config.monster.atlasUrl) return;
  // Reserved for the future 2x2 atlas generated from the supplied monster reference.
  void context;
  void state;
}

export function drawGame(context, state, config, palette) {
  const { width, height, dpr } = state;
  context.save();
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);

  drawPixelGrid(context, width, height);

  const holeRadius = config.piece.radius * (config.play?.holeRadiusMultiplier ?? 1.6);
  const holes = state.holes ?? config.holes;
  holes.forEach((hole) => {
    const center = getHoleCenter(hole, width, height);
    drawGate(context, hole, center, holeRadius, palette[hole.color], config.gate?.visual);
  });

  drawPoolSpot(context, state, config);
  drawAimGuide(context, state.aiming, state, config, '#F4F4F4');
  state.pieces.forEach((piece) => drawPiece(context, piece, palette));
  drawBursts(context, state, config, palette);
  drawMonster(context, state, config);
  context.restore();
}
