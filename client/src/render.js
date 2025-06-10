
import { debounce } from 'throttle-debounce';
import io from 'socket.io-client';
const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
const socket = io(`${socketProtocol}://${"localhost:3000"}`, { reconnection: false });
import { getCurrentState } from './state';
import { upgrade } from './networking';
import { inputs } from './networking';
//import { MAP_SIZE_W, MAP_SIZE_H } from '../shared/constants';
import * as Constants from '../shared/constants';
//const { PLAYER_RADIUS, PLAYER_MAX_HP, BULLET_RADIUS, MAP_SIZE_W, MAP_SIZE_H } = Constants;
var MAP_SIZE_W = Constants.MAP_SIZE_W
var MAP_SIZE_H = Constants.MAP_SIZE_H
var loadedAudio = {};
var objsounds = [];
var musicts = Date.now()
var loadedImgs = {};
var getLazyLoadAudio = function(theUrl) {
  theUrl = "../../assets/" + theUrl
  //start loading audio (if it's not muted!)
  if (!loadedAudio.hasOwnProperty(theUrl)) {
    //start loading if not loaded
    var newAudio = new Audio(theUrl);
   // console.log("loading audio: " + theUrl);
    loadedAudio[theUrl] = newAudio;

    /*if (theUrl == menuMusicURL) { //loop menu music!
        newAudio.addEventListener('ended', function() {
            this.currentTime = 0; //restart on music end
            try {
                this.play();
            } catch (err) {}
        }, false);
    }*/
    //newAudio.volume = 0.7;
    //newAudio.muted = options_musicMuted;
  }
  return loadedAudio[theUrl];
};
var getAsset = function(imgUrl) {
  if (imgUrl.indexOf(".mp3") != -1) {
   getLazyLoadAudio(imgUrl)
   return;
  }
  imgUrl = "../../assets/" + imgUrl
  if (!loadedImgs.hasOwnProperty(imgUrl)) {
    loadedImgs[imgUrl] = new Image();
    loadedImgs[imgUrl].src = imgUrl;;
  }
  if (0 != loadedImgs[imgUrl].width && loadedImgs[imgUrl].complete) {
    return loadedImgs[imgUrl];
  } else {
    return null;
  }
};
var oceanmusic = getAsset('ocean.mp3')
var oceanskymusic = getAsset('oceansky.mp3')
function rotate (cx, cy, x, y, angle, anticlock_wise) {
  if (angle == 0) {
      return { x: parseFloat(x), y: parseFloat(y) };
  } if (anticlock_wise) {
      var radians = angle * -1;
  } else {
      var radians = angle;
  }
  radians *= (Math.PI / 180)
  var cos = Math.cos(radians);
  var sin = Math.sin(radians);
  var nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
  var ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
  return { x: nx, y: ny };
}
// Get the canvas graphics context
const canvas = document.getElementById('game-canvas');
var scaleRatio = 0
const ctx = canvas.getContext('2d');
/*
var chatInp = document.getElementById("chatinput");
chatInp.style.marginTop = window.innerHeight / 2 - 50 + "px";
chatInp.style.visibility = "visible";
chatInp.focus();*/
setCanvasDimensions();

function setCanvasDimensions() {
  // On small screens (e.g. phones), we want to "zoom out" so players can still see at least
  // 800 in-game units of width.
  //const scaleRatio = Math.max(1, 800 / window.innerWidth);
  scaleRatio = Math.max(1, 800 / window.innerWidth);
  canvas.width = scaleRatio * window.innerWidth;
  canvas.height = scaleRatio * window.innerHeight;
}

window.addEventListener('resize', debounce(40, setCanvasDimensions));
var upgrades = []
let animationFrameRequestId;
const connectedPromise = new Promise(resolve => {
  socket.on('disconnect', () => {
    console.log('Connected to serverASFSADD!');
    resolve();
  });
});

document.addEventListener("mouseup", function(e) {
  var upgrad = false
  var key = e.button;
  switch (key) {
case 0:
  for (var i = 0; i < upgrades.length; i += 5) {
    
    if (e.clientX > upgrades[i+0] && e.clientX < upgrades[i+0] + upgrades[i+2] &&
      e.clientY > upgrades[i+1] && e.clientY < upgrades[i+1] + upgrades[i+3]) {
  upgrad = true
    upgrade(upgrades[i+4])
  }
}
if (!upgrad) {
inputs(0)
}
break;
case 2:
inputs(2)
break;
  }

  });

function render() {
  var { me, others, bullets, spec} = getCurrentState();
  //console.log(spec)
  upgrades = []
  if (me) {
    if (!oceanmusic) oceanmusic = getLazyLoadAudio('ocean.mp3')
      if (!oceanskymusic) oceanskymusic = getLazyLoadAudio('oceansky.mp3')
        if (!spec) {
    if (oceanmusic && oceanskymusic) {
          if (me.gravticks > 0) {
          oceanmusic.volume = Math.max(0, 1 - me.gravticks/60)
          oceanskymusic.volume = Math.min(1, me.gravticks/60)
          } else {
            oceanskymusic.volume = Math.max(0, 1 - me.oceanticks/60)
            oceanmusic.volume = Math.min(1, me.oceanticks/60)
          }
          oceanskymusic.play();
          oceanmusic.play();
          if (me.x < canvas.width/2) {
            me.camx = canvas.width/2
            } else if (me.x > MAP_SIZE_W - canvas.width/2) {
              me.camx = MAP_SIZE_W - canvas.width/2
              } else {
              me.camx = me.x
              }
              
              if (me.y < canvas.height/2) {
                me.camy = canvas.height/2
                } else if (me.y > MAP_SIZE_H - canvas.height/2) {
                  me.camy = MAP_SIZE_H - canvas.height/2
                  } else {
                  me.camy = me.y
                  }
                }
              }
    // Draw background
    renderBackground(me.camx, me.camy);

    // Draw boundaries
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.strokeRect(canvas.width / 2 - me.camx, canvas.height / 2 - me.camy, MAP_SIZE_W, MAP_SIZE_H);
    bullets = bullets.concat(others)
    bullets.push(me)
    // Draw all bullets
    for (var b in bullets) {
      bullets[b].z = 0
      switch (bullets[b].type) {
        case 0://bullet
          bullets[b].z = 998
        break;
        case 1://ocean
          bullets[b].z = 0
        break;
        case 2://food
          bullets[b].z = 2
        break;
        case 3://sonar
          bullets[b].z = 997
        break;
        case 4://sonar2
          case 5:
          bullets[b].z = 1001
        break;
        case 6://splash
          bullets[b].z = 2
        break;
        case 7://ocean overlay
         bullets[b].z = 9999
        break;
        case 8://player
        bullets[b].z = 1000
        break;
        case 9://salmon cheer
        bullets[b].z = 997.9
        break;
        case 10://island
        bullets[b].z = 2000
        break;
        case 11://terrian
          bullets[b].z = 2000.1
          break;
          case 12://corpse
          bullets[b].z = 1000
          break;
          case 13://dam
          bullets[b].z = 1.2
          break;
          case 14://hammerhead wall
          bullets[b].z = 999
          break;
          case 15://hammerhead
          bullets[b].z = 1001.9
          break;
          case 16://text
            bullets[b].z = 10000//above everything
          break;
          case 17://salmonbite
             bullets[b].z = 1000
          break;
      }
     } 
    bullets.sort((firstItem, secondItem) => firstItem.z - secondItem.z);
    bullets.forEach(renderObject.bind(null, me));
    // Draw all players
    //renderPlayer(me, me);
    //others.forEach(renderPlayer.bind(null, me));

    
    renderUi(me, bullets, spec);
  }

  // Rerun this render function on the next frame
  animationFrameRequestId = requestAnimationFrame(render);
}
var drawCircle = function (x, y, rad, col) {
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, rad), 0, Math.PI * 2);
  ctx.fill();
}
function renderUi(me, bullets, spec) {
  if (!spec) {
  renderXpBar(me);
  renderBoosts(me);
  renderBars(me);
  }
  if (me.itime > Date.now()) {
  renderUpMessage(me)
  }
  var up = renderUpgrade(me);
  if (up) {
    upgrades = up
  }
  if (!spec) {
  renderMap(me, bullets)
  }
}
function renderMap(me, bullets) {
  ctx.save();
  //clip here
  ctx.globalAlpha = 0.5
  ctx.fillStyle = 'black';
  var xx = canvas.width + (- 250 + 225/2) * scaleRatio
  var yy = canvas.height + (- 250 + 225/2) * scaleRatio
  var x = Math.min(Math.max(MAP_SIZE_H/2, me.camx), MAP_SIZE_W - MAP_SIZE_H/2)
  ctx.fillRect(canvas.width - 250 * scaleRatio, canvas.height - 250 * scaleRatio, 225 * scaleRatio, 225 * scaleRatio);
  var region = new Path2D();
  region.rect(canvas.width - 250 * scaleRatio, canvas.height - 250 * scaleRatio, 225 * scaleRatio, 225 * scaleRatio);
  ctx.clip(region);
  ctx.globalAlpha = 1
  ctx.save();
  for (var b in bullets) {
    
   if (bullets[b].type == 10 || bullets[b].type == 11) {
    ctx.save();
    ctx.fillStyle = 'white';
    //if (bullets[b].type == 10) {ctx.fillStyle = '#ECDC9A'}
    //if (bullets[b].type == 11) {ctx.fillStyle = '#372217'}
    ctx.translate(xx + (bullets[b].x - x)/(MAP_SIZE_H/225) * scaleRatio, yy + (bullets[b].y - MAP_SIZE_H/2)/(MAP_SIZE_H/225) * scaleRatio)
    crePolygonVMap(bullets[b].vert, (MAP_SIZE_H/225)/scaleRatio)

    ctx.restore();
   }
  }
  ctx.restore();
    ctx.globalAlpha = 0.5
  ctx.fillStyle = 'white';
  var sdfg = (me.y - MAP_SIZE_H/2)/(MAP_SIZE_H/225)
  drawCircle(xx + (me.x - x)/(MAP_SIZE_H/225) * scaleRatio,yy + sdfg * scaleRatio,2.5 * scaleRatio,'white')
  ctx.globalAlpha = 1
  ctx.restore();
}

