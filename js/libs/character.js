class Character {
    constructor(username, sprite) {
      this.username = username;
      this.sprite = sprite;
      this.x = 0;
      this.y = 0;
      this.dx = 0;
      this.dy = 0;
      this.numofbc = 1;
    }
  
    move(dx, dy, send = true) {
      if (send && multiplayer) sendMessage(dx + "," + dy, "move", "move");
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
  }