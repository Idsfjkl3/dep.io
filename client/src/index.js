
import { connect, play, sendChat, inputs} from './networking';
import { startRendering, stopRendering } from './render';
import { startCapturingInput, stopCapturingInput } from './input';
import { initState } from './state';
import { setLeaderboardHidden } from './leaderboard';
import './css/bootstrap-reboot.css';
import './css/main.css';
var chatting  = false
const playMenu = document.getElementById('play-menu');
const playButton = document.getElementById('play-button');
const usernameInput = document.getElementById('username-input');
usernameInput.value = (localStorage.getItem("username")) ? localStorage.getItem("username") : "";
const adMenu = document.getElementById('ad-menu');
const logoBox = document.getElementById('logobox');
const chat = document.getElementById('chat-container');
const chatinput = document.getElementById('chat-input');
const chat2 = document.getElementById('chat-container2');
const chatenter = document.getElementById('chat-enter');
const urlParams = new URLSearchParams(window.location.search);
const devKey = urlParams.get('devcode');

document.addEventListener("keyup", function(e) {
  var key = e.keyCode || e.which;
  if (!chatting) {
  switch (key) {
    case 32:
      inputs(0)
    break;
    case 40:
      inputs(4)
    break;
    case 38:
      inputs(5)
    break;
  }
  }
});
document.addEventListener("mousedown", function(e) {
  var key = e.button;
  switch (key) {
case 0:
inputs(1)
break;
case 2:
inputs(3)
break;
  }

  });
document.addEventListener("keyup", function(event) {
  if (event.key === "Enter" && adMenu.classList.contains('hidden')) {
    if (!chatting) {
      chat.classList.remove('hidden');
      chat2.classList.remove('hidden');
      chatinput.focus();
    chatting = true;
    } else {
      chat.classList.add('hidden');
      chat2.classList.add('hidden');
      if (chatinput.value != "") sendChat(chatinput.value);
    chatinput.value = ""
      chatting  = false;
    }
  }
});
Promise.all([
  connect(onGameOver),
]).then(() => {
  playMenu.classList.remove('hidden');
  adMenu.classList.remove('hidden');
  logoBox.classList.remove('hidden');
  usernameInput.focus();
  chatenter.onclick = () => {
    sendChat(chatinput.value);
    chatinput.value = ""
  };
  playButton.onclick = () => {
    // Play!
    play(usernameInput.value, devKey);
    localStorage.setItem("username", usernameInput.value)
    playMenu.classList.add('hidden');
    adMenu.classList.add('hidden');
    logoBox.classList.add('hidden');
    initState();
    startCapturingInput();
    startRendering();
    setLeaderboardHidden(false);
  };
}).catch(console.error);

function onGameOver() {
  stopCapturingInput();
  stopRendering();
  playMenu.classList.remove('hidden');
  adMenu.classList.remove('hidden');
  logoBox.classList.remove('hidden');
  setLeaderboardHidden(true);
}
