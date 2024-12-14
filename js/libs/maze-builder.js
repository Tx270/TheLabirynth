class MazeBuilder {

  // Original JavaScript code by Chirp Internet: www.chirpinternet.eu
  // Please acknowledge use of this code by including this header.
  
  constructor(width, height, entrancePos = null) {
  
    this.width = width;
    this.height = height;
  
    this.cols = 2 * this.width + 1;
    this.rows = 2 * this.height + 1;

    this.entrancePos = entrancePos ?? this.rand(1, this.width);
    this.exitPos = this.rand(1, this.width);
  
    this.maze = this.initArray(1);
  
    /* place initial walls */
  
    this.maze.forEach((row, r) => {
    row.forEach((cell, c) => {
      switch(r)
      {
      case 0:
      case this.rows - 1:
        this.maze[r][c] = 0;
        break;
  
      default:
        if((r % 2) == 1) {
        if((c == 0) || (c == this.cols - 1)) {
          this.maze[r][c] = 0;
        }
        } else if(c % 2 == 0) {
        this.maze[r][c] = 0;
        }
  
      }
    });
  
    if(r == 0) {
      /* place ent in top row */
      let doorPos = this.posToSpace(this.entrancePos);
      this.maze[r][doorPos] = 2;
    }
  
    if(r == this.rows - 1) {
      /* place ex in bottom row */
      let doorPos = this.posToSpace(this.exitPos);
      this.maze[r][doorPos] = 3;
    }
  
    });
  
    /* start partitioning */
  
    this.partition(1, this.height - 1, 1, this.width - 1);
  
  }
  
  initArray(value) {
    return new Array(this.rows).fill().map(() => new Array(this.cols).fill(value));
  }
  
  rand(min, max) {
    return min + Math.floor(Math.random() * (1 + max - min));
  }
  
  posToSpace(x) {
    return 2 * (x-1) + 1;
  }
  
  posToWall(x) {
    return 2 * x;
  }
  
  inBounds(r, c) {
    if((typeof this.maze[r] == "undefined") || (typeof this.maze[r][c] == "undefined")) {
    return false; /* out of bounds */
    }
    return true;
  }
  
  shuffle(array) {
    /* sauce: https://stackoverflow.com/a/12646864 */
    for(let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  partition(r1, r2, c1, c2) {
    /* create partition walls
     ref: https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_division_method */
  
    let horiz, vert, x, y, start, end;
  
    if((r2 < r1) || (c2 < c1)) {
    return false;
    }
  
    if(r1 == r2) {
    horiz = r1;
    } else {
    x = r1+1;
    y = r2-1;
    start = Math.round(x + (y-x) / 4);
    end = Math.round(x + 3*(y-x) / 4);
    horiz = this.rand(start, end);
    }
  
    if(c1 == c2) {
    vert = c1;
    } else {
    x = c1 + 1;
    y = c2 - 1;
    start = Math.round(x + (y - x) / 3);
    end = Math.round(x + 2 * (y - x) / 3);
    vert = this.rand(start, end);
    }
  
    for(let i = this.posToWall(r1)-1; i <= this.posToWall(r2)+1; i++) {
    for(let j = this.posToWall(c1)-1; j <= this.posToWall(c2)+1; j++) {
      if((i == this.posToWall(horiz)) || (j == this.posToWall(vert))) {
      this.maze[i][j] = 0;
      }
    }
    }
  
    let gaps = this.shuffle([true, true, true, false]);
  
    /* create gaps in partition walls */
  
    if(gaps[0]) {
    let gapPosition = this.rand(c1, vert);
    this.maze[this.posToWall(horiz)][this.posToSpace(gapPosition)] = 1;
    }
  
    if(gaps[1]) {
    let gapPosition = this.rand(vert+1, c2+1);
    this.maze[this.posToWall(horiz)][this.posToSpace(gapPosition)] = 1;
    }
  
    if(gaps[2]) {
    let gapPosition = this.rand(r1, horiz);
    this.maze[this.posToSpace(gapPosition)][this.posToWall(vert)] = 1;
    }
  
    if(gaps[3]) {
    let gapPosition = this.rand(horiz+1, r2+1);
    this.maze[this.posToSpace(gapPosition)][this.posToWall(vert)] = 1;
    }
  
    /* recursively partition newly created chambers */
  
    this.partition(r1, horiz-1, c1, vert-1);
    this.partition(horiz+1, r2, c1, vert-1);
    this.partition(r1, horiz-1, vert+1, c2);
    this.partition(horiz+1, r2, vert+1, c2);
  
  }
  
  isGap(...cells) {
    return cells.every(([row, col]) => {
    // Sprawdź, czy komórka jest w granicach labiryntu
    if (!this.inBounds(row, col)) {
      return false; // Poza granicami
    }
    
    // Sprawdź, czy komórka jest przejezdna
    return this.maze[row][col] === 0; // Zakładam, że 0 oznacza przejezdną komórkę
    });
  }
  
  countSteps(array, r, c, val, stop) {
  
    if(!this.inBounds(r, c)) {
    return false; /* out of bounds */
    }
  
    if(array[r][c] <= val) {
    return false; /* shorter route already mapped */
    }
  
    if(!this.isGap([r, c])) {
    return false; /* not traversable */
    }
  
    array[r][c] = val;
  
    if(this.maze[r][c] == stop) {
    return true; /* reached destination */
    }
  
    this.countSteps(array, r-1, c, val+1, stop);
    this.countSteps(array, r, c+1, val+1, stop);
    this.countSteps(array, r+1, c, val+1, stop);
    this.countSteps(array, r, c-1, val+1, stop);
  
  }

  
  display() {
    console.log(this.maze.map(row => row.join(", ")).join("\n"));
  }

  findFurthestPoint() {
    const rows = this.maze.length;
    const cols = this.maze[0].length;
  
    let entrance = null;
    let exit = null;
  
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (this.maze[r][c] === 2 || this.maze[r][c] === 3) {
          if (!entrance) {
            entrance = [r, c];
          } else {
            exit = [r, c];
          }
        }
      }
    }
  
    function bfs(start) {
      const queue = [start];
      const distances = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
      distances[start[0]][start[1]] = 0;
  
      const directions = [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0]
      ];
  
      while (queue.length > 0) {
        const [x, y] = queue.shift();
  
        for (const [dx, dy] of directions) {
          const nx = x + dx;
          const ny = y + dy;
  
          if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && maze[nx][ny] === 1) {
            if (distances[nx][ny] === Infinity) {
              distances[nx][ny] = distances[x][y] + 1;
              queue.push([nx, ny]);
            }
          }
        }
      }
  
      return distances;
    }
  
    const distancesFromEntrance = bfs(entrance);
    const distancesFromExit = bfs(exit);
  
    let maxDistance = -1;
    let furthestPoint = null;
  
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (maze[r][c] === 1) {
          const distance = Math.min(distancesFromEntrance[r][c], distancesFromExit[r][c]);
          if (distance > maxDistance) {
            maxDistance = distance;
            furthestPoint = [r, c];
          }
        }
      }
    }
  
    return furthestPoint;
  }

  placeKey() {
  
    let fr, fc;
    [fr, fc] = this.findFurthestPoint();
    this.maze[fr][fc] = 4;
  
  }

}