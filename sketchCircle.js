function removeFromArray(arr, elt) {
 for (let i = arr.length - 1; i >= 0; i--) {
   if (arr[i] == elt) {
     arr.splice(i, 1);
   }
 }
}

function heuristic(a,b) {
  return abs(a.i - b.i) + abs(a.j - b.j);
}

var squareSide = 20;

var cols = 25;
var rows = 25;
var grid = new Array(cols);

var openSet = [];
var closedSet = [];
var start;
var end;
var path;

var buttonStart;
var startBool = false;

var buttonRestart;

var paddingLeft = 200;
var paddingTop = 100;

var radioOption;

var percentFilledSlider;

var totalLength;

var walledCoveredArr;

var r = 1;
var g = 1;
var b = 1;

function Spot(i,j) {
  this.i = i;
  this.j = j;
  this.g = 0;
  this.h = 0;
  this.neighbors = [];
  this.diagonalNeighbors = [];
  this.previous = undefined;
  this.wall = false;

  if (random(1) < percentFilledSlider.value() / 100) {
    this.wall = true;
  }

  this.show = function (color) {
    fill(color);
    if (this.wall) {
      fill(0);
    }
    noStroke();
    ellipse(this.i * squareSide + squareSide / 2, this.j * squareSide + squareSide / 2, squareSide / 2, squareSide / 2);
  }

  this.addToArr = function(arr, spot) {
    arr.push(spot);
  }

  this.addNeighbors = function (grid) {
    let i = this.i;
    let j = this.j;
    if (i < cols - 1) {
      this.addToArr(this.neighbors, grid[i+1][j]);
    }
    if (i > 0) {
      this.addToArr(this.neighbors, grid[i-1][j]);
    }
    if (j < rows - 1) {
      this.addToArr(this.neighbors, grid[i][j+1]);
    }
    if (j > 0) {
      this.addToArr(this.neighbors, grid[i][j-1]);
    }
    // Corner movements
    if (i > 0 && j - 1 > 0) {
      this.addToArr(this.neighbors, grid[i-1][j-1]);
      this.addToArr(this.diagonalNeighbors, grid[i-1][j-1]);
    }
    if (i > 0 && j + 1 < rows - 1) {
      this.addToArr(this.neighbors, grid[i-1][j+1]);
      this.addToArr(this.diagonalNeighbors, grid[i-1][j+1]);
    }
    if (i < cols - 1 && j > 0) {
      this.addToArr(this.neighbors, grid[i+1][j-1]);
      this.addToArr(this.diagonalNeighbors, grid[i+1][j-1]);
    }
    if (i < cols - 1 && j < rows - 1) {
      this.addToArr(this.neighbors, grid[i+1][j+1]);
      this.addToArr(this.diagonalNeighbors, grid[i+1][j+1]);
    }
  }

  this.endClicked = function() {
    if (dist(mouseX, mouseY, this.i * squareSide + squareSide / 2, this.j * squareSide + squareSide / 2) < squareSide - squareSide / 4) {
      end = grid[i][j];
      this.wall = false;
    }
  }

  this.startClicked = function() {
    if (dist(mouseX, mouseY, this.i * squareSide + squareSide / 2, this.j * squareSide + squareSide / 2) < squareSide - squareSide / 4) {
      start = grid[i][j];
      this.wall = false;
      restart();
    }
  }

  this.blockElem = function() {
    if (dist(mouseX, mouseY, this.i * squareSide + squareSide / 2, this.j * squareSide + squareSide / 2) < squareSide - squareSide / 2 && start != this && end != this) {
      this.wall = true;
    }
  }

  this.repickWall = function() {
    this.wall = false;
    if (random(1) < percentFilledSlider.value() / 100 && start != this && end != this) {
      this.wall = true;
    }
  }

  this.removeWall = function() {
    if (dist(mouseX, mouseY, this.i * squareSide + squareSide / 2, this.j * squareSide + squareSide / 2) < squareSide - squareSide / 2 && start != this && end != this) {
      this.wall = false;
    }
  }
}

function mouseDragged() {
  move();
}

function mousePressed() {
  move();
}

function move() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let value = radioOption.value();
      if (!grid[i][j].wall) {
        if (value == 'Wall') {
          grid[i][j].blockElem();
        } else if (value == 'Startpoint') {
          grid[i][j].startClicked();
        } else if (value == 'Endpoint'){
          grid[i][j].endClicked();
        }
      } else if (value == 'Remove Wall'){
        grid[i][j].removeWall();
      }
    }
  }
}

function restart() {
  // Clear is for circle implementation
  clear();
  startBool = false;
  path = [];
  openSet = [];
  openSet.push(start);
  closedSet = [];
}

