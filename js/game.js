var defSubdiv = getComputedStyle(document.documentElement).getPropertyValue('--subdiv');
var size = viewportToIntPixels(getComputedStyle(document.documentElement).getPropertyValue('--size'));
var startTime, stop = false, maze, stage = 1, maxStage = 3, entrancePos = 3, subdiv = defSubdiv;
const player = {
  x: 0,
  y: 0,
  sprite: document.getElementById("player"),
  username: "defult",
  numofbc: 1,
  dy: 1,
  dx: 0
};
if(typeof usr !== "undefined") { player.username = usr; }


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

function draw(first = false) {
  // generate a *good* maze
  let m = [], s = 0;
  do {
    mazeObj = new MazeBuilder((subdiv-1)/2, (subdiv-1)/2, entrancePos);
    mazeObj.maze.forEach(e => { m.push(e[e.length-1]); });
    s++;
  } while (!m.every((val, i, arr) => val === arr[0]) && s < 10 && 0);
  if(s==10) alert("failed to generate a good labyrinth!");

  maze = mazeObj.maze;
  entrancePos = mazeObj.exitPos;
  mazeObj.placeKey();
  
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
  player.sprite.style.left = maze[0].findIndex((e) => e == 2) * (size/subdiv) + "px";
  player.sprite.style.top = "0px";

  player.x = maze[0].findIndex((e) => e == 2);
  player.y = 1;

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
    Mousetrap.unbind(["down", "s", "up", "w", "right", "d", "left", "a", "c"]);
  });

  // Mousetrap.bind('n o c l i p', function() {
  //   alert('no clip mode activated');
  // });

  function checkSpecial() {
    var pos = maze[player.y][player.x];
    if (pos === 4) {
      maze[player.y][player.x] = 1;
      maze[maze.length - 1][maze[maze.length - 1].findIndex((e) => e === 3)] = 6;
      document.getElementById("key").style.opacity = "0";
      const door = document.getElementById("door");
      door.style.backgroundImage = "url('assets/tiles/door_opening.gif')";
      setTimeout(() => { 
        door.style.backgroundImage = "url('assets/tiles/door_open.png')"; 
      }, 800);
    } else if (pos === 6 && key) {
      player.sprite.style.opacity = "0";
      player.sprite.style.transition = "left 200ms, top 200ms";
      setTimeout(newStage, 200);
    }
  }

  function movePlayer(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;
    player.dx = dx;
    player.dy = dy;
    player.sprite.style.rotate = getRotationAngle(dy, dx) + "deg";

    if ( newX >= 0 && newX < subdiv && newY >= 0 && newY < subdiv && [1, 4, 5, 6].includes(maze[newY]?.[newX]) ) {
      player.x = newX;
      player.y = newY;
      player.sprite.style.top = player.y * (size / subdiv) + "px";
      player.sprite.style.left = player.x * (size / subdiv) + "px";
      checkSpecial();
    }
  }

  function dziecoBomby(){
    if(player.numofbc !== 0 && maze[player.y + player.dy][player.x + player.dx] === 0 && (player.y + player.dy !== subdiv-1 && player.y + player.dy !== 0) && (player.x + player.dx !== subdiv-1 && player.x + player.dx !== 0)) {
      maze[player.y + player.dy][player.x + player.dx] = 1;
      player.numofbc = 0;
      document.querySelector('#maze :nth-child(' + (((player.y + player.dy)*subdiv) + (player.x + player.dx) + (2)) + ')').style.backgroundImage = "none";
      document.getElementById("bombs").innerHTML = player.numofbc + " | 1";
    }
}
  Mousetrap.bind(["down", "s"], () => movePlayer(0, 1), 'keyup');
  Mousetrap.bind(["up", "w"], () => movePlayer(0, -1), 'keyup');
  Mousetrap.bind(["right", "d"], () => movePlayer(1, 0), 'keyup');
  Mousetrap.bind(["left", "a"], () => movePlayer(-1, 0), 'keyup');

  Mousetrap.bind(["space", "c"], () => dziecoBomby(), 'keydown');

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

// ####################################################


fetch('/assets/options.html')
  .then(response => response.text())
  .then(html => {
    document.body.insertAdjacentHTML('afterbegin', html);
  })
  .catch(error => console.error('Error loading options menu:', error));


switch (file) {
  case "game":
    preloadTextures();
    bindPlayerMovment();
    draw(true);
    document.getElementById("bombs").innerText = "1 | 1";
    document.getElementById("stage").innerText = "1 | " + maxStage;
    break;
  case "replay":
    document.getElementById('username').value = player.username;
    document.getElementById('time').innerText = formatTime(score);
    writeScore();
    break;
  case "play":
    document.getElementById("maxStage").innerText = maxStage;
    document.getElementById("username").value = Cookies.get('username') ?? "";
    break;
}