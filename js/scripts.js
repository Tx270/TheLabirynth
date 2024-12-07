const main = document.getElementById("main");
var subdiv = getComputedStyle(document.documentElement).getPropertyValue('--subdiv');
const size = getComputedStyle(document.documentElement).getPropertyValue('--size').split("px")[0];
const player = {
  x: 0,
  y: 0,
  sprite: 0
};
var maze;



function init() {
  player.sprite = document.getElementById("player");
  draw();

  player.sprite.style.left = maze[0].findIndex((e) => e == 2) * (size/subdiv) + "px";
  player.sprite.style.top = size/subdiv + "px";
  player.x = maze[0].findIndex((e) => e == 2);
  player.y = 1;
}

function draw() {
  maze = new MazeBuilder((subdiv-1)/2, (subdiv-1)/2).maze;

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

      main.appendChild(e);
    });
  });
}

function findPairs(n) {
  let pairs = [];
  for (let x = 1; x <= n; x++) {
    if (n % x === 0) {
      let y = n / x;
      if (x > 17 && x < 51) {
        pairs.push([x, y]);
      }
    }
  }
  console.log(pairs);
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

Mousetrap.bind(["down", "s"], () => {
  if (player.y < subdiv && maze[player.y + 1]?.[player.x] === 1) {
    player.sprite.style.top = ++player.y * (size/subdiv) + "px";
  } else if (player.y < subdiv && maze[player.y + 1]?.[player.x] === 2) {
    main.innerHTML = '<div class="player" id="player"></div>';
    subdiv = parseInt(subdiv) + 1;
    document.documentElement.style.setProperty("--subdiv", subdiv);
    init();
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