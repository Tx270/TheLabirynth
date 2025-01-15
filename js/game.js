var defSubdiv = getComputedStyle(document.documentElement).getPropertyValue('--subdiv');
var size = viewportToIntPixels(getComputedStyle(document.documentElement).getPropertyValue('--size'));
var pusher = new Pusher('53aff91618915dd8f529', { cluster: 'eu' });
var startTime, stop = false, maze, stage = 1, entrancePos = 3, subdiv = defSubdiv, lastMsg, first = true, multiplayer = multiplayer || false;
const player = new Character("default");
const oponent = multiplayer ? new Character("default") : null;
if(typeof usr !== "undefined") player.username = usr;
const sfx = {
  explosion: new Audio('/assets/sfx/explosion.wav'),
  coin: new Audio('/assets/sfx/coin.wav'),
  win: new Audio('/assets/sfx/win.wav'),
  end: new Audio("/assets/sfx/end.mp3"),
  music: new Audio(),
  volume: 0.5
};
if(Cookies.get("volume")) sfx.volume = Cookies.get("volume"); else Cookies.set("volume", "0.5");


// ####################################################

async function newStage() {
  player.numofbc = 1;
  document.getElementById("bombs").innerHTML = player.numofbc + " | 1";
  document.getElementById("maze").innerHTML = '<div class="player" id="player"></div>';
  player.sprite = document.getElementById("player");
  player.sprite.style.transition = "left 0ms, top 0ms";

  if(stage != maxStage) {
    if(stage%2) {
      subdiv = parseInt(subdiv) + 2;
      entrancePos++;
      document.documentElement.style.setProperty("--subdiv", subdiv);
    }
    stage++;
    document.getElementById("stage").innerText = stage + " | " + maxStage;
    draw();
  } else {
    stop = true;
    let scr = Math.round(Date.now() / 1000)-startTime;
    await fetchData({ score: scr, username: player.username, mode: 'add' });

    document.getElementById("username").value = player.username;
    document.getElementById("score").value = scr;
    document.getElementById("fr").submit();
  
  }
}

function draw(maze = null) {
  if(!maze) {
    // generate a *good* maze
    let m = [], s = 0;
    do {
      mazeObj = new MazeBuilder((subdiv-1)/2, (subdiv-1)/2, entrancePos);
      mazeObj.maze.forEach(e => { m.push(e[e.length-1]); });
      s++;
    } while (!m.every((val, i, arr) => val === arr[0]) && s < 10 && 0);
    if(s==10) alert("Failed to generate a good maze! Try refreshing.");

    maze = mazeObj.maze;
    entrancePos = mazeObj.exitPos;
    mazeObj.placeKey();
  }

  if(multiplayer && isHost) sendMessage(maze, channelName, "maze");
  
  // display the maze
  maze.forEach(row => {
    row.forEach(tile => {
      const e = document.createElement("div");
      e.classList.add("tile");

      switch (tile) {
        case 0:
          e.style.backgroundImage = "url('assets/tiles/wall" + randomTileNumberWeighted() + ".png')";
          break;
        case 1:
          break;
        case 2:
          if(!first) {
            e.style.backgroundImage = "url('assets/tiles/door_closing.gif')";
            setTimeout(() => {
              e.style.backgroundImage = "url('assets/tiles/door_closed.png')";
            }, 800);
          } else {
            e.style.backgroundImage = "url('assets/tiles/wall" + randomTileNumberWeighted() + ".png')";
          }
          break;
        case 3:
          e.style.backgroundImage = "url('assets/tiles/door_closed.png')";
          e.id = "door";
          break;
        case 4:
          e.style.backgroundImage = "url('assets/key.gif')";
          e.id = "key";
          break;
        case 5:
          e.style.backgroundImage = "url('assets/coin.gif')";
          e.classList.add("coin");
          break;
      }

      document.getElementById("maze").appendChild(e);
    });
  });

  // Place the player under the entrance
  player.x = maze[0].findIndex((e) => e == 2);
  player.y = 1;

  player.sprite.style.left = player.x * (size/subdiv) + "px";
  player.sprite.style.top = "0px";

  if(!first) {
    // animate player at start
    player.sprite.style.opacity = "0";
    player.sprite.style.transition = "left 200ms, top 200ms"
    setTimeout(() => {
      player.sprite.style.top = player.y * (size/subdiv) + "px";
      player.sprite.style.opacity = "1";
    }, 200);
  } else {
    player.sprite.style.top = player.y * (size/subdiv) + "px";
    player.sprite.style.opacity = "1";
  }
  setTimeout(() => { player.sprite.style.transition = "left 100ms, top 100ms"; }, 250);
  
  first = false;
  return maze;
}

// ####################################################