function setup() {
  createCanvas(windowWidth - paddingLeft, windowHeight - paddingTop);

  r = random(0,255);
  g = random(0,255);
  b = random(0,255);

  buttonStart = createButton("Start");
  buttonStart.position(5,5);
  buttonStart.mousePressed(function() {
    if (startBool == true) {
      restart();
    } else {
      startBool = true;
    }
  });

  buttonRestart = createButton("Restart");
  buttonRestart.position(buttonStart.width + 10,5);
  buttonRestart.mousePressed(function() {
    restart();
  });

  radioOption = createRadio();
  radioOption.position(buttonStart.width + 5 + buttonRestart.width + 10 + 5, 5);
  radioOption.option('Wall');
  radioOption.option('Startpoint');
  radioOption.option('Endpoint');
  radioOption.option('Remove Wall');
  radioOption.style('width','235px')
  radioOption._getInputChildrenArray()[0].checked = true;

  let percentageUpdateField = createP('30% Filled');
  percentageUpdateField.position(buttonStart.width + buttonRestart.width + radioOption.width + 25,-5);

  percentFilledSlider = createSlider(0,60,30,1);

  totalLength = createP('1 Unit');
  totalLength.position(buttonStart.width + buttonRestart.width + radioOption.width + percentageUpdateField.width + percentFilledSlider.width + 45, -5);

  textAlign(CENTER);

  cols = Math.round(width / squareSide);
  rows = Math.round(height / squareSide);

  path = [];

  for (let i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
    for (let j = 0; j < rows; j++) {
      grid[i][j] = new Spot(i,j);
    }
  }

  percentFilledSlider.position(buttonStart.width + buttonRestart.width + radioOption.width + percentageUpdateField.width + 35, 5);
  percentFilledSlider.input(function() {
    percentageUpdateField.html(percentFilledSlider.value() + '% Filled');
    restart();
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        grid[i][j].repickWall();
      }
    }
  });

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].addNeighbors(grid);
    }
  }

  start = grid[0][0];
  end = grid[cols - 1][rows - 1];

  start.wall = false;
  end.wall = false;

  openSet.push(start);
}
//Either put clear at beginning or in the if statement (winning/done)
function draw() {
  clear();

  r = r % 255;
  g = g % 255;
  b = b % 255;

  r++;
  g++;
  b++;

  //background(255); -- total white background
  background(220); // bit grey

  if (startBool) {
    if (openSet.length > 0) {
      var winner = 0;
      for (let i = 0; i < openSet.length; i++) {
        if (openSet[i].f < openSet[winner].f) {
          winner = i;
        }
      }

      var current = openSet[winner];

      if (current === end) {
        startBool = false;
        //clear(); if you uncomment this one, you have to comment out the clear() at the beginning of the draw() function
        console.log("Done!");
      }

      removeFromArray(openSet,current);
      closedSet.push(current);

      path = [];
      let temp = current;
      path.push(temp);
      while (temp.previous) {
        path.push(temp.previous);
        temp = temp.previous;
      }

      totalLength.html(path.length + 'Unit(s)');

      var neighbors = current.neighbors;
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];
        if (!closedSet.includes(neighbor) && !neighbor.wall) {
          var tempG = current.g + 1;
          if (current.diagonalNeighbors.includes(neighbor)) {
            tempG = current.g + sqrt(2);
          }


          let newPath = false;
          if (openSet.includes(neighbor)) {
            if (tempG < neighbor.g) {
             neighbor.g = tempG;
             newPath = true;
            }
          } else {
            neighbor.g = tempG;
            newPath = true;
            openSet.push(neighbor);
          }

          if (newPath) {
            neighbor.h = heuristic(neighbor, end);
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.previous = current;
          }
        }
      }

    } else {
      console.log('no solution');
      restart();
    }
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].show(color(255));
    }
  }

  /*for (let i = 0; i < closedSet.length; i++) {
    closedSet[i].show(color(255, 0, 0));
  }

  --- uncomment to see the closed and open path posibilities

  for (let i = 0; i < openSet.length; i++) {
    openSet[i].show(color(0, 255, 0));
  }*/

  walledCoveredArr = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j].wall && !walledCoveredArr.includes(grid[i][j])) {
        let current = grid[i][j];
        noFill();
        stroke(0);
        strokeWeight(squareSide / 3);
        beginShape();
        iterateThroughNeighbors(current);
        endShape();
      }
    }
  }

  noFill();
  stroke(82,222,151);
  strokeWeight(squareSide / 2);
  beginShape();
  for (let i = 0; i < path.length; i++) {
    //path[i].show(color(0,0,255));
    vertex(path[i].i * squareSide + squareSide / 2, path[i].j * squareSide + squareSide / 2);
  }
  endShape();

  start.show(color(r,g,b));
  end.show(color(255-r,255-g,255-b));
}

function iterateThroughNeighbors(current) {
  if(!walledCoveredArr.includes(current)) {
    vertex(current.i * squareSide + squareSide / 2, current.j * squareSide + squareSide / 2);
    walledCoveredArr.push(current);
    let wallNeighborArray = [];
    for (let i = 0; i < current.neighbors.length; i++) {
      if (current.neighbors[i].wall && !current.diagonalNeighbors.includes(current.neighbors[i])) {
        wallNeighborArray.push(current.neighbors[i]);
      }
    }

    for (let i = 0; i < wallNeighborArray.length; i++) {
      if (!walledCoveredArr.includes(wallNeighborArray[i])) {
        iterateThroughNeighbors(wallNeighborArray[i]);
        vertex(current.i * squareSide + squareSide / 2, current.j * squareSide + squareSide / 2);
      }
    }
  }
}
