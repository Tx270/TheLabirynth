class Character {
  constructor(username) {
    this.username = username;
    this.sprite;
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
    this.numofbc = 1;
  }
  
  move(dx, dy, send = true) {
    const newX = this.x + dx;
    const newY = this.y + dy;
    this.dx = dx;
    this.dy = dy;
    this.sprite.style.rotate = getRotationAngle(dy, dx) + "deg";
  
    if ( newX >= 0 && newX < subdiv && newY >= 0 && newY < subdiv && [1, 4, 5, 6].includes(maze[newY]?.[newX]) ) {
      this.x = newX;
      this.y = newY;
      this.sprite.style.top = this.y * (size / subdiv) + "px";
      this.sprite.style.left = this.x * (size / subdiv) + "px";
      this.checkSpecial();
    }

    if (send && multiplayer) sendMessage(this.x + "," + this.y + "/" + this.dx + "," + this.dy, channelName, "move");
  }
  
  checkSpecial() {
    var pos = maze[this.y][this.x];
    if (pos === 4) {
    maze[this.y][this.x] = 1;
    maze[maze.length - 1][maze[maze.length - 1].findIndex((e) => e === 3)] = 6;
    document.getElementById("key").style.opacity = "0";
    sfx.coin.play();
    document.getElementById("door").style.backgroundImage = "url('assets/tiles/door_opening.gif')";
    setTimeout(() => { 
      document.getElementById("door").style.backgroundImage = "url('assets/tiles/door_open.png')"; 
    }, 800);
    } else if (pos === 6 && key) {
    if(stage != maxStage) sfx.win.play();
    this.sprite.style.opacity = "0";
    this.sprite.style.transition = "left 200ms, top 200ms";
    setTimeout(newStage, 200);
    }
  }

  dziecioBomba(send = true){
    if(player.numofbc !== 0 && maze[player.y + player.dy][player.x + player.dx] === 0 && (player.y + player.dy !== subdiv-1 && player.y + player.dy !== 0) && (player.x + player.dx !== subdiv-1 && player.x + player.dx !== 0)) {
    if (send && multiplayer) sendMessage("", channelName, "bomb");
    maze[player.y + player.dy][player.x + player.dx] = 1;
    player.numofbc = 0;
    sfx.explosion.play();
    document.querySelector('#maze :nth-child(' + (((player.y + player.dy)*subdiv) + (player.x+1 + player.dx) + (2)) + ')').style.backgroundImage = "none";
    document.getElementById("bombs").innerHTML = player.numofbc + " | 1";
    }
  }
}