function randomTileNumberWeighted() {
  const weights = [20,15,10,3,3,3,3];
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const randomNum = Math.random() * totalWeight;

  let cumulativeWeight = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulativeWeight += weights[i];
    if (randomNum < cumulativeWeight) {
      return i;
    }
  }
}

function viewportToIntPixels(value) {
  var parts = value.match(/([0-9\.]+)(vh|vw)/)
  var q = Number(parts[1])
  var side = window[['innerHeight', 'innerWidth'][['vh', 'vw'].indexOf(parts[2])]]
  return side * (q/100)
}

function timer(){
  var sec = 0, min = 0;
  var timer = setInterval(function(){
    if (stop === true) {
      clearInterval(timer);
      stop = false;
      return;
    }
    sec++;
    if(sec == 60) {
      sec = 0;
      min++;
    }
    if(sec < 10) { document.getElementById('timer').innerHTML=min+':0'+sec; }
    else { document.getElementById('timer').innerHTML=min+':'+sec; }
  }, 1000);
}

function preloadTextures() {
  const textures = [
    "assets/tiles/door_closing.gif",
    "assets/tiles/door_closed.png",
    "assets/tiles/door_opening.gif",
    "assets/tiles/door_open.png"
  ];

  textures.forEach(texture => {
      const img = new Image();
      img.src = texture;
  });
}

function bindPlayerMovment() {
  // Jednorazowe przypisanie timera
  Mousetrap.bind(["down", "s", "up", "w", "right", "d", "left", "a", "c", "space"], () => {
    startTime = Math.round(Date.now() / 1000);
    timer();
    if (sfx.music.paused || sfx.music.currentTime == 0 || sfx.music.ended) music();  
    Mousetrap.unbind(["down", "s", "up", "w", "right", "d", "left", "a", "c"]);
  });

  Mousetrap.bind(["down", "s"], () => player.move(0, 1), 'keyup');
  Mousetrap.bind(["up", "w"], () => player.move(0, -1), 'keyup');
  Mousetrap.bind(["right", "d"], () => player.move(1, 0), 'keyup');
  Mousetrap.bind(["left", "a"], () => player.move(-1, 0), 'keyup');

  Mousetrap.bind(["space", "c"], () => player.dziecioBomba(), 'keydown');

  window.addEventListener("resize", () => {
    size = viewportToIntPixels(getComputedStyle(document.documentElement).getPropertyValue('--size'));
    player.sprite.style.top = player.y * (size/subdiv) + "px";
    player.sprite.style.left = player.x * (size/subdiv) + "px";
  });
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function generateUUID() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz012345678901234567890123456789';
  let uuid = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uuid += characters[randomIndex];
  }
  return uuid;
}

function getRotationAngle(dx, dy) {
  let angleRadians = Math.atan2(-dy, dx);
  let angleDegrees = angleRadians * (180 / Math.PI);

  return angleDegrees;
}

function validateUsername() {
  let x = document.forms["startForm"]["username"].value;
  if(!x) {
    alert("Your nickname must not be empty");
    return false;
  }
  if (!/^[A-Za-z0-9]+$/.test(x)) {
    alert("Your nickname must contain only letters and numbers");
    return false;
  }
  if (x.length > 30) {
    alert("Your nickname must be less than 30 characters");
    return false;
  }
  Cookies.set('username', x);
}

function submitForm(action) {
  var form = document.getElementById('startForm');

  form.action = action;
  form.submit();
}

function joiningRoom(event) {
  event.preventDefault();

  sendMessage(player.username, document.getElementById('channel').value, 'joined');
  var channel = pusher.subscribe(document.getElementById('channel').value);

  channel.bind("ok", function(data) { 
    if(data.username === player.username || data.message !== player.username) return;
    document.getElementById('startForm').submit();
  });

  setTimeout(() => {
    channel.unbind("ok");
    alert("Nie udało się dołączyć do pokoju");
  }, 5000);
}

// ####################################################

async function fetchData(params) {
  try {
    const response = await fetch(`${window.location.protocol}//${window.location.hostname}/php/db.php?${new URLSearchParams(params)}`);
    return await response.json();
  } catch (err) {
    console.error('Błąd przy pobieraniu danych:', err);
    document.getElementById('leaderboard').innerHTML = "Connection to the <br> database failed";
    document.getElementById('leaderboard').style.fontSize = "30px";
    return null;
  }
}

