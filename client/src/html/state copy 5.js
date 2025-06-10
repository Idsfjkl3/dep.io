// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#7-client-state
import { updateLeaderboard } from './leaderboard';
import * as Constants from '../shared/constants';
// The "current" state will always be RENDER_DELAY ms behind server time.
// This makes gameplay smoother and lag less noticeable.
const RENDER_DELAY = 0;

const gameUpdates = [];
let lastgameupd;
let newgameupd;
let gameStart = 0;
let firstServerTimestamp = 0;

export function initState() {
  gameStart = 0;
  firstServerTimestamp = 0;
}

export function processGameUpdate(update) {
  if (!firstServerTimestamp) {
    firstServerTimestamp = update.t;
    gameStart = Date.now();
    lastgameupd = update;
  }
  newgameupd = update
  gameUpdates.push(update);

  updateLeaderboard(update.leaderboard);

  // Keep only one game update before the current server time
  const base = getBaseUpdate();
  if (base > 0) {
    gameUpdates.splice(0, base);
  }
}

function currentServerTime() {
  return firstServerTimestamp + (Date.now() - gameStart) - RENDER_DELAY;
}

// Returns the index of the base update, the first game update before
// current server time, or -1 if N/A.
function getBaseUpdate() {
  const serverTime = currentServerTime();
  for (let i = gameUpdates.length - 1; i >= 0; i--) {
    if (gameUpdates[i].t <= serverTime) {
      return i;
    }
  }
  return -1;
}

// Returns { me, others, bullets }
export function getCurrentState() {
  if (!firstServerTimestamp) {
    return {};
  }

  // If base is the most recent update we have, use its state.
  // Otherwise, interpolate between its state and the state of (base + 1).

    const baseUpdate = lastgameupd;
    const next = newgameupd;
    const ratio = 0.125;

    const fd = {
      me: interpolateObject(baseUpdate.me, next.me, ratio),
      spec: baseUpdate.spec,
      others: interpolateObjectArray(baseUpdate.others, next.others, ratio),
      bullets: interpolateObjectArray(baseUpdate.bullets, next.bullets, ratio),
    }
    lastgameupd = fd
    
    const scaleRatio = Math.max(1, 800 / window.innerWidth);
    var w = scaleRatio * window.innerWidth;
    var h = scaleRatio * window.innerHeight;
        if (fd.me.x < w/2) {
          fd.me.camx = w/2
          } else if (fd.me.x > Constants.MAP_SIZE_W - w/2) {
            fd.me.camx = Constants.MAP_SIZE_W - w/2
            } else {
            fd.me.camx = fd.me.x
            }
            
            if (fd.me.y < h/2) {
              fd.me.camy = h/2
              } else if (fd.me.y > Constants.MAP_SIZE_H - h/2) {
                fd.me.camy = Constants.MAP_SIZE_H - h/2
                } else {
                fd.me.camy = fd.me.y
                }
                console.log(baseUpdate.me.aniType)
        return fd;
  
}

function interpolateObject(object1, object2, ratio) {
  if (!object2) {
    return object1;
  }
  const interpolated = {};
  Object.keys(object1).forEach(key => {
    if (key === 'direction') {
      interpolated[key] = interpolateDirection(object1[key], object2[key], ratio);
    } else if (key === 'x' || key === 'y' || key === 'camx' || key === 'camy' || key === 'radius' || key === 'trans'
       || key === 'chargetime' || key === 'rchargetime' || key === 'speed') {
      interpolated[key] = object1[key] + (object2[key] - object1[key]) * ratio;
    } else {
      interpolated[key] = object2[key]
    }
});
  return interpolated;
}

function interpolateObjectArray(objects1, objects2, ratio) {
  const result = [];

  const matchedIds = new Set();

  // Interpolate objects that exist in both arrays
  for (const o1 of objects1) {
    const o2 = objects2.find(o => o.id === o1.id);
    if (o2) {
      result.push(interpolateObject(o1, o2, ratio));
      matchedIds.add(o1.id);
    }
  }

  // Add objects that only exist in objects2
  for (const o2 of objects2) {
    if (!matchedIds.has(o2.id)) {
      result.push(o2);
    }
  }

  return result;
}
// Determines the best way to rotate (cw or ccw) when interpolating a direction.
// For example, when rotating from -3 radians to +3 radians, we should really rotate from
// -3 radians to +3 - 2pi radians.
function interpolateDirection(d1, d2, ratio) {
  const absD = Math.abs(d2 - d1);
  if (absD >= Math.PI) {
    // The angle between the directions is large - we should rotate the other way
    if (d1 > d2) {
      return d1 + (d2 + 2 * Math.PI - d1) * ratio;
    } else {
      return d1 - (d2 - 2 * Math.PI - d1) * ratio;
    }
  } else {
    // Normal interp
    return d1 + (d2 - d1) * ratio;
  }
}