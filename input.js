
import { updateDirection } from './networking';
import { updatePos } from './networking';
import { getCurrentState } from './state';
var mousex;
var mousey;
function onMouseInput(e) {
  mousex = e.clientX
  mousey = e.clientY
  handleInput(e.clientX, e.clientY);
}
function onTouchInput(e) {
  const touch = e.touches[0];
  handleInput(touch.clientX, touch.clientY);
}
/*
function handleInput(x, y) {
  const dir = Math.atan2(x - window.innerWidth / 2, window.innerHeight / 2 - y);
  const scaleRatio = Math.max(1, 800 / window.innerWidth);
const canvasW = scaleRatio * window.innerWidth
const canvasH = scaleRatio * window.innerHeight;
  //updateDirection(dir);
  updatePos(x - window.innerWidth / 2, window.innerHeight / 2 - y, canvasW, canvasH);
} */
function handleInput(x, y) {
  var {me} = getCurrentState();
  updatePos(x - window.innerWidth / 2, window.innerHeight / 2 - y, me.camx, me.camy);
}
export function startCapturingInput() {
  window.addEventListener('mousemove', onMouseInput);
  window.addEventListener('click', onMouseInput);
  window.addEventListener('touchstart', onTouchInput);
  window.addEventListener('touchmove', onTouchInput);
}

export function stopCapturingInput() {
  window.removeEventListener('mousemove', onMouseInput);
  window.removeEventListener('click', onMouseInput);
  window.removeEventListener('touchstart', onTouchInput);
  window.removeEventListener('touchmove', onTouchInput);
}
