import { getHoleCenter, getPolygonVertices, normalize } from './physics';

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

function drawHole(context, center, radius, color) {
  context.save();
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = 2;
  context.shadowColor = color;
  context.shadowBlur = 12;
  context.beginPath();
  context.arc(center.x, center.y, radius, 0, Math.PI * 2);
  context.stroke();
  context.globalAlpha = 0.15;
  context.beginPath();
  context.arc(center.x, center.y, radius * 0.66, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawLauncher(context, width, height, radius) {
  const x = width / 2;
  const y = height - Math.max(radius * 2.5, 24);

  context.save();
  context.strokeStyle = '#F4F4F4';
  context.fillStyle = '#333333';
  context.lineWidth = 2;
  context.beginPath();
  context.rect(x - 18, y + 8, 36, 11);
  context.fill();
  context.stroke();
  context.beginPath();
  context.moveTo(x, y + 8);
  context.lineTo(x, y - 13);
  context.stroke();
  context.restore();
}

function drawAimGuide(context, aiming, state, config, color) {
  if (!aiming) return;

  const direction = normalize(
    aiming.current.x - aiming.origin.x,
    aiming.current.y - aiming.origin.y,
  );
  if (direction.x === 0 && direction.y === 0) return;

  if (direction.y > -0.12) direction.y = -0.12;
  const adjustedDirection = normalize(direction.x, direction.y);
  const preset = config.presets[state.presetName] ?? config.presets.casual;
  const maxBounces = preset.aimBounces ?? 0;
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

  config.holes.forEach((hole) => {
    const center = getHoleCenter(hole, width, height);
    drawHole(context, center, config.piece.radius * 1.8, palette[hole.color]);
  });

  drawLauncher(context, width, height, config.piece.radius);
  drawAimGuide(context, state.aiming, state, config, '#F4F4F4');
  state.pieces.forEach((piece) => drawPiece(context, piece, palette));
  drawMonster(context, state, config);
  context.restore();
}
