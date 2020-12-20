class Node {
  constructor(x, y, i, adj) {
    this.x = x;
    this.y = y;
    this.i = i;
    this.impossible = false;
    this.foundHere = false;
    
    if(adj) {
      this.adj = adj;
    } else {
      this.adj = new Set();

      // link up to the selected node
      if(selectedNode) {
        selectedNode.adj.add(this.i);
        this.adj.add(selectedNode.i);
      }

      selectedNode = this;
    }
  }
  
  draw() {
    push();
    if(this === selectedNode) {
      stroke(colours[1]);
    } else if(this === hoveredNode) {
      stroke(csGreen);
    } else {
      stroke(0);
    }
    strokeWeight(8);
    fill(this.impossible && cheatMode ? csRed : 255);
    circle(this.x * size, this.y * size + yOffset, size);
    
    if(this.foundHere && gameover) {
      push();
      drawDog(this.x * size, this.y * size + yOffset);
      pop();
    }
    
    pop();
  }
}

function evaluateImpossible() {
  const imposs = nodes.map(() => false);
  
  for(let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const impossible = [...node.adj].every(j => nodes[j].impossible || nodes[j] === selectedNode);
    imposs[i] = impossible;
  }
  
  for(let i = 0; i < nodes.length; i++) {
    nodes[i].impossible = imposs[i];
  }
}

function mousePressed() {
  if(hoveredNode && !gameover) {
    // select the current node, show that there's nothing there
    selectedNode = hoveredNode;
    moves++;
    
    // evaluate impossibility
    evaluateImpossible();
    
    // if it turns out that every node is impossible, then
    // this must be where the doggo is!
    const found = dfsAllImpossible();
    
    if(found) {
      // end the game
      gameover = true;
      hoveredNode.foundHere = true;
    }
  }
}

const dfsAllImpossible = (i = 0, visited = new Set()) => {
  visited.add(i);
  
  const node = nodes[i];
  const {impossible} = node;
  let couldItBe = true;
  
  if(!impossible) return false;
  
  for(const j of node.adj) {
    if(!visited.has(j)) {
      couldItBe = couldItBe && dfsAllImpossible(j, visited);
    }
  }
  
  return couldItBe;
}

const bg = "#e5ebf2";
const csGreen = "#44BFA3";
const csRed = "#ff6545";
const colours = ["#000000", "#AB8F33", "#354B45", "#98B0A9", "#BA9FE8", "#846CB0", "#AB8F33"];

const border = 100;
const size = 80;

let nodes = [];
let selectedNode;
let hoveredNode;
let gameover = false;

const yOffset = 100;

const codes = [
  "5.5.0.[1,3];3.5.1.[0,2];1.5.2.[1];7.5.3.[0,4];9.5.4.[3]", 
  "5.5.0.[1,2,3,4];2.3.1.[0];2.7.2.[0];8.7.3.[0];8.3.4.[0]",
  "5.2.0.[1,2];2.3.1.[0,5];8.3.2.[0,3];2.5.3.[2,4];8.7.4.[3];8.5.5.[1,6];2.7.6.[5]",
  "5.5.0.[1,5];7.5.1.[0,2];9.5.2.[1,3,4];8.3.3.[2];8.7.4.[2];3.5.5.[0,6,7];2.3.6.[5];2.7.7.[5]",
  "5.5.0.[1,3,5];3.4.1.[0,2];1.3.2.[1];7.4.3.[0,4];9.3.4.[3];5.7.5.[0,6];5.9.6.[5]",
  "5.5.0.[1,2,3,4];4.4.1.[0,11,12];4.6.2.[0,9,10];6.6.3.[0,7,8];6.4.4.[0,5,6];6.2.5.[4];8.4.6.[4];8.6.7.[3];6.8.8.[3];4.8.9.[2];2.6.10.[2];2.4.11.[1];4.2.12.[1]",
  "3.2.0.[1,4];3.5.1.[0,2,3,4];3.8.2.[1];7.8.3.[1];7.3.4.[1,0]",
  "5.1.0.[1,2];3.2.1.[0,5,6];7.2.2.[0,3,4];6.4.3.[2];8.4.4.[2,9,10];4.4.5.[1];2.4.6.[1,7,8];1.6.7.[6];3.6.8.[6];7.6.9.[4];9.6.10.[4]",
  "3.2.0.[1];7.2.1.[0,2];3.7.2.[1,3];7.9.3.[2,4];3.4.4.[3,5];7.7.5.[4,6];3.9.6.[5,7];7.4.7.[6]",
  "5.3.0.[1,4,5];5.6.1.[0,2,3,6,7];3.8.2.[1];7.8.3.[1];1.8.4.[0];9.8.5.[0];1.3.6.[1];9.3.7.[1]"
];

const optimalMoves = [6, 2, 10, 8, 10, 14, 1e9, 10, 12, 4];

let levelIndex = 0;
let complete = false;
let moves = 0;
let cheatMode = false;

// dog things
const lightColour = "#ffcc99";
const midColour = "#996633";
const darkColour = "#663300";
const redColour = "#ff6545";

function keyPressed() {
  if(key === "c") {
    cheatMode = !cheatMode;
  }
}

