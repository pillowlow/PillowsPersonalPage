import { getPaletteKey, palette, theme } from '../theme';
import {
  circleCircleCollision,
  circleRectCollision,
  clamp,
  distanceSquared,
  getHoleCenter,
  getButtonPanelBottom,
  getLauncherOrigin,
  normalize,
  reflectVelocity,
  sweepCircleCircle,
  sweepCircleRect,
} from './physics';
import { gameLog } from './gameLog';
import { drawGame } from './render';

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
    play: { ...theme.game.play, ...overrides.play },
    gate: {
      ...theme.game.gate,
      ...overrides.gate,
      visual: { ...theme.game.gate.visual, ...overrides.gate?.visual },
      relocation: {
        ...theme.game.gate.relocation,
        ...overrides.gate?.relocation,
      },
    },
    monster: { ...theme.game.monster, ...overrides.monster },
  };
}

export function createGame({
  canvas,
  config: configOverrides,
  getColliders,
  remeasure,
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
    bursts: [],
    holes: config.holes.map((hole) => ({ ...hole })),
    aiming: null,
    lastLaunchAt: null,
    nextPieceId: 1,
    loggedLetters: -1,
    colliders: { version: -1, buttons: [], obstacles: [] },
    score: 0,
    combo: 0,
    portraitColorKey: null,
    paused: false,
    hidden: false,
    reducedMotion: Boolean(reducedMotion),
  };

  let running = false;
  let destroyed = false;
  let listenersAttached = false;
  let animationFrame = null;
  let lastTime = 0;
  let accumulator = 0;
  let isReducedMotion = reducedMotion;

  function getPreset() {
    return config.play;
  }

  function relocateGate(colorKey) {
    const relocation = config.gate?.relocation;
    if (!relocation?.enabled) return;

    const holeIndex = state.holes.findIndex((hole) => hole.color === colorKey);
    if (holeIndex < 0) return;

    const current = state.holes[holeIndex];
    const currentCenter = getHoleCenter(current, state.width, state.height);
    const edges = relocation.edges?.filter((edge) => edge !== 'bottom') ?? ['top', 'left', 'right'];
    const minT = Math.min(relocation.minT ?? 0.12, relocation.maxT ?? 0.88);
    const maxT = Math.max(relocation.minT ?? 0.12, relocation.maxT ?? 0.88);
    const minDistance = Math.min(state.width, state.height) * (relocation.minDistanceRatio ?? 0.16);
    const minDistanceSquared = minDistance * minDistance;
    let bestCandidate = current;
    let bestScore = -Infinity;
    let next = null;

    const isCandidateValid = (candidate) => {
      if (
        candidate.edge === current.edge
        && Math.abs(candidate.t - current.t) < (relocation.minTGap ?? 0.2)
      ) {
        return { valid: false, score: 0 };
      }

      const candidateCenter = getHoleCenter(candidate, state.width, state.height);
      const previousDistanceSquared = distanceSquared(candidateCenter, currentCenter);
      const nearestOtherSquared = state.holes.reduce((nearest, other, index) => {
        if (index === holeIndex) return nearest;
        const otherCenter = getHoleCenter(other, state.width, state.height);
        return Math.min(nearest, distanceSquared(candidateCenter, otherCenter));
      }, Infinity);

      return {
        valid: previousDistanceSquared >= minDistanceSquared
          && nearestOtherSquared >= minDistanceSquared,
        score: Math.min(previousDistanceSquared, nearestOtherSquared),
      };
    };

    for (let attempt = 0; attempt < (relocation.attempts ?? 32); attempt += 1) {
      const candidate = {
        ...current,
        edge: edges[randomInt(0, edges.length - 1)],
        t: minT + Math.random() * (maxT - minT),
      };
      const result = isCandidateValid(candidate);

      if (result.score > bestScore) {
        bestCandidate = candidate;
        bestScore = result.score;
      }
      if (result.valid) {
        next = candidate;
        break;
      }
    }

    next ??= bestCandidate;
    state.holes[holeIndex] = next;
    gameLog('gate relocated', {
      color: colorKey,
      from: `${current.edge}:${current.t.toFixed(2)}`,
      to: `${next.edge}:${next.t.toFixed(2)}`,
    });
  }

  function emit(type, extra = {}) {
    const payload = {
      type,
      score: state.score,
      combo: state.combo,
      ...extra,
    };
    if (type === 'match' || type === 'miss') {
      payload.lastEvent = { type, ...extra };
    }
    onEvent?.(payload);
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

  function syncBoardSize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const dpr = window.devicePixelRatio || 1;
    if (
      Math.abs(width - state.width) > 0.5
      || Math.abs(height - state.height) > 0.5
      || Math.abs(dpr - state.dpr) > 0.01
    ) {
      resize({ width, height, dpr });
    }
  }

  function updateColliders() {
    syncBoardSize();
    remeasure?.();
    const next = getColliders?.();
    if (!next) return;
    state.colliders = next;
    const colored = next.buttons.reduce((sum, button) => sum + button.chars.length, 0);
    if (colored !== state.loggedLetters) {
      state.loggedLetters = colored;
      gameLog('physics colliders', {
        board: `${Math.round(state.width)}x${Math.round(state.height)}`,
        colored,
      });
    }
  }

  function launcherOrigin() {
    return getLauncherOrigin(
      state.width,
      state.height,
      config.piece.radius,
      config.launch,
      getButtonPanelBottom(state.colliders.buttons),
    );
  }

  function canLaunch(now = performance.now()) {
    if (state.lastLaunchAt == null) return true;
    return now - state.lastLaunchAt >= (config.launch.cooldownMs ?? 2000);
  }

  function createPiece(origin, direction, speed, bornAt) {
    const id = state.nextPieceId;
    state.nextPieceId += 1;
    return {
      id,
      x: origin.x,
      y: origin.y,
      vx: direction.x * speed,
      vy: direction.y * speed,
      radius: config.piece.radius,
      sides: randomInt(config.piece.sidesMin, config.piece.sidesMax),
      rotation: Math.random() * Math.PI * 2,
      colorKey: null,
      hitKeys: new Set(),
      resting: false,
      bornAt,
    };
  }

  function removePiece(piece, type, extra = {}) {
    const index = state.pieces.indexOf(piece);
    if (index >= 0) state.pieces.splice(index, 1);
    emit(type, extra);
  }

  function applyMiss(piece, color) {
    state.combo = 0;
    state.score += config.scoring.wrongHole ?? 0;
    removePiece(piece, 'miss', { color });
  }

  function launch(direction, speed) {
    const now = performance.now();
    if (!canLaunch(now)) return;

    state.pieces.push(createPiece(launcherOrigin(), direction, speed, now));
    state.lastLaunchAt = now;
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

    if (!canLaunch()) return;

    const origin = launcherOrigin();
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
    const adjustedDirection = rawDirection.x === 0 && rawDirection.y === 0
      ? { x: 0, y: -1 }
      : rawDirection;
    const distance = Math.hypot(current.x - origin.x, current.y - origin.y);
    const speedMin = config.launch.speedMin ?? 520;
    const speed = clamp(speedMin + distance * 5.2, speedMin, config.launch.speedMax);

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

  function applyCharacterCollision(piece, from) {
    for (const obstacle of state.colliders.obstacles ?? []) {
      const obstacleCircle = obstacle.shape === 'circle'
        ? {
          x: obstacle.center.x,
          y: obstacle.center.y,
          radius: obstacle.radius,
        }
        : null;
      const collision = obstacleCircle
        ? sweepCircleCircle(from, piece, piece.radius, obstacleCircle)
        : sweepCircleRect(from, piece, piece.radius, obstacle.rect);
      if (!collision) continue;

      const travel = normalize(piece.x - from.x, piece.y - from.y);
      const normal = travel.x === 0 && travel.y === 0
        ? collision.normal
        : { x: -travel.x, y: -travel.y };
      let backX = collision.x;
      let backY = collision.y;
      for (let step = 0; step < 24; step += 1) {
        const overlap = obstacleCircle
          ? circleCircleCollision(
            { x: backX, y: backY, radius: piece.radius },
            obstacleCircle,
          )
          : circleRectCollision(
            { x: backX, y: backY, radius: piece.radius },
            obstacle.rect,
          );
        if (!overlap) {
          break;
        }
        backX += normal.x;
        backY += normal.y;
      }

      piece.x = backX + normal.x * 0.5;
      piece.y = backY + normal.y * 0.5;
      const nextVelocity = reflectVelocity(
        { x: piece.vx, y: piece.vy },
        normal,
        getPreset().restitution,
      );
      piece.vx = nextVelocity.x;
      piece.vy = nextVelocity.y;
      let impactColor = piece.colorKey ? palette[piece.colorKey] : '#F4F4F4';
      if (obstacle.id === 'portrait') {
        if (piece.colorKey) {
          state.portraitColorKey = piece.colorKey;
        } else if (state.portraitColorKey) {
          piece.colorKey = state.portraitColorKey;
          emit('recolor', {
            color: state.portraitColorKey,
            source: 'portrait',
          });
        }
        impactColor = state.portraitColorKey
          ? palette[state.portraitColorKey]
          : '#F4F4F4';
        emit('portrait', {
          color: impactColor,
          colorKey: state.portraitColorKey,
        });
      }
      gameLog('obstacle hit', {
        id: obstacle.id,
        color: impactColor,
        piece: `${Math.round(piece.x)},${Math.round(piece.y)}`,
      });
      return true;
    }

    let overlappedButton = null;
    for (const button of state.colliders.buttons) {
      const nearButton = sweepCircleRect(from, piece, piece.radius, button.rect);
      if (nearButton) overlappedButton = button;
      for (const char of button.chars) {
        if (piece.hitKeys.has(char.key)) continue;
        const colorKey = char.colorKey || getPaletteKey(getCharColor?.(char.key));
        if (!colorKey) continue;

        const collision = sweepCircleRect(from, piece, piece.radius, char);
        if (!collision) continue;
        const travel = normalize(piece.x - from.x, piece.y - from.y);
        const normal = travel.x === 0 && travel.y === 0
          ? collision.normal
          : { x: -travel.x, y: -travel.y };
        let backX = collision.x;
        let backY = collision.y;
        for (let step = 0; step < 24; step += 1) {
          if (!circleRectCollision({ x: backX, y: backY, radius: piece.radius }, char)) break;
          backX += normal.x;
          backY += normal.y;
        }
        piece.x = backX + normal.x * 0.5;
        piece.y = backY + normal.y * 0.5;
        const nextVelocity = reflectVelocity(
          { x: piece.vx, y: piece.vy },
          normal,
          getPreset().restitution,
        );
        piece.vx = nextVelocity.x;
        piece.vy = nextVelocity.y;
        gameLog('letter hit', {
          key: char.key,
          colorKey,
          piece: `${Math.round(piece.x)},${Math.round(piece.y)}`,
          letter: `${Math.round(char.x)},${Math.round(char.y)} ${Math.round(char.w)}x${Math.round(char.h)}`,
        });
        piece.colorKey = colorKey;
        piece.hitKeys.add(char.key);
        emit('recolor', { color: colorKey });
        return true;
      }
    }

    if (overlappedButton && !piece.loggedPass) {
      piece.loggedPass = true;
      let closest = Infinity;
      let closestKey = 'none';
      overlappedButton.chars.forEach((char) => {
        const dx = Math.max(char.x - piece.x, 0, piece.x - (char.x + char.w));
        const dy = Math.max(char.y - piece.y, 0, piece.y - (char.y + char.h));
        const distance = Math.hypot(dx, dy);
        if (distance < closest) {
          closest = distance;
          closestKey = char.key;
        }
      });
      gameLog('entered button without a letter hit yet', {
        button: overlappedButton.id,
        chars: overlappedButton.chars.length,
        closestKey,
        closest: Number.isFinite(closest) ? Math.round(closest) : null,
        piece: `${Math.round(piece.x)},${Math.round(piece.y)}`,
      });
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
    const hole = state.holes.find((candidate) => candidate.color === piece.colorKey);
    if (!hole) return;

    const center = getHoleCenter(hole, state.width, state.height);
    const direction = normalize(center.x - piece.x, center.y - piece.y);
    const force = getPreset().magnetStrength * 800 * dt;
    piece.vx += direction.x * force;
    piece.vy += direction.y * force;
  }

  function applyHoleCollision(piece) {
    const holeRadius = piece.radius * (getPreset().holeRadiusMultiplier ?? 1.4);

    for (const hole of state.holes) {
      const center = getHoleCenter(hole, state.width, state.height);
      const captureRadius = holeRadius + piece.radius * 0.85;
      if (distanceSquared(piece, center) > captureRadius * captureRadius) continue;

      if (!piece.colorKey) {
        applyMiss(piece, hole.color);
        return true;
      }

      if (piece.colorKey === hole.color) {
        state.combo += 1;
        state.score += config.scoring.match + Math.max(0, state.combo - 1) * config.scoring.comboStep;
        relocateGate(hole.color);
        removePiece(piece, 'match', { color: hole.color });
      } else {
        applyMiss(piece, hole.color);
      }
      return true;
    }

    return false;
  }

  function resolvePieceCollisions() {
    const pieces = state.pieces;
    const restitution = getPreset().restitution;
    const restSpeed = config.physics.restSpeed;

    for (let i = 0; i < pieces.length; i += 1) {
      for (let j = i + 1; j < pieces.length; j += 1) {
        const a = pieces[i];
        const b = pieces[j];
        const collision = circleCircleCollision(a, b);
        if (!collision) continue;

        const { normal, depth } = collision;
        const correction = depth / 2 + 0.25;
        a.x -= normal.x * correction;
        a.y -= normal.y * correction;
        b.x += normal.x * correction;
        b.y += normal.y * correction;
        a.x = clamp(a.x, a.radius, state.width - a.radius);
        a.y = clamp(a.y, a.radius, state.height - a.radius);
        b.x = clamp(b.x, b.radius, state.width - b.radius);
        b.y = clamp(b.y, b.radius, state.height - b.radius);

        const approach = (a.vx - b.vx) * normal.x + (a.vy - b.vy) * normal.y;
        if (approach > 0) {
          const impulse = (approach * (1 + restitution)) / 2;
          a.vx -= impulse * normal.x;
          a.vy -= impulse * normal.y;
          b.vx += impulse * normal.x;
          b.vy += impulse * normal.y;
        }

        if (Math.hypot(a.vx, a.vy) > restSpeed) a.resting = false;
        if (Math.hypot(b.vx, b.vy) > restSpeed) b.resting = false;

        if (!a.colorKey && b.colorKey) {
          a.colorKey = b.colorKey;
          emit('recolor', { color: b.colorKey });
        } else if (!b.colorKey && a.colorKey) {
          b.colorKey = a.colorKey;
          emit('recolor', { color: a.colorKey });
        }
      }
    }
  }

  function explodePiece(piece, now) {
    state.bursts.push({
      x: piece.x,
      y: piece.y,
      bornAt: now,
      colorKey: piece.colorKey,
    });
    removePiece(piece, 'explode');
  }

  function expirePieces(now) {
    const lifetime = config.piece.lifetimeMs ?? 60000;
    for (let index = state.pieces.length - 1; index >= 0; index -= 1) {
      const piece = state.pieces[index];
      if (now - piece.bornAt >= lifetime) explodePiece(piece, now);
    }
  }

  function pruneBursts(now) {
    const burstMs = config.piece.burstMs ?? 320;
    state.bursts = state.bursts.filter((burst) => now - burst.bornAt < burstMs);
  }

  function cooldownActive(now = performance.now()) {
    if (state.lastLaunchAt == null) return false;
    return now - state.lastLaunchAt < (config.launch.cooldownMs ?? 2000);
  }

  function updatePiece(piece, dt) {
    const preset = getPreset();
    const scaledDt = dt * (isReducedMotion ? 0.6 : preset.timeScale ?? 1);
    applyMagnet(piece, scaledDt);

    const from = { x: piece.x, y: piece.y };
    piece.x += piece.vx * scaledDt;
    piece.y += piece.vy * scaledDt;
    piece.rotation += Math.hypot(piece.vx, piece.vy) * scaledDt * 0.004;

    if (applyHoleCollision(piece)) return;
    applyCharacterCollision(piece, from);
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
    const now = performance.now();
    expirePieces(now);

    const substeps = Math.max(1, config.physics.substeps ?? 1);
    const substepDt = dt / substeps;
    for (let step = 0; step < substeps; step += 1) {
      for (let index = state.pieces.length - 1; index >= 0; index -= 1) {
        const piece = state.pieces[index];
        if (!piece || piece.resting) continue;
        updatePiece(piece, substepDt);
      }
      resolvePieceCollisions();
    }

    pruneBursts(now);
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
    if (
      state.aiming
      || state.pieces.length > 0
      || state.bursts.length > 0
      || cooldownActive()
      || (config.launch.idlePulse && !isReducedMotion)
    ) {
      scheduleFrame();
    }
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

  function setReducedMotion(value) {
    isReducedMotion = Boolean(value);
    state.reducedMotion = isReducedMotion;
    draw();
  }

  function destroy() {
    destroyed = true;
    stop();
    detachListeners();
    state.pieces.length = 0;
    state.bursts.length = 0;
    state.aiming = null;
  }

  return {
    start,
    stop,
    resize,
    setReducedMotion,
    destroy,
  };
}
