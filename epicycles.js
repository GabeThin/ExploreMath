let fourierX; // DFT object
let fourierY;
let time = 0;
let path = []; // coordinate empty arrays
let drawing = [];
let x = [];
let y = [];
let drawState = -1;

function setup() {
  createCanvas(1000, 800); // creates black screen
}

function dft(x) { // DFT algorithm to get wave properties
  const X = [];
  const length = x.length;
  for (let k = 0; k < length; k++) {
    let re = 0;
    let im = 0;
    for (let n = 0; n < length; n++) {
      const phi = (TWO_PI * k * n) / length;
      re += x[n] * cos(phi); // real and imaginary components
      im -= x[n] * sin(phi);
    }
    re = re / length;
    im = im / length;

    let freq = k;
    let amp = sqrt(re * re + im * im);
    let phase = atan2(im, re);
    X[k] = { re, im, freq, amp, phase }; // returns real and imaginary components, frequency, amplitude, phase
  }
  return X;
}

function circles(x, y, fourier, rotation) { // draws epicycles
  for(let i = 0; i < fourier.length; i++) { // for each wave in the DFT:
    let prev_x = x;
    let prev_y = y;

    let freq = fourier[i].freq; // wave properties
    let radius = fourier[i].amp;
    let phase = fourier[i].phase;

    x += radius * cos(freq * time + phase + rotation); // updates coordinates
    y += radius * sin(freq * time + phase + rotation);

    stroke(255, 100);
    noFill();
    ellipse(prev_x, prev_y, radius * 2); // create circle
    stroke(255);
    line(prev_x, prev_y, x, y); // create line that rotates within circle
  }
  return createVector(x, y);
}

function drawPath(fourierX, fourierY) { // draws path of user drawing
  let pathX = circles(width / 2, height / 2 - 200, fourierX, 0);
  let pathY = circles(100, height / 2 + 100, fourierY, HALF_PI); //90 degree rotation because of y-axis

  let vect = [pathX.x, pathY.y];

  path.unshift(vect);

  stroke(255, 255, 0);
  line(pathX.x, pathX.y, vect[0], vect[1]); // lines to connect from path to epicycles
  line(pathY.x, pathY.y, vect[0], vect[1]);

  beginShape();
  noFill();
  stroke(255, 100, 0);

  for (let i = 0; i < path.length; i++) { // constructs path using vertices
    vertex(path[i][0], path[i][1]);
  }
  endShape();
}

function draw() {
  background(0);

  stroke(255);

  if (drawState == 0) { // if mouse is pressed:
    let coord = createVector(mouseX - width / 2, mouseY - height / 2 - 100); //creates coordinate at mouse position
    drawing.push(coord);
    noFill();
    stroke(255, 255, 0);
    beginShape();
    for (let vect of drawing) {
      vertex(vect.x + width / 2, vect.y + width / 2) // adds vertex for each coord
    }
    endShape();
  }

  if (drawState == 1) { // if mouse is released:
    drawPath(fourierX, fourierY); //draw user-drawn path

    time += TWO_PI / fourierY.length; // updates time

    if (time > TWO_PI) {
      time = 0;
      path = [];
    }
  }
}

function mousePressed() { // if mouse is pressed:
  drawState = 0; //reset animations
  drawing = [];
  x = [];
  y = [];
  time = 0;
  path = [];
}

function mouseReleased() { // if mouse is released:
  drawState = 1;
  time = 0; //reset time

  for (let i = 0; i < drawing.length; i++) {
    x.push(drawing[i].x); // add mouse coordinates to drawing array
    y.push(drawing[i].y);
    fourierX = dft(x); // initializes DFT and sorts based on amplitude
    fourierY = dft(y);
    fourierX.sort((a, b) => b.amp - a.amp);
    fourierY.sort((a, b) => b.amp - a.amp);
  }
}