function drawDog(xC, yC, s = 100) {
  push();
  blink = (dist(mouseX, mouseY, xC, yC) <= 2 * s / 3);
  noStroke();
  
  // 1. ear backs
  fill(darkColour);
  rect(xC - s / 3, yC - s / 2, s / 2, s / 8, s / 16);
  rect(xC + s / 3, yC - s / 2, s / 2, s / 8, s / 16);
  
  // 2. the head
  fill(midColour);
  circle(xC, yC - s / 50, s);
  
  // 3. the tongue
  fill(redColour);
  rect(xC, yC + s / 2, s / 5, s / 3 + sin(frameCount / 3) * s / 20, s / 10)
  fill(0, 50);
  rect(xC, yC + s / 2 - s / 20, s / 40, s / 3 + sin(frameCount / 3) * s / 20, s / 40);
  
  // 4. mouth balls
  fill(darkColour);
  circle(xC - s / 6, yC + s / 3, s / 3);
  circle(xC + s / 6, yC + s / 3, s / 3);
  
  // 5. nose
  const noseY = yC + s / 3 - s / 30
  fill(0);
  stroke(0);
  strokeWeight(s / 12);
  strokeJoin(ROUND);
  beginShape();
  vertex(xC, noseY);
  vertex(xC - s / 12, noseY - s / 12);
  vertex(xC + s / 12, noseY - s / 12);
  vertex(xC, noseY);
  endShape();
  noStroke();
  
  // 6. eyes
  const eyeY = yC + s / 12
  const eyeSize = s / 8;
  
  stroke(0);
  strokeWeight(s / 20);
  noFill();
  arc(xC - s / 3, eyeY, eyeSize, eyeSize, PI, TWO_PI);
  arc(xC + s / 3, eyeY, eyeSize, eyeSize, PI, TWO_PI);
  
  if(!blink) {
    fill(0);
    circle(xC - s / 3, eyeY, eyeSize);
    circle(xC + s / 3, eyeY, eyeSize);
  }
  
  noStroke();
  
  // 7. ear fronts
  fill(darkColour);
  arc(xC - s / 3 - s / 4 + s / 5, yC - s / 2, 2 * s / 5, 2 * s / 5, 0, PI);
  arc(xC + s / 3 + s / 4 - s / 5, yC - s / 2, 2 * s / 5, 2 * s / 5, 0, PI);
  
  pop();
}

function setup() {
  createCanvas(800, 1000);
  
  textAlign(CENTER, CENTER);
  textFont("monospace");
  textSize(60);
  
  xC = width / 2;
  yC = height / 2;
  rectMode(CENTER);
  
  nodes = loadLevel(codes[0]);
  
  const prevButton = createButton("previous level");
  prevButton.mousePressed(() => {
    if(levelIndex > 0) {
      levelIndex--;
      nodes = loadLevel(codes[levelIndex]);
    }
  });
  prevButton.size(100, 100);
  prevButton.position(0, 0);
  
  const nextButton = createButton("next level");
  nextButton.mousePressed(() => {
    if(levelIndex < codes.length - 1) {
      levelIndex++;
      nodes = loadLevel(codes[levelIndex]);
    }
  });
  nextButton.size(100, 100);
  nextButton.position(700, 0);
}

function draw() {
  background(255);
  hoveredNode = null;
  
  // draw the top bar
  push();
  fill(0);
  noStroke();
  rect(width / 2, 50, width, 100);
  
  fill(255);
  text(`level ${levelIndex + 1}`, width / 2, 50);
  
  if(cheatMode) {
    fill(csRed);
    textSize(20);
    text("cheat mode is enabled!", width / 2, 85);
  }
  pop();
  
  // draw all the edges
  edgeDfs();
  
  // draw all the nodes
  for(const node of nodes) {
    // check for hover
    const {x, y} = node;
    if(dist(x * size, y * size + yOffset, mouseX, mouseY) < size / 2) {
      hoveredNode = node;
    }
    
    node.draw();
  }
  
  // bottom bar
  push();
  fill(0);
  noStroke();
  rect(width / 2, 950, width, 100);
  fill(255);
  
  if(gameover) {
    textSize(20);
    text(`congratulations! you found the dog in ${moves} moves!`, width / 2, 930);
    if(moves <= optimalMoves[levelIndex]) {
      fill(colours[1]);
      text(`that's the best possible score! you did it!`, width / 2, 970);
    } else {
      fill(csRed);
      text(`but you could have done it in fewer moves..`, width / 2, 970);
    }
  } else {
    text(`moves: ${moves}`, width / 2, 950);
  }
  pop();
  
  if(hoveredNode) cursor(HAND);
  else cursor(ARROW);
}

function edgeDfs(i = 0, visited = new Set()) {
  const node = nodes[i];
  const x0 = node.x * size;
  const y0 = node.y * size + yOffset;
  
  visited.add(i);
  
  for(const j of node.adj) {
    const next = nodes[j];
    const x1 = next.x * size;
    const y1 = next.y * size + yOffset;
    
    // draw the edge
    push();
    strokeWeight(8);
    line(x0, y0, x1, y1);
    pop();
    
    // visit the node
    if(!visited.has(j)) edgeDfs(j, visited)
  }
}

function loadLevel(code) {
  const nodes = code.split(";").map(line => {
    const [xS, yS, iS, adjS] = line.split(".");
    const [x, y, i] = [xS, yS, iS].map(Number);
    const nexts = adjS.slice(1, adjS.length - 1).split(",").map(Number);
    
    const adj = new Set(nexts);
    return new Node(x, y, i, adj);
  });
  
  moves = 0;
  gameover = false;
  
  return nodes;
}