function renderBars(me) {
  if (me.oxygenper < 1) {
  ctx.fillStyle = "#ffffff";
  ctx.globalAlpha = 0.3
  ctx.beginPath();
  ctx.roundRect(canvas.width/2 - 160/2 * scaleRatio, canvas.height * 0.96 - 52 * scaleRatio, 160 * scaleRatio, 30 * scaleRatio, [8]);
  ctx.fill();
  ctx.globalAlpha = 0.9
  ctx.fillStyle = '#4298f5';
  ctx.beginPath();
  ctx.roundRect(canvas.width/2 - 160/2 * scaleRatio, canvas.height * 0.96 - 52 * scaleRatio, 160 * me.oxygenper * scaleRatio, 30 * scaleRatio, [8]);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = 16 * scaleRatio + 'px Roboto';
  var text = "Oxygen"
  var metrics = ctx.measureText(text)
  var actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  ctx.fillText(text, canvas.width/2 - metrics.width/2, canvas.height * 0.96 - 52 * scaleRatio + 15 * scaleRatio + actualHeight/2);
  ctx.globalAlpha = 1
  }
}
function renderUpMessage(me) {
  var s = scaleRatio
  var text = "You swim faster when close to other clownfish! You can also hide in anemones!"
  switch (me.aniType) {
    case 0:
text = "You swim faster when close to other clownfish! You can also hide in anemones!"
    break;
    case 1:
      text = "You are a bad swimmer... But you can breathe air and walk on land!"
     break;
     case 2:
     text = "You swim in pulsating motions and can poison animals you touch!"
     break;
     case 3:
     text = "You can break crabs tough armor! You can also hide from predators by staying still (only when you arent damaged for 3 seconds)"
     break;
     case 4:
     text = "You can fly fast and fly even faster near the ocean surface! But watch out for oxygen."
     break;
     case 5:
      text = "You can release a short range loud clicks to stun & slow animals around you. Or use a long range variant to gain stat buffs for animals your clicks hit."
      break;
      case 6:
        text = "You are a salmon"
      break;
      case 7:
        text = "You can hide in the seabed to lose opacity and avoid attacks!"
      break;
      case 8:
        text = "You can hide in beaver dams and breathe air!"
      break;
      case 9:
        text = "You are a Sea Turtle! You move in short bursts like a jellyfish and have defense on all sides!"
      break;
      case 10:
        text = "You are an Hammerhead Shark! You are a tanky creature that can make a wall. Headbutting terrian with it will make an aoe. (TIP: Use your ability on hiding animals to move them)"
      break;
      case 11:
        text = "You are a " + me.name + "! You are a small shark that can go into a frenzy, sacrificing bulk for speed and damage"
      break;
      case 12:
        text = "You have monsterous bulk and strength, charge your boost to rush animals."
      break;
      case 13:
        text = "You are a " + me.name + "! you can home animals increasing your attack and dive in the water to increase your speed (stackable x2)"
      break;
      case 14:
        text = "You are a " + me.name + "! You can dive elegantly in the water to heal health and gain speed (stackable x3)"
      break;
      case 15:
        text = "You are a " + me.name + "! You can grab players and throw them around!"
      break;
      case 16:
        text = "You are a " + me.name + "! You can puff up in size making you very bouncy and changing your boost!"
      break;
      case 17:
        text = "You are a " + me.name + "! You can puff up in size making you very bouncy and changing your boost!"
      break;
      case 18:
        text = "You are a " + me.name + "! You can dive elegantly in the water to deal more damage and gain speed (stackable x3)"
      break;
      case 19:
        text = "You are a " + me.name + "! You can boost backwards and punch with both fists!"
      break;
      case 20:
        text = "You are a " + me.name + "! You can release a aura of poison dealing toxic poison"
      break;
      case 21:
        text = "You are a " + me.name + "! You can dig in the soil and boost to lay mines behind you"
      break;
      case 22:
        text = "You are a " + me.name + "! You can go near terrian to gain invisibility and speed"
      break;
      case 23:
        text = "You are a " + me.name + "! You can glide elegantly in the air"
      break;
      case 24:
        text = "You are a " + me.name + "! You can dig in the soil!"
      break;
      case 25:
        text = "順転と反転 それぞれの無限を衝突させることで生成される仮想の質量を押し出す 虚式 「茈」"
      break;
      case 26:
        text = "You are a " + me.name + "! As a bird, left and right clicking changes your speed, but don't let your boost reach zero!"
      break;
  }
var metrics = ctx.measureText(text)
var actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
ctx.font = 16 * scaleRatio + 'px Roboto';
ctx.fillStyle = "#000000";
ctx.globalAlpha = 0.3
ctx.fillRect(window.innerWidth * s/2 - (ctx.measureText(text).width + 30)/2, window.innerHeight * s * 0.6 - (actualHeight + 30)/2, metrics.width * s + 30 * s, actualHeight * s + 30 * s)
ctx.fillStyle = "#ffffff";
ctx.globalAlpha = 1
ctx.fillText(text, window.innerWidth * s/2 - ctx.measureText(text).width/2, window.innerHeight * s * 0.6 + actualHeight/2 * s);
}

