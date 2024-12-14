const mazeDiv = document.getElementById("maze");
var subdiv = getComputedStyle(document.documentElement).getPropertyValue('--subdiv');
const size = viewportToIntPixels(getComputedStyle(document.documentElement).getPropertyValue('--size'));
var sec, min, maze, stage = 1, entrancePos = 3;
const player = {
  x: 0,
  y: 0,
  sprite: document.getElementById("player")
};


function newStage() {
  mazeDiv.innerHTML = '<div class="player" id="player"></div>';
  player.sprite = document.getElementById("player");
  if(stage%2) {
    subdiv = parseInt(subdiv) + 2;
    entrancePos++;
  }
  document.documentElement.style.setProperty("--subdiv", subdiv);
  player.sprite.style.transition = "0ms";
  document.getElementById("stage").innerText = ++stage;
  draw();
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

    mazeDiv.appendChild(e);
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
    player.sprite.style.transition = "200ms"
    setTimeout(() => {
      player.sprite.style.top = player.y * (size/subdiv) + "px";
      player.sprite.style.opacity = "1";
    }, 200);
  } else {
    player.sprite.style.top = player.y * (size/subdiv) + "px";
    player.sprite.style.opacity = "1";
  }
  setTimeout(() => { player.sprite.style.transition = "100ms"; }, 250);

}


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
  sec = 0, min = 0;
  var timer = setInterval(function(){
    if (stop === true) {
      clearInterval(timer);
      stop = false;
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

function bindPlayerMovment() {
  // one time bind to start the timer
  Mousetrap.bind(["down", "s", "up", "w", "right", "d", "left", "a"], () => { 
    timer();
    Mousetrap.unbind(["down", "s", "up", "w", "right", "d", "left", "a"]);
  })

  function checkSpecial() {
    let pos = maze[player.y][player.x];
    if (pos === 4) {
      maze[maze.length-1][maze[maze.length-1].findIndex((e) => e == 3)] = 6;
      document.getElementById("key").style.opacity = "0";
      document.getElementById("door").style.backgroundImage = "url('assets/tiles/door_opening.gif')";
      setTimeout(() => { document.getElementById("door").style.backgroundImage = "url('assets/tiles/door_open.png')"; }, 800);
    }
    if (pos === 6 && key) {
      player.sprite.style.opacity = "0";
      player.sprite.style.transition = "200ms"
      setTimeout(newStage, 200);
    }
  }

  let empty_tile_types = [1, 4, 5, 6];
  
  Mousetrap.bind(["down", "s"], () => {
    if (empty_tile_types.includes(player.y < subdiv && maze[player.y + 1]?.[player.x])) {
      player.sprite.style.top = ++player.y * (size/subdiv) + "px";
      checkSpecial();
    }
  }, 'keyup');
  
  Mousetrap.bind(["up", "w"], () => {
    if (empty_tile_types.includes(player.y > 0 && maze[player.y - 1]?.[player.x])) {
      player.sprite.style.top = --player.y * (size/subdiv) + "px";
      checkSpecial();
    }
  }, 'keyup');
  
  Mousetrap.bind(["right", "d"], () => {
    if (empty_tile_types.includes(player.x < subdiv && maze[player.y]?.[player.x + 1])) {
      player.sprite.style.left = ++player.x * (size/subdiv) + "px";
      checkSpecial();
    }
  }, 'keyup');
  
  Mousetrap.bind(["left", "a"], () => {
    if (empty_tile_types.includes(player.x > 0 && maze[player.y]?.[player.x - 1])) {
      player.sprite.style.left = --player.x * (size/subdiv) + "px";
      checkSpecial();
    }
  }, 'keyup');
}

bindPlayerMovment();
draw(true);