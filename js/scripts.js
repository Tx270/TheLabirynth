const main = document.getElementById("main");
const subdiv = getComputedStyle(document.documentElement).getPropertyValue('--subdiv');
const player = {
  x: 1,
  y: 1,
  sprite: document.getElementById("player")
};
var maze;



function init() {
  player.sprite.style.top = `${parseInt(window.getComputedStyle(player.sprite).top) || 0}px`;
  player.sprite.style.left = `${parseInt(window.getComputedStyle(player.sprite).left) || 0}px`;

  bindKeys();
  draw();
}

function draw() {
  maze = new MazeBuilder(12, 12).maze;

  maze.forEach(row => {
    row.forEach(tile => {
      const e = document.createElement("div");
      e.classList.add("tile");

      switch (tile) {
        case 0:
          e.style.backgroundImage = "url('assets/tiles/wall" + randomWeighted([...Array(7).keys()], [20,15,10,3,3,3,3]) + ".png')";
          break;
        case 1:
          
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

function bindKeys() {
  Mousetrap.bind(["down", "s"], () => {
    if (player.y < subdiv && maze[player.y + 1]?.[player.x] === 1) {
      player.sprite.style.top = `${++player.y * (parseInt(window.getComputedStyle(main).width)/subdiv)}px`;
    }
  }, 'keyup');
  
  Mousetrap.bind(["up", "w"], () => {
    if (player.y > 0 && maze[player.y - 1]?.[player.x] === 1) {
      player.sprite.style.top = `${--player.y * (parseInt(window.getComputedStyle(main).width)/subdiv)}px`;
    }
  }, 'keyup');
  
  Mousetrap.bind(["right", "d"], () => {
    if (player.x < subdiv && maze[player.y]?.[player.x + 1] === 1) {
      player.sprite.style.left = `${++player.x * (parseInt(window.getComputedStyle(main).width)/subdiv)}px`;
    }
  }, 'keyup');
  
  Mousetrap.bind(["left", "a"], () => {
    if (player.x > 0 && maze[player.y]?.[player.x - 1] === 1) {
      player.sprite.style.left = `${--player.x * (parseInt(window.getComputedStyle(main).width)/subdiv)}px`;
    }
  }, 'keyup');
}
