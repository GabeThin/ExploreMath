let fourier; // DFT object
let time = 0;
let path = []; // coordinate empty arrays
let drawing = [];
let coords = [];
let drawState = -1;

class Vector {
  constructor(x, y) {
    this.re = x;
    this.im = y;
  }

  add(c) {
    this.re += c.re;
    this.im += c.im;
  }

  multiply(c) {
    const real = this.re * c.re - this.im * c.im;
    const imaginary = this.re * c.im + this.im * c.re;
    return new Vector(real, imaginary);
  }
}

function setup() {
  createCanvas(800, 600); // creates black screen
}

function dft(x) { // DFT algorithm to get wave properties
  const X = [];
  const length  = x.length;
  for (let k = 0; k < length; k++) {
    let sum = new Vector(0, 0);
    for (let n = 0; n < length; n++) {
      const phi = (TWO_PI * k * n) / length;
      const v = new Vector(cos(phi), -sin(phi));
      sum.add(x[n].multiply(v));
    }

    sum.re = sum.re / length; // real and imaginary components in one vector
    sum.im = sum.im / length;

    let freq = k;
    let amp = sqrt(sum.re * sum.re + sum.im * sum.im);
    let phase = atan2(sum.im, sum.re);
    X[k] = { re: sum.re, im: sum.im, freq, amp, phase }; // returns real and imaginary components, frequency, amplitude, phase
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
    ellipse(prev_x, prev_y, radius * 2); // creates circle
    stroke(255);
    line(prev_x, prev_y, x, y); // creates line that rotates within circle
  }
  return createVector(x, y);
}

function drawPath(fourier) { // draws path of user drawing
  let vect = circles(width / 2, height / 2 + 100, fourier, 0);

  path.unshift(vect);

  stroke(255, 255, 0);

  beginShape();
  noFill();
  stroke(255, 100, 0);

  for (let i = 0; i < path.length; i++) { // constructs path using vertices
    vertex(path[i].x, path[i].y);
  }
  endShape();
}

function draw() {
  background(0);

  stroke(255);

  if (drawState == 0) { // if mouse is pressed:
    let coord = createVector(mouseX - width / 2, mouseY - height / 2 - 100); // creates coordinate at mouse position
    drawing.push(coord);
    noFill();
    beginShape();
    for (let vect of drawing) {
      vertex(vect.x + width / 2, vect.y + width / 2); //adds vertex for each coord
    }
    endShape();
  }

  if (drawState == 1) { // if mouse is released:
    drawPath(fourier); //draw user-drawn path

    time += TWO_PI / fourier.length; // updates time

    if (time > TWO_PI) {
      time = 0;
      path = [];
    }
  }
}

function mousePressed() { // if mouse is pressed:
  drawState = 0; // reset animations
  drawing = [];
  coords = [];
  time = 0;
  path = [];
}

function mouseReleased() { // if mouse is released:
  drawState = 1;
  time = 0; //reset time

  for (let i = 0; i < drawing.length; i++) {
    coords.push(new Vector(drawing[i].x, drawing[i].y)); // add mouse coordinates to drawing array
    fourier = dft(coords); // initializes DFT and sorts based on amplitude
    fourier.sort((a, b) => b.amp - a.amp);
  }
}
