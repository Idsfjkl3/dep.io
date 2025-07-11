
import { updateLeaderboard } from './leaderboard';
import * as Constants from '../shared/constants';

const RENDER_DELAY = 50;
let dir;
const gameUpdates = [];
let gameStart = 0;
let firstServerTimestamp = 0;

export function initState() {
  gameStart = 0;
  firstServerTimestamp = 0;
}


export function setDir(d) {
  dir = d
}

export function processGameUpdate(update) {
  if (!firstServerTimestamp) {
    firstServerTimestamp = update.t;
    gameStart = Date.now();
  }
  gameUpdates.push(update);

  updateLeaderboard(update.leaderboard);


  const base = getBaseUpdate();
  if (base > 0) {
    gameUpdates.splice(0, base);
  }
}

function currentServerTime() {
  return firstServerTimestamp + (Date.now() - gameStart) - RENDER_DELAY;
}


function getBaseUpdate() {
  const serverTime = currentServerTime();
  for (let i = gameUpdates.length - 1; i >= 0; i--) {
    if (gameUpdates[i].t <= serverTime) {
      return i;
    }
  }
  return -1;
}


export function getCurrentState() {
  if (!firstServerTimestamp) {
    return {};
  }

  const base = getBaseUpdate();
  const serverTime = currentServerTime();


  if (base < 0 || base === gameUpdates.length - 1) {
    return gameUpdates[gameUpdates.length - 1];
  } else {
    const baseUpdate = gameUpdates[base];
    const next = gameUpdates[base + 1];
    const ratio = (serverTime - baseUpdate.t) / (next.t - baseUpdate.t);

    const fd = {
      me: interpolateObject(baseUpdate.me, next.me, ratio),
      spec: baseUpdate.spec,
      others: interpolateObjectArray(baseUpdate.others, next.others, ratio),
      bullets: interpolateObjectArray(baseUpdate.bullets, next.bullets, ratio),
    }
    if (dir && fd.me.rotatespeed == 0) {
      fd.me.direction = dir
    } else {
      console.log(dir)
    }
    
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
    
        return fd;
  }
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
  return objects1.map(o => interpolateObject(o, objects2.find(o2 => o.id === o2.id), ratio));
}


function interpolateDirection(d1, d2, ratio) {
  const absD = Math.abs(d2 - d1);
  if (absD >= Math.PI) {

    if (d1 > d2) {
      return d1 + (d2 + 2 * Math.PI - d1) * ratio;
    } else {
      return d1 - (d2 - 2 * Math.PI - d1) * ratio;
    }
  } else {

    return d1 + (d2 - d1) * ratio;
  }
}