async function writeScore() {
  const scoresTop = await fetchData({ mode: 'top' });
  const scoresProx = await fetchData({ username: player.username, mode: 'prox' });
  const tbody = document.getElementById('leaderboardBody');
  tbody.innerHTML = '';

  const appendScores = (scores, userPlace) => {
    scores.forEach((score, index) => {
      const isCurrentUser = score.username === player.username;
      tbody.appendChild(createRow(score, index, isCurrentUser));
    });
  };

  const createRow = ({ place, username, score }, index, isCurrentUser) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${place || index + 1}</td>
      <td colspan="3">${username}</td>
      <td>${formatTime(score)}</td>
    `;
    if (isCurrentUser) {
      row.style.fontWeight = "900";
    }
    return row;
  };  

  if (scoresProx && scoresProx.length > 7) {
    appendScores(scoresProx, true);
  } else if (!scoresProx || scoresProx.length === 0) {
    const fullTopScores = await fetchData({ mode: 'topten' });
    appendScores(fullTopScores, false);
  } else {
    appendScores(scoresTop, false);
    const blankRow = document.createElement('tr');
    blankRow.innerHTML = '<td colspan="5">&#8226; &#8226; &#8226; &#8226;</td>';
    tbody.appendChild(blankRow);
    appendScores(scoresProx, true);
  }
}

function sendMessage(message, chName, event) {
  fetch('/php/send.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: message, username: player.username, channel: chName, event: event })
  })
  .then(response => response.json())
  .then(data => { lastMsg = data; })
  .catch(error => { console.error('Error:', error); });
};

function messageMove(data) {
  if(data.username === player.username) return;
  // player.move(parseInt(data.message.split(",")[0]), parseInt(data.message.split(",")[1]), false);
  player.x = parseInt(data.message.split("/")[0].split(",")[0]);
  player.y = parseInt(data.message.split("/")[0].split(",")[1]);
  player.dx = parseInt(data.message.split("/")[1].split(",")[0]);
  player.dy = parseInt(data.message.split("/")[1].split(",")[1]);
  player.sprite.style.top = player.y * (size / subdiv) + "px";
  player.sprite.style.left = player.x * (size / subdiv) + "px";
  player.sprite.style.rotate = getRotationAngle(player.dy, player.dx) + "deg";
  player.checkSpecial();
};

function messageBomb(data) {
  if(data.username === player.username) return;
  player.dziecioBomba(false);
}

function messageMaze(data) {
  if(data.username === player.username) return;
  maze = draw(data.message);
}

// ####################################################

function music() {
  sfx.music.src = "/assets/sfx/music/music-" + (Math.floor(Math.random() * 3) + 1) + ".mp3";

  sfx.music.play().catch(err => { console.log('Music play error:', err); });

  sfx.music.onended = music;
}

function setVolume(volume) {
  Object.keys(sfx).forEach(key => {
    sfx[key].volume = volume;
  });
  Cookies.set("volume", volume);
}

function toggleSound() {
  if(sfx.volume === "0") {
    sfx.volume = "0.5";
    document.getElementById("sound").src = "/assets/ui/sound.png";
  } else {
    sfx.volume = "0";
    document.getElementById("sound").src = "/assets/ui/mute.png";
  }
  setVolume(sfx.volume);
}

// ####################################################

document.addEventListener("DOMContentLoaded", () => {
  fetch('/assets/options.html')
    .then(response => response.text())
    .then(html => {
      document.body.insertAdjacentHTML('afterbegin', html);
      setVolume(sfx.volume);
      if(sfx.volume === "0") document.getElementById("sound").src = "/assets/ui/mute.png";
      main();
    })
    .catch(error => console.error('Error loading data:', error));
});

function main() {
  switch (file) {
    case "game":
      if(multiplayer) {
        var channel = pusher.subscribe(channelName);
        channel.bind('move', messageMove);
        channel.bind('bomb', messageBomb);
        if(!isHost) {
          sendMessage(player.username, channelName, "joined");
          channel.bind('maze', messageMaze);
        }
        document.getElementById("maze").innerHTML = '<div class="player" id="player"></div><div class="player" id="oponent"></div>';
      }
      player.sprite = document.getElementById("player");
      if(!multiplayer || (multiplayer && isHost)) channel.bind("joined", (data) => { maze = draw(); });
      preloadTextures();
      bindPlayerMovment();
      document.getElementById("bombs").innerText = "1 | 1";
      document.getElementById("stage").innerText = "1 | " + maxStage;
      music();
      break;
    case "create":
      window.channelName = generateUUID();
      document.getElementById('channelName').value = window.channelName;
      var channel = pusher.subscribe(window.channelName);
      channel.bind('joined', function(data) {
        if(data.username === player.username) return;
        sendMessage(data.username, window.channelName, "ok"); 
        document.getElementById('startForm').submit();
      });
    case "join":
      document.getElementById('username').value = player.username;
      break;
    case "replay":
      document.getElementById('username').value = player.username;
      document.getElementById('time').innerText = formatTime(score);
      writeScore();
      sfx.end.play().catch(err => { console.log('Music play error:', err); });
      break;
    case "play":
      document.getElementById("maxStage").innerText = maxStage;
      document.getElementById("username").value = Cookies.get('username') ?? "";
      break;
  }
}