function renderBoosts(me) {
  var s = scaleRatio
  for (var i = 0; i < me.maxboosts; i++) {
    if (me.boosts - i > 0) {
      
      ctx.fillStyle = '#00ff00';
      if (me.boosts - i >= 1) {
  ctx.fillRect(15, canvas.height * 0.925 + (- 100/2 - (120 * i)) * s, 20 * s, 100 * s);
      } else {
        var b = me.boosts - i
        ctx.fillStyle = '#000000';
        ctx.globalAlpha = 0.3
        ctx.fillRect(15, canvas.height * 0.925 + (- 100/2 - (120 * i)) * s, 20 * s, 100 * (1 - b) * s);
        ctx.globalAlpha = 1
        ctx.fillStyle = '#4298f5';
        ctx.fillRect(15, canvas.height * 0.925 + (- 100/2 - (120 * i)) * s + 100 * (1 - b) * s, 20 * s, 100 * (b) * s);
      }
    } else {
      ctx.fillStyle = '#000000';
      ctx.globalAlpha = 0.3
      ctx.fillRect(15, canvas.height * 0.925 + (- 100/2 - (120 * i)) * s, 20 * s, 100 * s);
      ctx.globalAlpha = 1
    }

  }

}


function renderXpBar(me) {
  var xp = Math.round(me.xp, 1)
  var maxxp = Math.max(0, Math.round((me.maxEXP - me.xp), 1))
if (me.xp >= 1000) {
  xp = Math.round(me.xp/100)/10 + "k"
}
if ((me.maxEXP - me.xp) > 1000) {
  maxxp = Math.max(0, Math.round((me.maxEXP - me.xp)/100)/10) + "k"
}

  var name = "You are a " + me.name + " - " + xp + " xp (" + maxxp + " xp left)" 
  ctx.fillStyle = "#ffffff";
  ctx.globalAlpha = 0.3;
  ctx.fillRect(window.innerWidth/2 - window.innerWidth * 0.5/2, window.innerHeight * 0.96 - 15, window.innerWidth * 0.5, 30);
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = "#00ff00";
  ctx.fillRect(window.innerWidth/2 - window.innerWidth * 0.5/2, window.innerHeight * 0.96 - 15, window.innerWidth * 0.5 * Math.min(1, me.xp/me.maxEXP), 30);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#ffffff";
  ctx.font = '16px Roboto';
  ctx.fillText(name, window.innerWidth/2 - ctx.measureText(name).width/2, window.innerHeight * 0.965);
}

function renderUpgrade(me) {
  if (!me.upgrades.length) return false;
var u = []
  ctx.fillStyle = "#000000";
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.roundRect(window.innerWidth/2 - 150 - (me.upgrades.length - 1) * 35, 0, 300 + (me.upgrades.length - 1) * 70, 150, [10]);  //ctx.fillRect(window.innerWidth/2 - 150, 0, 300, 150);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#ffffff";
  ctx.font = '16px Roboto';
  ctx.fillText("choose your next animal", window.innerWidth/2 - 125, 20);
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.roundRect(window.innerWidth/2 - 75 - (me.upgrades.length - 1) * 35, 30, 150 + (me.upgrades.length - 1) * 70, 100, [10]);
  ctx.fill();
  ctx.globalAlpha = 1;
  for (var i = 0; i < me.upgrades.length; i++) {
  var img = getAsset(me.upgrades[i] + '.png')
  var exH = 1;
var exW = 1;
var exX = 1;
var exY = 1;
if (me.upgrades[i] == 5) {
  exH = 1.0587431694
} else if (me.upgrades[i] == 6) {
  exH = 1.11986754967
  exW = exX = 1.28113879004
}
if (img) {
  var w = 50
  var h = 50 * img.height/img.width
  var x = window.innerWidth/2 + 10 + ((i - me.upgrades.length/2) * 70)
  var y = 45
  u.push(x,y,w,h,me.upgrades[i])
  ctx.drawImage(
    img,
    x,
    y,
    w,
    h,
  );
}
  }
return u;
} 



