const mazeDiv = document.getElementById("maze");
var subdiv = getComputedStyle(document.documentElement).getPropertyValue('--subdiv');
const size = viewportToIntPixels(getComputedStyle(document.documentElement).getPropertyValue('--size'));
var sec, min, maze, stage = 1;
const player = {
  x: 0,
  y: 0,
  sprite: document.getElementById("player")
};


function newStage() {
  mazeDiv.innerHTML = '<div class="player" id="player"></div>';
  player.sprite = document.getElementById("player");
  if(stage%2) subdiv = parseInt(subdiv) + 2;
  document.documentElement.style.setProperty("--subdiv", subdiv);
  player.sprite.style.transition = "0ms";
  document.getElementById("stage").innerText = ++stage;
  draw();
}

function draw() {
  // Generate a good maze
  let m = [], s = 0;
  do {
  maze = new MazeBuilder((subdiv-1)/2, (subdiv-1)/2).maze;
  maze.forEach(e => { m.push(e[e.length-1]); });
  s++;
  } while (!m.every((val, i, arr) => val === arr[0]) && s < 10 && 0);
  if(s==10) alert("failed to generate a good labyrinth!");
  
  // Display the maze
  maze.forEach(row => {
  row.forEach(tile => {
    const e = document.createElement("div");
    e.classList.add("tile");

    switch (tile) {
    case 0:
      e.style.backgroundImage = "url('assets/tiles/wall" + randomWeighted([...Array(7).keys()], [20,15,10,3,3,3,3]) + ".png')";
      break;
    case 2:
      e.style.backgroundImage = "url('assets/tiles/door.png')";
    }

    mazeDiv.appendChild(e);
  });
  });

  // Place the player under the entrance
  player.sprite.style.left = maze[0].findIndex((e) => e == 2) * (size/subdiv) + "px";
  player.sprite.style.top = size/subdiv + "px";
  player.x = maze[0].findIndex((e) => e == 2);
  player.y = 1;

  setTimeout(() => { player.sprite.style.transition = "100ms"; }, 50);
}


function randomWeighted(items, weights) {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const randomNum = Math.random() * totalWeight;

  let cumulativeWeight = 0;
  for (let i = 0; i < items.length; i++) {
    cumulativeWeight += weights[i];
    if (randomNum < cumulativeWeight) {
      return items[i];
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
  Mousetrap.bind(["down", "s", "up", "w", "right", "d", "left", "a"], () => { 
    timer();
    Mousetrap.unbind(["down", "s", "up", "w", "right", "d", "left", "a"]);
  })
  
  Mousetrap.bind(["down", "s"], () => {
    if (player.y < subdiv && maze[player.y + 1]?.[player.x] === 1) {
      player.sprite.style.top = ++player.y * (size/subdiv) + "px";
    } else if (player.y < subdiv && maze[player.y + 1]?.[player.x] === 2) {
      newStage();
    }
  }, 'keyup');
  
  Mousetrap.bind(["up", "w"], () => {
    if (player.y > 0 && maze[player.y - 1]?.[player.x] === 1) {
      player.sprite.style.top = --player.y * (size/subdiv) + "px";
    }
  }, 'keyup');
  
  Mousetrap.bind(["right", "d"], () => {
    if (player.x < subdiv && maze[player.y]?.[player.x + 1] === 1) {
    player.sprite.style.left = ++player.x * (size/subdiv) + "px";
    }
  }, 'keyup');
  
  Mousetrap.bind(["left", "a"], () => {
    if (player.x > 0 && maze[player.y]?.[player.x - 1] === 1) {
      player.sprite.style.left = --player.x * (size/subdiv) + "px";
    }
  }, 'keyup');
}


bindPlayerMovment();
draw();