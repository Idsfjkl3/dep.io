
import io from 'socket.io-client';
import { throttle } from 'throttle-debounce';
import { processGameUpdate } from './state';

import * as Constants from '../shared/constants';
console.log(Constants.MSG_TYPES.GAME_OVER)
const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
const socket = io(`${socketProtocol}://${"localhost:3000"}`, { reconnection: false });
console.log(window.location.host)
const connectedPromise = new Promise(resolve => {
  socket.on('connect', () => {
    console.log('Connected to server!');
    resolve();
  });
});

export const connect = onGameOver => (
  connectedPromise.then(() => {
    // Register callbacks
    socket.on(Constants.MSG_TYPES.GAME_UPDATE, processGameUpdate);
    socket.on(Constants.MSG_TYPES.GAME_OVER, onGameOver);
    
    socket.on('disconnect', () => {
      console.log('Disconnected from server.');
      document.getElementById('disconnect-modal').classList.remove('hidden');
      document.getElementById('reconnect-button').onclick = () => {
        window.location.reload();
      };
    });
  })
);

export const play = (username, devkey) => {
  socket.emit(Constants.MSG_TYPES.JOIN_GAME, username, devkey);
};
export const sendChat = message => {
  socket.emit(Constants.MSG_TYPES.CHAT, message);
};
export const updateDirection = throttle(20, type => {
  socket.emit(Constants.MSG_TYPES.INPUT, type);
}); 
export const inputs = throttle(20, dir => {
  socket.emit(Constants.MSG_TYPES.INPUTS, dir);
}); 
export const rmc = throttle(20, dir => {
  socket.emit(Constants.MSG_TYPES.RIGHTMOUSECLICK, dir);
}); 
export const upgrade = throttle(20, (ani) => {
  socket.emit(Constants.MSG_TYPES.UPGRADE, ani);
}); 
export const updatePos = throttle(20, (x, y, w, h) => {
  socket.emit(Constants.MSG_TYPES.POS, x, y, w, h);
}); 