function renderBackground(x, y) {
  const backgroundX = MAP_SIZE_W / 2 - x + canvas.width / 2;
  const backgroundY = MAP_SIZE_H / 2 - y + canvas.height / 2;
  const backgroundGradient = ctx.createLinearGradient(
    MAP_SIZE_H/2 - y + canvas.width / 2,
    0 - y + canvas.width / 2,
    MAP_SIZE_H/2 - y + canvas.width / 2,
    MAP_SIZE_H - y + canvas.width / 2,
  );
  backgroundGradient.addColorStop(0, '#cfe9fc');
  backgroundGradient.addColorStop(1, '#87c7f8');
  ctx.fillStyle = backgroundGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function renderBackground2(x, y) {
  const backgroundX = MAP_SIZE_W / 2 - x + canvas.width / 2;
  const backgroundY = MAP_SIZE_H / 2 - y + canvas.height / 2;
  ctx.fillStyle = "#2596be";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function crePolygon(p) {
  ctx.beginPath();
 var j = Math.ceil(p.length/2) 
  for (var i = 0; i < j; i++) {
    var k = i * 2
    if (k == 0) {
      ctx.moveTo(p[k], p[k+1]);
    } else {
      ctx.lineTo(p[k] ,p[k+1]);
    }
ctx.closePath();
ctx.fill();
  }
}
function crePolygonVMap(p, r) {
  ctx.beginPath()
  for (var i = 0; i < p.length; i++) {
    ctx.lineTo(p[i].x/r, p[i].y/r);
  }
  ctx.closePath();
ctx.fill();
}
function crePolygonV(p, g) {
  // Draw main island body
  ctx.beginPath();
  for (var i = 0; i < p.length; i++) {
    ctx.lineTo(p[i].x, p[i].y);
  }
  ctx.closePath();
  //ctx.fillStyle = "#c2b280"; // Sandy/dirt color for the island base
  ctx.fill();
  
  // Find top Y position and overall height
  let minY = p[0].y;
  let maxY = p[0].y;
  let minX = p[0].x;
  let maxX = p[0].x;
  
  for (let i = 1; i < p.length; i++) {
    if (p[i].y < minY) minY = p[i].y;
    if (p[i].y > maxY) maxY = p[i].y;
    if (p[i].x < minX) minX = p[i].x;
    if (p[i].x > maxX) maxX = p[i].x;
  }
  
  // Calculate grass threshold (top 30% of island height)
  const islandHeight = maxY - minY;
  const grassThreshold = minY + (islandHeight * 0.3);
  
  // Create clipping path using the island shape
  ctx.save();
  ctx.beginPath();
  for (var i = 0; i < p.length; i++) {
    ctx.lineTo(p[i].x, p[i].y);
  }
  ctx.closePath();
  ctx.clip();
  
  // Seeded random function
  const seed = 42; // Fixed seed for consistent results
  function seededRandom(seed, index) {
    return (Math.sin(seed * index) * 10000) % 1;
  }
  if (g) {
  // Draw rugged grass with smoother curves
  ctx.beginPath();
  
  // Start at the left edge above the island
  ctx.moveTo(minX - 10, minY - 10);
  
  // Go across the top
  ctx.lineTo(maxX + 10, minY - 10);
  
  // Go down to the grass line
  ctx.lineTo(maxX + 10, grassThreshold);
  
  // Fixed size parameters (non-scaling)
  const fixedJagHeight = 18; // Reduced from 5 to 3 for less spikiness
  const fixedSegmentWidth = 70; // Increased from 15 to 25 for smoother curves
  
  // Calculate number of segments based on fixed width
  const segments = Math.ceil((maxX - minX) / fixedSegmentWidth);
  
  // Use curve control points for smoother transitions
  let prevX = maxX;
  let prevY = grassThreshold;
  
  for (let i = 0; i < segments; i++) {
    const currentX = maxX - (i * fixedSegmentWidth);
    
    // Less dramatic height variations
    const heightVar = (seededRandom(seed, i) - 0.5) * fixedJagHeight;
    const currentY = grassThreshold + heightVar;
    
    // Don't go past the left edge
    if (currentX >= minX) {
      // Use quadratic curves instead of sharp lines for smoother appearance
      const controlX = (prevX + currentX) / 2;
      const controlY = grassThreshold + (seededRandom(seed, i + 100) - 0.5) * fixedJagHeight * 0.8;
      
      ctx.quadraticCurveTo(controlX, controlY, currentX, currentY);
      
      prevX = currentX;
      prevY = currentY;
    } else {
      ctx.lineTo(minX, prevY);
      break;
    }
  }

  
  // Complete the path back to the start
  ctx.lineTo(minX - 10, grassThreshold);
  ctx.lineTo(minX - 10, minY - 10);
  
  ctx.closePath();
  ctx.fillStyle = "#4A7B4A"; // Green color for grass
  ctx.fill();
}
  // Restore the context
  ctx.restore();
}
// Renders a ship at the given coordinates
function renderPlayer(me, player) {
  const { x, y, direction } = player;
  const canvasX = canvas.width / 2 + x - me.camx;
  const canvasY = canvas.height / 2 + y - me.camy;
  // Draw ship

  ctx.save();
  ctx.translate(canvasX, canvasY);
  ctx.rotate(direction);

ctx.globalAlpha = 1 - player.trans
var exH = 1;
var exW = 1;
var exX = 1;
var exY = 1;
switch (player.aniType) {
  case 5:
    exH = 1.0587431694
  break;

 case  6:
  exH = 1.11986754967
  exW = exX = 1.28113879004
  break;

 case 11:
  exH = 1.19411764706
  exW = exX = 1.20555555556
  break;

 case 13:
  exH = exY = 1.23654527876
  exW = exX = 1.19658395102
  break;

  case 16:
if (player.specType == 2) {
    exH = exY = 1.29803921569
    exW = exX = 1.2
} else {
  exH = exY = 1.27058823529
  exW = exX = 1.27944444444
}
  break;
  case 17:
      exH = exY = 1.2431372549
      exW = exX = 1.27777777778
      break;
      case 18:
        exW = exX = 1.18888888889 * 2
        exH = exY = 2
        break;
        case 19:
          exW = exX = 1.36666666667
          exH = exY = 1.28235294118
          break;
          case 20:
            exW = exX = 1.36666666667
            exH = exY = 1.3568627451
          break;
          case 21:
            exW = exX = 1.3
            exH = exY = 1.33921568627
          break;
          case 22:
            exW = exX = 1.28888888889
            exH = exY = 1.18823529412
          break;
          case 23:
            exW = exX = 3.82978723404
            exH = exY = 2.68421052632
          break;
          case 24:
            exW = exX = 1.22222222222
          break;
          case 26:
            case 27:
              case 28:
            exW = exX = 1.53055555556 * 2 * 0.68559837728
            exH = exY = 1.56862745098 * 2
          break;
          case 30:
            exW = exX = 0.9 * 3
            exH = exY = 1.0078431372 * 3
          break;
}
ctx.globalAlpha = 0.5 * (1 - player.trans)
//THIS IS SPEEDTRAIL
var Img = getAsset(player.aniType + (player.specType != 0 ? "-" + player.specType : "") + '.png')
if (!Img) Img = getAsset(0 + '.png')
  if (Img) {
if (player.speedboost > 1) {
if (player.aniType == 2) {
  var pulse = 1 - (Math.min(1, 1 - (player.pulsecd - Date.now())/1000)) * 0.15
  ctx.drawImage(
   Img,
   -(player.width / pulse),
   -player.height + Math.log(player.speedboost + 1) * 30 * player.height/120,
   (player.width / pulse) * 2,
   (player.height * pulse) * 2,
 );
 } else {
 ctx.drawImage(
   Img,
   -player.width * exX,
   -player.height * exY + Math.log(player.speedboost + 1) * 30 * player.height/120,
   player.width * 2 * exW,
   player.height * 2 * exH,
 );
}
}
  
ctx.globalAlpha = 1 - player.trans
//THIS IS SPEEDTRAIL

  if (player.aniType == 2) {
   var pulse = 1 - (Math.min(1, 1 - (player.pulsecd - Date.now())/1000)) * 0.15
   ctx.drawImage(
    Img,
    -(player.width / pulse),
    -player.height,
    (player.width / pulse) * 2,
    (player.height * pulse) * 2,
  );
  } else {
  ctx.drawImage(
     Img,
    -player.width * exX,
    -player.height * exY,
    player.width * 2 * exW,
    player.height * 2 * exH,
  );

}
  }
if (player.stunned) {
ctx.rotate(-direction)
ctx.translate((player.width * 1.1), (-player.height * 1.1))
var rps = 5 / 60;
var rotationTms = 1000 / rps; //ms to one full movement- t=dist * v
var fac0to1 =
  ((Date.now()) % rotationTms) / rotationTms;
var rot = fac0to1 * 2 * Math.PI;
ctx.rotate(rot)
var theImg = getAsset('stun.png')
if (theImg) {
ctx.drawImage(
  theImg,
  -20,
  -20,
  20 * 2,
  20 * 2,
);
}
ctx.rotate(-rot)
ctx.translate(-(player.width * 1.1), -(-player.height * 1.1))
ctx.rotate(direction)
}
if (player.grabbing) {
  var rad = 20
  ctx.rotate(-direction)
  ctx.translate(-rad,-rad)
  var theImg = getAsset('hook.png')
  if (theImg) {
  ctx.drawImage(
    theImg,
    (-player.height - 10 - rad) * Math.sin(-direction),
    (-player.height - 10 - rad) * Math.cos(-direction),
    rad * 2,
    rad * 2,
  );
}
    ctx.translate(rad,rad)
  ctx.rotate(direction)
}
if (me.targetted == player.id) {
  var rps = 5 / 60;
  var rotationTms = 1000 / rps; //ms to one full movement- t=dist * v
  var fac0to1 =
    ((Date.now()) % rotationTms) / rotationTms;
  var rot = fac0to1 * 2 * Math.PI;
  ctx.rotate(rot)
  if (theImg) {
  var theImg = getAsset('target.png')
  ctx.drawImage(
    theImg,
    -Math.max(player.width, player.height) * 1.5,
    -Math.max(player.width, player.height) * 1.5,
    Math.max(player.width, player.height) * 2 * 1.5,
    Math.max(player.width, player.height) * 2 * 1.5,
  );
}
  ctx.rotate(-rot)
}

/*
ctx.fillStyle = "red";
ctx.globalAlpha = 0.5;
ctx.fillRect(-player.width, -player.height, player.width * 2, player.height * 2)
ctx.globalAlpha = 1;
*/
var i = -20
var j = 0
var g = 0
if (player.speedstat != 0) {
i += 20
g++
}
if (player.attackstat != 0) {
  i += 20
  g++
  }
if (player.defensestat != 0) {
  i += 20
  g++
  }
  i = i/Math.max(1, g-1)
  if (player.defensestat != 0) {
    j++
    var k = i * j - i * g + i * g/4
  ctx.rotate(-direction);
  ctx.fillStyle = "#ffffff";
  ctx.font = '14px Roboto';
  var metrics = ctx.measureText("%" + player.defensestat);
  var actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  var theImg = getAsset('defense.png')
  if (theImg) {
  ctx.drawImage(
    theImg,
    10 - player.width * 2 - 35 - metrics.width,
    10 - 8 + k,
    20,
    20,
  )
}
  ctx.fillText("%" + player.defensestat, 10 - player.width * 2 - 25 - ctx.measureText("%" + player.defensestat).width/2, 10 + actualHeight/2 + k);
  ctx.rotate(direction);
  }
if (player.speedstat != 0) {
  j++
 var k = i * j - i * g + i * g/4
ctx.rotate(-direction);
ctx.fillStyle = "#ffffff";
ctx.font = '14px Roboto';
var metrics = ctx.measureText("%" + player.speedstat);
var actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
var theImg = getAsset('speed.png')
if (theImg) {
ctx.drawImage(
  theImg,
  10 - player.width * 2 - 35 - metrics.width,
  10 - 8 + k,
  20,
  20,
)
}
ctx.fillText("%" + player.speedstat, 10 - player.width * 2 - 25 - ctx.measureText("%" + player.speedstat).width/2, 10 + actualHeight/2 + k);
ctx.rotate(direction);
}
if (player.attackstat != 0) {
  j++
  var k = i * j - i * g + i * g/4
ctx.rotate(-direction);
ctx.fillStyle = "#ffffff";
ctx.font = '14px Roboto';
var metrics = ctx.measureText("%" + player.attackstat);
var actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
var theImg = getAsset('attack.png')
if (theImg) {
ctx.drawImage(
  theImg,
  10 - player.width * 2 - 35 - metrics.width,
  10 - 8 + k,
  20,
  20,
)
}
ctx.fillText("%" + player.attackstat, 10 - player.width * 2 - 25 - ctx.measureText("%" + player.attackstat).width/2, 10 + actualHeight/2 + k);
ctx.rotate(direction);
}

  ctx.restore();

  // Draw charge bar
  if (player.holdboosting && player == me) {
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = 'black';
  ctx.fillRect(
    canvasX - 5 - player.width * 2,
    canvasY - 30.5,
    10,
    61,
  );
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#00ff00';
  if (player.chargetime/player.maxchargetime < 1) {
    ctx.fillStyle = '#4298f5';
  }

  ctx.fillRect(
    canvasX - (4.5) - player.width * 2,
    canvasY - (30) + 60 * (1 - player.chargetime/player.maxchargetime),
    9,
    60 * player.chargetime/player.maxchargetime,
  );
}

if (player.rholdboosting && player == me) {
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = 'black';
  ctx.fillRect(
    canvasX + 5 + player.width * 2,
    canvasY - 30.5,
    10,
    61,
  );
  ctx.globalAlpha = 1 - player.trans
  ctx.fillStyle = '#00ff00';
  if (player.rchargetime/player.rmaxchargetime < 1) {
    ctx.fillStyle = '#4298f5';
  }

  ctx.fillRect(
    canvasX + (4.5) + player.width * 2,
    canvasY - (30) + 60 * (1 - player.rchargetime/player.rmaxchargetime),
    9,
    60 * player.rchargetime/player.rmaxchargetime,
  );
}
  // Draw health bar
  ctx.globalAlpha = 0.6 * (1 - player.trans);
  ctx.fillStyle = '#00ff00';
  if (player.bleeding) ctx.fillStyle = '#FF0000';
  if (player.poisoned) ctx.fillStyle = '#a020f0';
  ctx.fillRect(
    canvasX - 28.3333333333,
    canvasY - player.height - 12,
    28.3333333333 * 2 * player.hp / player.maxhp,
    6,
  );
  ctx.globalAlpha = 0.3 * (1 - player.trans);
  ctx.fillStyle = 'black';
  ctx.fillRect(
    canvasX - 28.3333333333 + 28.3333333333 * 2 * player.hp / player.maxhp,
    canvasY - player.height - 12,
    28.3333333333* 2 * (1 - player.hp / player.maxhp),
    6,
  );
  ctx.globalAlpha = 1 - player.trans
  ctx.fillStyle = "#ffffff";
  ctx.font = '16px Roboto';
  ctx.fillText(player.nickname, canvasX - ctx.measureText(player.nickname).width/2, canvasY - player.height - 17);
  var xp = Math.round(player.xp, 1)
if (player.xp >= 1000) {
  xp = Math.round(player.xp/100)/10 + "k"
}
if (player.xp > 0) {
  ctx.font = '12px Roboto';
  ctx.fillText(xp, canvasX - ctx.measureText(xp).width/2, canvasY - player.height - 35);
}

  for (var i = 0; i < player.hpticks.length; i++) {
    if (player.hpticks[i].dmg > 0) {
      ctx.fillStyle = "#00ff00";
    } else {
      ctx.fillStyle = "#FF0000";
    }
  ctx.font = 13 + Math.min(20, Math.floor(Math.abs(player.hpticks[i].dmg/10))) + 'px Roboto';
  var power = (3.8/-((Date.now() - player.hpticks[i].time)/1000+0.25333)+15) * 45/15
  var pos = rotate(0, 0, 0, 0 - power, player.hpticks[i].ang, true)
  ctx.fillText(Math.abs(player.hpticks[i].dmg), canvasX - ctx.measureText(Math.abs(player.hpticks[i].dmg)).width/2 + pos.x, canvasY - player.height - 17 - pos.y);
  }
  ctx.globalAlpha = 1
}

function renderCorpse(me, player) {
  const { x, y, direction } = player;
  const canvasX = canvas.width / 2 + x - me.camx;
  const canvasY = canvas.height / 2 + y - me.camy;
  // Draw ship
  ctx.save();
  ctx.filter = 'grayscale(0.6)';
  ctx.translate(canvasX, canvasY);
  ctx.rotate(direction);
ctx.globalAlpha = 1 - player.trans
var exH = 1;
var exW = 1;
var exX = 1;
var exY = 1;
switch (player.aniType) {
  case 5:
    exH = 1.0587431694
  break;

 case  6:
  exH = 1.11986754967
  exW = exX = 1.28113879004
  break;

 case 11:
  exH = 1.19411764706
  exW = exX = 1.20555555556
  break;

 case 13:
  exH = exY = 1.23654527876
  exW = exX = 1.19658395102
  break;

  case 16:
if (player.specType == 2) {
    exH = exY = 1.29803921569
    exW = exX = 1.2
} else {
  exH = exY = 1.27058823529
  exW = exX = 1.27944444444
}
  break;
  case 17:
      exH = exY = 1.2431372549
      exW = exX = 1.27777777778
      break;
      case 18:
        exW = exX = 1.18888888889 * 2
        exH = exY = 2
        break;
        case 19:
          exW = exX = 1.36666666667
          exH = exY = 1.28235294118
          break;
          case 20:
            exW = exX = 1.36666666667
            exH = exY = 1.3568627451
          break;
          case 21:
            exW = exX = 1.3
            exH = exY = 1.33921568627
          break;
          case 22:
            exW = exX = 1.28888888889
            exH = exY = 1.18823529412
          break;
          case 23:
            exW = exX = 3.82978723404
            exH = exY = 2.68421052632
          break;
          case 24:
            exW = exX = 1.22222222222
          break;
          case 26:
            case 27:
              case 28:
            exW = exX = 1.53055555556 * 2 * 0.68559837728
            exH = exY = 1.56862745098 * 2
          break;
          case 30:
            exW = exX = 0.9 * 3
            exH = exY = 1.0078431372 * 3
          break;
}
   var pulse = 1 - (Math.min(1, 1 - (player.pulsecd - Date.now())/1000)) * 0.15
   var Img = getAsset(player.aniType + '.png')
   if (!Img) Img = getAsset(0 + '.png')
    if (Img) {
  if (player.aniType == 2) {
   ctx.drawImage(
    Img,
    -(player.width / pulse),
    -player.height,
    (player.width / pulse) * 2,
    (player.height * pulse) * 2,
  );
  } else {
  ctx.drawImage(
    Img,
    -player.width * exX,
    -player.height * exY,
    player.width * 2 * exW,
    player.height * 2 * exH,
  );
}
}
ctx.filter = 'grayscale(0)';
  ctx.restore();

  // Draw health bar
  ctx.globalAlpha = 0.6 * (1 - player.trans);
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(
    canvasX - 28.3333333333,
    canvasY - player.height - 12,
    28.3333333333 * 2 * player.hp / player.maxhp,
    6,
  );
  ctx.globalAlpha = 0.3 * (1 - player.trans);
  ctx.fillStyle = 'black';
  ctx.fillRect(
    canvasX - 28.3333333333 + 28.3333333333 * 2 * player.hp / player.maxhp,
    canvasY - player.height - 12,
    28.3333333333* 2 * (1 - player.hp / player.maxhp),
    6,
  );
  ctx.globalAlpha = (1 - player.trans);
  ctx.fillStyle = "#ffffff";
  ctx.font = '16px Roboto';
  ctx.fillText(player.nickname, canvasX - ctx.measureText(player.nickname).width/2, canvasY - player.height - 17);



  for (var i = 0; i < player.hpticks.length; i++) {
    if (player.hpticks[i].dmg > 0) {
      ctx.fillStyle = "#00ff00";
    } else {
      ctx.fillStyle = "#FF0000";
    }
  ctx.font = 13 + Math.min(20, Math.floor(Math.abs(player.hpticks[i].dmg/10))) + 'px Roboto';
  var power = (3.8/-((Date.now() - player.hpticks[i].time)/1000+0.25333)+15) * 45/15
  var pos = rotate(0, 0, 0, 0 - power, player.hpticks[i].ang, true)
  ctx.fillText(Math.abs(player.hpticks[i].dmg), canvasX - ctx.measureText(Math.abs(player.hpticks[i].dmg)).width/2 + pos.x, canvasY - player.height - 17 - pos.y);
  }
}

function renderObject(me, bullet) {
  const { x, y } = bullet;
  if (bullet.radius) {
  var camx = x - me.camx - bullet.radius
  var camy = y - me.camy - bullet.radius
  }
  switch (bullet.type) {
    case 0:
      var theImg = getAsset('bullet.svg')
      if (theImg) {
      ctx.drawImage(
        getAsset('bullet.svg'),
        canvas.width / 2 + camx,
        canvas.height / 2 + camy,
        bullet.radius * 2,
        bullet.radius * 2,
      );
    }
    break;
    case 1:
      var camx = x - me.camx - bullet.w/2
      var camy = y - me.camy - bullet.h/2
      var xx = canvas.width / 2 + camx
      var yy = canvas.height / 2 + camy
      var w = bullet.w
      var h = bullet.h
      var backgroundGradient2 = ctx.createLinearGradient(
        xx/2,
        yy,
        xx/2,
        yy + h,
      );
      backgroundGradient2.addColorStop(0, '#003a62');
      backgroundGradient2.addColorStop(1, '#031d30');
      ctx.fillStyle = backgroundGradient2;
      //ctx.fillRect(bullet.x - bullet.w + camx, bullet.y - bullet.h + camy, bullet.x + bullet.w, bullet.y + bullet.h);
      ctx.fillRect(        
        xx,
        yy,
        w,
        h);
        ctx.globalAlpha = 1
        ctx.fillStyle = "#1F6493"
        ctx.fillRect(xx,yy,w,10)
    break;
    case 2:
      switch (bullet.sType) {
        case 0:
          var theImg = getAsset('food.png')
          if (theImg) {
      ctx.drawImage(
        theImg,
        canvas.width / 2 + camx,
        canvas.height / 2 + camy,
        bullet.radius * 2,
        bullet.radius * 2,
      );
    }
      break;
      case 1:
        var theImg = getAsset('algae.png')
        if (theImg) {
          ctx.drawImage(
            theImg,
            canvas.width / 2 + camx,
            canvas.height / 2 + camy,
            bullet.radius * 2,
            bullet.radius * 2,
          );
        }
      break;
      case 2:
        var theImg = getAsset('barb.png')
        if (theImg) {
          ctx.drawImage(
            theImg,
            canvas.width / 2 + camx,
            canvas.height / 2 + camy,
            bullet.radius * 2,
            bullet.radius * 2,
          );
        }
      break;
      case 3:
        var theImg = getAsset('fruit.png')
        if (theImg) {
          ctx.drawImage(
            theImg,
            canvas.width / 2 + camx,
            canvas.height / 2 + camy,
            bullet.radius * 2,
            bullet.radius * 2,
          );
        }
      break;
      case 4:
        var theImg = getAsset('apple.png')
        if (theImg) {
          ctx.drawImage(
            theImg,
            canvas.width / 2 + camx,
            canvas.height / 2 + camy,
            bullet.radius * 2,
            bullet.radius * 2,
          );
        }
      break;
    }
    break;
    case 3:
      bullet.radius *= Math.min(1, (Date.now() - bullet.spawntime)/225)
      bullet.globalAlpha = Math.min(1, (Date.now() - bullet.spawntime)/225)
      var camx = x - me.camx - bullet.radius
      var camy = y - me.camy - bullet.radius
        var theImg = getAsset('sonar.png')
        if (theImg) {
          ctx.drawImage(
            theImg,
            canvas.width / 2 + camx,
            canvas.height / 2 + camy,
            bullet.radius * 2,
            bullet.radius * 2,
          );
        }
      bullet.globalAlpha = 1
    break;
    case 4:
      bullet.radius *= Math.min(1, (Date.now() - bullet.spawntime)/225)
      bullet.globalAlpha = Math.min(1, (Date.now() - bullet.spawntime)/225)
      var camx = x - me.camx - bullet.radius
      var camy = y - me.camy - bullet.radius
        var theImg = getAsset('sonar2.svg')
        if (theImg) {
          ctx.drawImage(
            theImg,
            canvas.width / 2 + camx,
            canvas.height / 2 + camy,
            bullet.radius * 2,
            bullet.radius * 2,
          );
        }
      bullet.globalAlpha = 1
    break;
    case 5:
      var canvasX = canvas.width / 2 + x - me.camx;
      var canvasY = canvas.height / 2 + y - me.camy;
      ctx.translate((canvasX), (canvasY))
      ctx.rotate(bullet.direction);
        var theImg = getAsset('sonar3.svg')
        if (theImg) {
          ctx.drawImage(
            theImg,
            canvas.width / 2 + camx,
            canvas.height / 2 + camy,
            bullet.radius * 2,
            bullet.radius * 2,
          );
        }
      ctx.rotate(-bullet.direction);
      ctx.translate(-(canvasX), -(canvasY))
      bullet.globalAlpha = 1
    break;
    case 6:
      var canvasX = canvas.width / 2 + x - me.camx;
      var canvasY = canvas.height / 2 + y - me.camy;
      var time = Math.min(2.5, (Date.now() - bullet.spawntime)/800) - 0.45;
      ctx.translate((canvasX), (canvasY))
    //  time -= 0.45
      var theImg = getAsset('splash1.svg')
      var theImg2 = getAsset('splash0.svg')
      if (theImg) {
      if (time > 0) {
      if (time < 0.35) {
        ctx.drawImage(
          theImg,
          -bullet.radius,
          -bullet.radius + bullet.radius * 2 * (1 - Math.min(1, time * (1/0.35))),
          bullet.radius * 2,
          bullet.radius * 2 * Math.min(1, time * (1/0.35)),
        );
      } else if (time < 0.55) {
        ctx.drawImage(
          theImg,
          -bullet.radius,
          -bullet.radius + bullet.radius * 2 * (1 - Math.min(1, 0.35 * (1/0.35))),
          bullet.radius * 2,
          bullet.radius * 2 * Math.min(1, 0.35 * (1/0.35)),
        );
      } else if (time < 0.9) {
        ctx.drawImage(
          theImg,
          -bullet.radius,
          -bullet.radius + bullet.radius * 2 * (Math.min(1, time * (1/0.35) - 0.55/0.35)),
          bullet.radius * 2,
          bullet.radius * 2 * (1 - Math.min(1, time * (1/0.35) - 0.55/0.35)),
        );
      }
    }
  }
    time += 0.45
    if (theImg2) {
      if (time < 0.35) {
      ctx.drawImage(
        theImg2,
        -bullet.radius,
        -bullet.radius + bullet.radius * 2 * (1 - Math.min(1, time * (1/0.35))),
        bullet.radius * 2,
        bullet.radius * 2 * Math.min(1, time * (1/0.35)),
      );
    } else if (time < 0.55) {
      ctx.drawImage(
        theImg2,
        -bullet.radius,
        -bullet.radius + bullet.radius * 2 * (1 - Math.min(1, 0.35 * (1/0.35))),
        bullet.radius * 2,
        bullet.radius * 2 * Math.min(1, 0.35 * (1/0.35)),
      );
    } else if (time < 0.9) {
      ctx.drawImage(
        theImg2,
        -bullet.radius,
        -bullet.radius + bullet.radius * 2 * (Math.min(1, time * (1/0.35) - 0.55/0.35)),
        bullet.radius * 2,
        bullet.radius * 2 * (1 - Math.min(1, time * (1/0.35) - 0.55/0.35)),
      );
    }
  }
      ctx.translate(-(canvasX), -(canvasY))
      bullet.globalAlpha = 1
    break;
    case 7:
      ctx.globalAlpha = 0.3
      var camx = x - me.camx - bullet.w/2
      var camy = y - me.camy - bullet.h/2
      var xx = canvas.width / 2 + camx
      var yy = canvas.height / 2 + camy
      var w = bullet.w
      var h = bullet.h
      var backgroundGradient2 = ctx.createLinearGradient(
        xx/2,
        yy,
        xx/2,
        yy + h,
      );
      backgroundGradient2.addColorStop(0, '#003a62');
      backgroundGradient2.addColorStop(1, '#031d30');
      ctx.fillStyle = backgroundGradient2;
      //ctx.fillRect(bullet.x - bullet.w + camx, bullet.y - bullet.h + camy, bullet.x + bullet.w, bullet.y + bullet.h);
      ctx.fillRect(        
        xx,
        yy + 20,
        w,
        h - 20);
        ctx.globalAlpha = 1
        ctx.fillStyle = "#1F6493"
        ctx.fillRect(xx,yy + 10,w,10)
    break;
    case 8:
      if (me != bullet || !me.spec) {
      renderPlayer(me, bullet)
      }
    break;

    case 9:
      var t = 600
      if (bullet.spawntime > Date.now() - t) {
      bullet.radius *= Math.min(1, (Date.now() - bullet.spawntime)/t)
      bullet.globalAlpha = Math.min(1, (Date.now() - bullet.spawntime)/t)
        } else {
          //bullet.radius *= Math.max(0, 1 - (Date.now() - bullet.spawntime - t)/4500)
        }
      var camx = x - me.camx - bullet.radius
      var camy = y - me.camy - bullet.radius
      var canvasX = canvas.width / 2 + x - me.camx;
      var canvasY = canvas.height / 2 + y - me.camy;
      ctx.translate((canvasX), (canvasY))
      var rot = -Math.PI * Math.max(Date.now() - bullet.spawntime, 0)/2000 * (1 + (Date.now() - bullet.spawntime)/1000)
      ctx.rotate(rot);
      var theImg = getAsset('salmonsd.png')
      if (theImg) {
      ctx.drawImage(
        theImg,
        -bullet.radius,
        -bullet.radius,
        bullet.radius * 2,
        bullet.radius * 2,
      );
    }
      ctx.rotate(-rot);
      ctx.translate(-(canvasX), -(canvasY))
      bullet.globalAlpha = 1
    break;

    case 10:
      var camx = x-me.camx - bullet.w/2
      var camy = y-me.camy - bullet.h/2
      var xx = canvas.width / 2 + camx
      var yy = canvas.height / 2 + camy
      var w = bullet.w
      var h = bullet.h
      if (me.digging) ctx.globalAlpha = 0.75
      ctx.fillStyle = bullet.sType == 1 ? "#c2b280" :'#ECDC9A';
      ctx.translate(xx + w/2, yy + h/2)
      crePolygonV(bullet.vert, (bullet.sType == 1))
      ctx.translate(-xx - w/2, -yy - h/2)
      if (me.digging) ctx.globalAlpha = 1
      break;
      case 11:
        var camx = x-me.camx - bullet.w/2
        var camy = y-me.camy - bullet.h/2
        var xx = canvas.width / 2 + camx
        var yy = canvas.height / 2 + camy
        var w = bullet.w
        var h = bullet.h
        if (me.digging) ctx.globalAlpha = 0.75
        var theImg = getAsset('terrain.png')
        if (theImg) {
var terrain = ctx.createPattern(theImg, "repeat")
        }
        ctx.fillStyle = terrain;
        ctx.translate(xx + w/2, yy + h/2)
        crePolygonV(bullet.vert)
        ctx.translate(-xx - w/2, -yy - h/2)
        if (me.digging) ctx.globalAlpha = 1
        break;
        case 12:
          renderCorpse(me, bullet)
        break;
        case 13:
          var theImg = getAsset('beaverdam.png')
          if (theImg) {
          ctx.drawImage(
            theImg,
            canvas.width / 2 + camx,
            canvas.height / 2 + camy,
            bullet.radius * 2,
            bullet.radius * 2,
          );
        }
        break;
        case 14:
          var camx = x-me.camx - bullet.radius/2
          var camy = y-me.camy - bullet.radius/10
          var xx = canvas.width / 2 + camx
          var yy = canvas.height / 2 + camy
          var canvasX = canvas.width / 2 + x - me.camx;
          var canvasY = canvas.height / 2 + y - me.camy;
          ctx.translate((canvasX), (canvasY))
          ctx.rotate(bullet.direction);
      var theImg = getAsset('hammerheadwall.svg')
      if (theImg) {
      ctx.drawImage(
        theImg,
        -bullet.radius,
        -bullet.radius/5,
        bullet.radius * 2,
        bullet.radius/5 * 2,
      );
    }
          ctx.rotate(-bullet.direction);
          ctx.translate(-(canvasX), -(canvasY))
        break;
        case 15:
          var camx = x - me.camx - bullet.radius
          var camy = y - me.camy - bullet.radius
          var xx = canvas.width / 2 + camx
          var yy = canvas.height / 2 + camy
          var canvasX = canvas.width / 2 + x - me.camx;
          var canvasY = canvas.height / 2 + y - me.camy;
          ctx.translate((canvasX), (canvasY))
          ctx.rotate(bullet.direction);
          var theImg = getAsset('hammerheadaoe.svg')
          if (theImg) {
          ctx.drawImage(
            theImg,
            -bullet.radius,
            -bullet.radius,
            bullet.radius * 2,
            bullet.radius * 2,
          );
        }
          ctx.rotate(-bullet.direction);
          ctx.translate(-(canvasX), -(canvasY))
        break;
        case 16://text
            var r = 1
            var text = bullet.message
              ctx.font = '16px Roboto';
            var metrics = ctx.measureText(text)
            var height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
            var width = ctx.measureText(text).width
            ctx.fillStyle = "rgba(0,0,0,0.211)"
            var camx = x - me.camx - r + width
            var camy = y - me.camy - r + height
            var xx = canvas.width / 2 + camx
            var yy = canvas.height / 2 + camy
            var canvasX = canvas.width / 2 + x - me.camx;
            var canvasY = canvas.height / 2 + y - me.camy;
            ctx.translate((canvasX), (canvasY))
            ctx.beginPath();
            ctx.roundRect(-(r + width/2), -(r + height), (r + width/2) * 2, (r + height) * 2, [5]);
            ctx.fill();
            ctx.fillStyle = "white"
            ctx.fillText(text, -(width)/2, (height)/2);
            ctx.translate(-(canvasX), -(canvasY))
        break;
        case 17:
          var canvasX = canvas.width / 2 + x - me.camx;
          var canvasY = canvas.height / 2 + y - me.camy;
          ctx.translate((canvasX), (canvasY))
          ctx.rotate(bullet.direction);
          var t = 250/0.5
          if (bullet.spawntime > Date.now() - t) {
          //bullet.radius *= Math.min(1, (Date.now() - bullet.spawntime)/t)
          //bullet.globalAlpha = Math.min(1, (Date.now() - bullet.spawntime)/t)
          }
          console.log("T: " + t)
          console.log("Spawntime: " + bullet.spawntime)
      var theImg = getAsset('ssb.svg')
      if (theImg) {
      ctx.drawImage(
        theImg,
        -bullet.radius,
        -bullet.radius,
        bullet.radius * 2,
        bullet.radius * 2,
      );
    }
      var theImg2 = getAsset('ssb2.svg')
      if (theImg2) {
      ctx.drawImage(
        theImg2,
        -bullet.radius,
        -bullet.radius + bullet.radius * 2 * (1 - Math.min(1, 0.5 + (Date.now() - bullet.spawntime)/t)),
        bullet.radius * 2,
        bullet.radius * 2 * Math.min(1, 0.5 + (Date.now() - bullet.spawntime)/t),
      );
    }
          ctx.rotate(-bullet.direction);
          ctx.translate(-(canvasX), -(canvasY))
          bullet.globalAlpha = 1
        break;
        /*
        case 18:
          var camx = x-me.camx - bullet.radius/2
          var camy = y-me.camy - bullet.radius/2
          var canvasX = canvas.width / 2 + x - me.camx;
          var canvasY = canvas.height / 2 + y - me.camy;
          ctx.translate((canvasX), (canvasY))
          ctx.rotate(bullet.direction);
          ctx.drawImage(
            getAsset('hammerheadwall.svg'),
            -bullet.radius,
            -bullet.radius/5,
            bullet.radius * 2,
            bullet.radius/5 * 2,
          );
          ctx.rotate(-bullet.direction);
          ctx.translate(-(canvasX), -(canvasY))
        break; */
        case 19:
          var camx = x-me.camx - bullet.radius/2 * 0.70666666666
          var camy = y-me.camy - bullet.radius/2
          var canvasX = canvas.width / 2 + x - me.camx;
          var canvasY = canvas.height / 2 + y - me.camy;
          ctx.translate((canvasX), (canvasY))
          ctx.rotate(bullet.direction);
          var theImg = getAsset('mantispunch' + bullet.specType + '.png')
          if (theImg) {
          ctx.drawImage(
            theImg,
            -bullet.radius * 0.70666666666,
            -bullet.radius,
            bullet.radius * 2 * 0.70666666666,
            bullet.radius * 2,
          );
        }
          ctx.rotate(-bullet.direction);
          ctx.translate(-(canvasX), -(canvasY))
        break;
        case 20:
          var t = 300
          var g = t * 1/0.75
          if (bullet.spawntime > Date.now() - t) {
          bullet.radius *= Math.min(1, (Date.now() - bullet.spawntime)/t) * 0.75
          ctx.globalAlpha = Math.min(1, (Date.now() - bullet.spawntime)/t) * 0.75
            } else {
              bullet.radius *= Math.min(1, (Date.now() - bullet.spawntime)/g)
              ctx.globalAlpha = Math.max(0, 0.75 - (Date.now() - bullet.spawntime - 200)/(g - 200) * 0.75)
            }
          var camx = x - me.camx - bullet.radius
          var camy = y - me.camy - bullet.radius
          var canvasX = canvas.width / 2 + x - me.camx;
          var canvasY = canvas.height / 2 + y - me.camy;
          ctx.translate((canvasX), (canvasY))
          var theImg = getAsset('lionfishblast.svg')
          if (theImg) {
          ctx.drawImage(
            theImg,
            -bullet.radius,
            -bullet.radius,
            bullet.radius * 2,
            bullet.radius * 2,
          );
        }
          ctx.translate(-(canvasX), -(canvasY))
          ctx.globalAlpha = 1
        break;
        case 21:
          var camx = x-me.camx - bullet.radius/(2 * 256/219)
          var camy = y-me.camy - bullet.radius/2
          var xx = canvas.width / 2 + camx
          var yy = canvas.height / 2 + camy
          var canvasX = canvas.width / 2 + x - me.camx;
          var canvasY = canvas.height / 2 + y - me.camy;
          ctx.translate((canvasX), (canvasY))
          ctx.rotate(bullet.direction);
      var theImg = getAsset('anemone.png')
      if (theImg) {
      ctx.drawImage(
        theImg,
        -bullet.radius * 256/219,
        -bullet.radius,
        bullet.radius * 2 * 256/219,
        bullet.radius * 2,
      );
    }
          ctx.rotate(-bullet.direction);
          ctx.translate(-(canvasX), -(canvasY))
        break;
        case 22:
          var camx = x-me.camx - bullet.radius/(2 * 256/219)
          var camy = y-me.camy - bullet.radius/2
          var xx = canvas.width / 2 + camx
          var yy = canvas.height / 2 + camy
          var canvasX = canvas.width / 2 + x - me.camx;
          var canvasY = canvas.height / 2 + y - me.camy;
          ctx.translate((canvasX), (canvasY))
          ctx.rotate(bullet.direction);
      var theImg = getAsset(bullet.sType == 1 ? 'bigbush.png' : 'bush.png')
      if (theImg) {
      ctx.drawImage(
        theImg,
        -bullet.radius,
        -bullet.radius * 121/(bullet.sType == 1 ? 859 : 197),
        bullet.radius * 2,
        bullet.radius * 2 * 121/(bullet.sType == 1 ? 859 : 197),
      );
    }
          ctx.rotate(-bullet.direction);
          ctx.translate(-(canvasX), -(canvasY))
        break;
        case 23:
          var camx = x-me.camx - bullet.radius/(2 * 256/219)
          var camy = y-me.camy - bullet.radius/2
          var xx = canvas.width / 2 + camx
          var yy = canvas.height / 2 + camy
          var canvasX = canvas.width / 2 + x - me.camx;
          var canvasY = canvas.height / 2 + y - me.camy;
          ctx.translate((canvasX), (canvasY))
          ctx.rotate(bullet.direction);
      var theImg = getAsset('tree.png')
      if (theImg) {
      ctx.drawImage(
        theImg,
        -bullet.radius * 304/775,
        -bullet.radius,
        bullet.radius * 2 * 304/775,
        bullet.radius * 2,
      );
    }
    /*
    ctx.fillStyle = "red";
ctx.globalAlpha = 0.5;
ctx.fillRect(-bullet.radius * 200/775,
  -bullet.radius * 200/775 - bullet.radius * 0.6,
  bullet.radius * 2 * 200/775,
  bullet.radius * 2 * 200/775,
)
ctx.globalAlpha = 1;
*/
          ctx.rotate(-bullet.direction);
          ctx.translate(-(canvasX), -(canvasY))
        break;
        case 24:
          var camx = x - me.camx - bullet.radius
          var camy = y - me.camy - bullet.radius
          var canvasX = canvas.width / 2 + x - me.camx;
          var canvasY = canvas.height / 2 + y - me.camy;
          ctx.translate((canvasX), (canvasY))
          var rot = -Math.PI * Math.max(Date.now() - bullet.spawntime, 0)/2000 * (1 + (Date.now() - bullet.spawntime)/1000)
          ctx.rotate(rot);
          var theImg = getAsset('blue.png')
          if (theImg) {
          ctx.drawImage(
            theImg,
            -bullet.radius,
            -bullet.radius,
            bullet.radius * 2,
            bullet.radius * 2,
          );
        }
          ctx.rotate(-rot);
          ctx.translate(-(canvasX), -(canvasY))
          bullet.globalAlpha = 1
        break;
        case 25:
          var camx = x - me.camx - bullet.radius
          var camy = y - me.camy - bullet.radius
          var canvasX = canvas.width / 2 + x - me.camx;
          var canvasY = canvas.height / 2 + y - me.camy;
          ctx.translate((canvasX), (canvasY))
          ctx.rotate(bullet.direction);
          var theImg = getAsset('gust.png')
          if (theImg) {
          ctx.drawImage(
            theImg,
            -bullet.radius,
            -bullet.radius,
            bullet.radius * 2,
            bullet.radius * 2,
          );
        }
          ctx.rotate(-bullet.direction);
          ctx.translate(-(canvasX), -(canvasY))
        break;
  }
}

function renderMainMenu() {
  const t = Date.now() / 7500;
  const x = MAP_SIZE_W / 2 + 800 * Math.cos(t);
  const y = MAP_SIZE_H / 2 + 800 * Math.sin(t);

  renderBackground2(x, y);
  // Rerun this render function on the next frame
  animationFrameRequestId = requestAnimationFrame(renderMainMenu);
}

animationFrameRequestId = requestAnimationFrame(renderMainMenu);

// Replaces main menu rendering with game rendering.
export function startRendering() {
  cancelAnimationFrame(animationFrameRequestId);
  animationFrameRequestId = requestAnimationFrame(render);
}

// Replaces game rendering with main menu rendering.
export function stopRendering() {
  cancelAnimationFrame(animationFrameRequestId);
  animationFrameRequestId = requestAnimationFrame(renderMainMenu);
}
