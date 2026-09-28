import { palette, theme } from '../theme';
import {
  circleRectCollision,
  clamp,
  distanceSquared,
  getHoleCenter,
  normalize,
  reflectVelocity,
} from './physics';
import { drawGame } from './render';

const paletteKeys = Object.keys(palette);
const colorToKey = new Map(
  paletteKeys.map((key) => [String(palette[key]).toLowerCase(), key]),
);

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mergeGameConfig(overrides = {}) {
  return {
    ...theme.game,
    ...overrides,
    piece: { ...theme.game.piece, ...overrides.piece },
    physics: { ...theme.game.physics, ...overrides.physics },
    launch: { ...theme.game.launch, ...overrides.launch },
    scoring: { ...theme.game.scoring, ...overrides.scoring },
    presets: { ...theme.game.presets, ...overrides.presets },
    monster: { ...theme.game.monster, ...overrides.monster },
  };
}

function getColorKey(color) {
  if (!color) return null;
  return colorToKey.get(String(color).toLowerCase()) ?? null;
}

export function createGame({
  canvas,
  config: configOverrides,
  getColliders,
  getCharColor,
  onEvent,
  reducedMotion = false,
}) {
  const config = mergeGameConfig(configOverrides);
  const context = canvas.getContext('2d');
  const state = {
    width: 1,
    height: 1,
    dpr: 1,
    pieces: [],
    aiming: null,
    colliders: { version: -1, buttons: [] },
    score: 0,
    combo: 0,
    presetName: 'casual',
    paused: false,
    hidden: false,
  };

  let running = false;
  let destroyed = false;
  let listenersAttached = false;
  let animationFrame = null;
  let lastTime = 0;
  let accumulator = 0;
  let isReducedMotion = reducedMotion;

  function getPreset() {
    return config.presets[state.presetName] ?? config.presets.casual;
  }

  function emit(type, extra = {}) {
    onEvent?.({
      type,
      score: state.score,
      combo: state.combo,
      ...extra,
    });
  }

  function draw() {
    if (!context) return;
    drawGame(context, state, config, palette);
  }

  function scheduleFrame() {
    if (!running || state.hidden || animationFrame !== null) return;
    animationFrame = requestAnimationFrame(frame);
  }

  function wake() {
    lastTime = performance.now();
    scheduleFrame();
  }

  function updateColliders() {
    const next = getColliders?.();
    if (next && next.version !== state.colliders.version) {
      state.colliders = next;
    }
  }

  function launcherOrigin() {
    return {
      x: state.width / 2,
      y: state.height - Math.max(config.piece.radius * 2.5, 24),
    };
  }

  function getPiece() {
    return state.pieces[0] ?? null;
  }

  function createPiece(origin, direction, speed) {
    return {
      x: origin.x,
      y: origin.y,
      vx: direction.x * speed,
      vy: direction.y * speed,
      radius: config.piece.radius,
      sides: randomInt(config.piece.sidesMin, config.piece.sidesMax),
      rotation: Math.random() * Math.PI * 2,
      colorKey: null,
      hitKeys: new Set(),
      shots: 0,
      resting: false,
    };
  }

  function removePiece(type, extra = {}) {
    state.pieces.length = 0;
    emit(type, extra);
  }

  function launch(direction, speed) {
    const preset = getPreset();
    let piece = getPiece();

    if (!piece) {
      piece = createPiece(launcherOrigin(), direction, speed);
      state.pieces.push(piece);
    } else if (piece.resting) {
      piece.vx = direction.x * speed;
      piece.vy = direction.y * speed;
      piece.resting = false;
      piece.hitKeys.clear();
    } else {
      return;
    }

    piece.shots += 1;
    if (piece.shots > (preset.maxShots ?? 3)) {
      removePiece('expire');
      return;
    }

    state.aiming = null;
    wake();
  }

  function getPointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clamp(event.clientX - rect.left, 0, state.width),
      y: clamp(event.clientY - rect.top, 0, state.height),
    };
  }

  function handlePointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return;

    const piece = getPiece();
    if (piece && !piece.resting) return;

    const origin = piece ? { x: piece.x, y: piece.y } : launcherOrigin();
    state.aiming = {
      origin,
      current: getPointerPosition(event),
      pointerId: event.pointerId,
    };
    canvas.setPointerCapture?.(event.pointerId);
    wake();
  }

  function handlePointerMove(event) {
    if (!state.aiming || state.aiming.pointerId !== event.pointerId) return;
    state.aiming.current = getPointerPosition(event);
    wake();
  }

  function handlePointerUp(event) {
    if (!state.aiming || state.aiming.pointerId !== event.pointerId) return;

    const { origin, current } = state.aiming;
    const rawDirection = normalize(current.x - origin.x, current.y - origin.y);
    const direction = rawDirection.x === 0 && rawDirection.y === 0
      ? { x: 0, y: -1 }
      : rawDirection;
    if (direction.y > -0.12) direction.y = -0.12;

    const adjustedDirection = normalize(direction.x, direction.y);
    const distance = Math.hypot(current.x - origin.x, current.y - origin.y);
    const speed = clamp(220 + distance * 3.4, 220, config.launch.speedMax);

    canvas.releasePointerCapture?.(event.pointerId);
    state.aiming = null;
    launch(adjustedDirection, speed);
    draw();
  }

  function handlePointerCancel(event) {
    if (state.aiming?.pointerId !== event.pointerId) return;
    canvas.releasePointerCapture?.(event.pointerId);
    state.aiming = null;
    draw();
  }

  function handleVisibilityChange() {
    state.hidden = document.hidden;
    if (!state.hidden) {
      wake();
    }
  }

  function attachListeners() {
    if (listenersAttached) return;
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerCancel);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    listenersAttached = true;
  }

  function detachListeners() {
    if (!listenersAttached) return;
    canvas.removeEventListener('pointerdown', handlePointerDown);
    canvas.removeEventListener('pointermove', handlePointerMove);
    canvas.removeEventListener('pointerup', handlePointerUp);
    canvas.removeEventListener('pointercancel', handlePointerCancel);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    listenersAttached = false;
  }

  function applyCharacterCollision(piece) {
    for (const button of state.colliders.buttons) {
      for (const char of button.chars) {
        if (piece.hitKeys.has(char.key)) continue;
        const collision = circleRectCollision(piece, char);
        if (!collision) continue;

        piece.hitKeys.add(char.key);
        piece.x += collision.normal.x * (collision.depth + 0.5);
        piece.y += collision.normal.y * (collision.depth + 0.5);
        const nextVelocity = reflectVelocity(
          { x: piece.vx, y: piece.vy },
          collision.normal,
          getPreset().restitution,
        );
        piece.vx = nextVelocity.x;
        piece.vy = nextVelocity.y;

        const colorKey = getColorKey(getCharColor?.(char.key));
        if (colorKey) {
          piece.colorKey = colorKey;
          emit('recolor', { color: colorKey });
        }
        return true;
      }
    }

    return false;
  }

  function applyWallCollision(piece) {
    const restitution = getPreset().restitution;
    if (piece.x < piece.radius) {
      piece.x = piece.radius;
      piece.vx = Math.abs(piece.vx) * restitution;
    } else if (piece.x > state.width - piece.radius) {
      piece.x = state.width - piece.radius;
      piece.vx = -Math.abs(piece.vx) * restitution;
    }

    if (piece.y < piece.radius) {
      piece.y = piece.radius;
      piece.vy = Math.abs(piece.vy) * restitution;
    } else if (piece.y > state.height - piece.radius) {
      piece.y = state.height - piece.radius;
      piece.vy = -Math.abs(piece.vy) * restitution;
    }
  }

  function applyMagnet(piece, dt) {
    if (!piece.colorKey || !getPreset().magnetStrength) return;
    const hole = config.holes.find((candidate) => candidate.color === piece.colorKey);
    if (!hole) return;

    const center = getHoleCenter(hole, state.width, state.height);
    const direction = normalize(center.x - piece.x, center.y - piece.y);
    const force = getPreset().magnetStrength * 800 * dt;
    piece.vx += direction.x * force;
    piece.vy += direction.y * force;
  }

  function applyHoleCollision(piece) {
    const holeRadius = piece.radius * (getPreset().holeRadiusMultiplier ?? 1.4);

    for (const hole of config.holes) {
      const center = getHoleCenter(hole, state.width, state.height);
      const captureRadius = holeRadius + piece.radius * 0.85;
      if (distanceSquared(piece, center) > captureRadius * captureRadius) continue;

      if (piece.colorKey === hole.color) {
        state.combo += 1;
        state.score += config.scoring.match + Math.max(0, state.combo - 1) * config.scoring.comboStep;
        removePiece('match', { color: hole.color });
      } else {
        state.combo = 0;
        removePiece(piece.colorKey ? 'miss' : 'expire', { color: hole.color });
      }
      return true;
    }

    return false;
  }

  function updatePiece(piece, dt) {
    const preset = getPreset();
    const scaledDt = dt * (isReducedMotion ? 0.6 : preset.timeScale ?? 1);
    applyMagnet(piece, scaledDt);

    piece.x += piece.vx * scaledDt;
    piece.y += piece.vy * scaledDt;
    piece.rotation += Math.hypot(piece.vx, piece.vy) * scaledDt * 0.004;

    if (applyHoleCollision(piece)) return;
    applyCharacterCollision(piece);
    applyWallCollision(piece);

    const friction = Math.pow(config.physics.friction, scaledDt * 60);
    piece.vx *= friction;
    piece.vy *= friction;

    const speed = Math.hypot(piece.vx, piece.vy);
    if (speed <= config.physics.restSpeed) {
      piece.vx = 0;
      piece.vy = 0;
      piece.resting = true;
    }
  }

  function update(dt) {
    updateColliders();
    const piece = getPiece();
    if (!piece || piece.resting) return;

    const substeps = Math.max(1, config.physics.substeps ?? 1);
    const substepDt = dt / substeps;
    for (let index = 0; index < substeps; index += 1) {
      if (!getPiece()) break;
      updatePiece(piece, substepDt);
    }
  }

  function frame(now) {
    animationFrame = null;
    if (!running || state.hidden) return;

    const elapsed = Math.min((now - lastTime) / 1000, config.physics.maxDt);
    lastTime = now;
    accumulator += Number.isFinite(elapsed) ? elapsed : 0;

    let steps = 0;
    while (accumulator >= config.fixedStep && steps < 8) {
      if (!state.paused) update(config.fixedStep);
      accumulator -= config.fixedStep;
      steps += 1;
    }

    draw();
    const piece = getPiece();
    if (state.aiming || (piece && !piece.resting)) scheduleFrame();
  }

  function start() {
    if (destroyed) return;
    running = true;
    attachListeners();
    draw();
    wake();
  }

  function stop() {
    running = false;
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  function resize({ width, height, dpr = 1 }) {
    state.width = Math.max(1, width);
    state.height = Math.max(1, height);
    state.dpr = Math.max(1, Math.min(2, dpr));
    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);
    draw();
  }

  function setPreset(name) {
    if (!config.presets[name]) return;
    state.presetName = name;
    draw();
  }

  function setReducedMotion(value) {
    isReducedMotion = Boolean(value);
    draw();
  }

  function destroy() {
    destroyed = true;
    stop();
    detachListeners();
    state.pieces.length = 0;
    state.aiming = null;
  }

  return {
    start,
    stop,
    resize,
    setPreset,
    setReducedMotion,
    destroy,
  };
}
