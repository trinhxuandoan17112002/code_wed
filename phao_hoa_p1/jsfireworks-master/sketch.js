const GRAVITY = 0.2;
const SHELLTYPES = [
  "simple",
  "split",
  "burst",
  "double",
  "mega",
  "writer",
  "pent",
  "comet",
];

let PAUSED = false;
let MUTE = false;

var shells = [];
var sparks = [];
var sounds = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  strokeWeight(1);
  colorMode(HSB);
  for (let i = 0; i < 3; i++) {
    sounds.push(loadSound("sounds/explosion" + i + ".mp3"));
  }
}

/*
From p5.js docs: Called directly after setup(), the draw() function continuously
executes the lines of code contained inside its block until the program is
stopped or noLoop() is called.
*/
function draw() {
  translate(width / 2, height);
  background("rgba(0, 0, 0, 0.2)");

  /* Remove the exploded shells and burnt out sparks */
  shells = shells.filter((shell) => !shell.exploded);
  sparks = sparks.filter((spark) => spark.brt > 0);

  /* Draw the shells and sparks */
  for (let shell of shells) shell.draw();
  for (let spark of sparks) spark.draw();

  /* Generate new shell with small probability */
  if (random() < 0.03) {
    let s = new Shell();
    shells.push(s);
  }
}

function touchMoved() {
  touchStarted();
  return false;
}

function touchStarted() {
  let speed = createVector(0, 0);
  let pos = createVector(mouseX - width / 2, mouseY - height);
  let s = new Shell(pos, speed);
  s.explode();
  return false;
}

function keyPressed() {
  // Space bar
  if (keyCode == 32) {
    if (!PAUSED) {
      PAUSED = true;

      // Draw a pause symbol in top right corner
      strokeWeight(1);
      fill(255);
      rect(width / 2 - 30, -height + 20, 10, 30);
      rect(width / 2 - 50, -height + 20, 10, 30);

      // Stop the draw loop
      noLoop();
    } else {
      PAUSED = false;
      loop();
    }
    return false;
  }
  // 's' for sound effects
  if (keyCode == 83) {
    MUTE = !MUTE;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function Shell(pos, vel, type, sparkTrail) {
  this.pos = pos || createVector(int(random(-width / 4, width / 4)), 0);
  this.vel = vel || createVector(random(-2, 2), -random(11, 16));
  this.sparkTrail = sparkTrail || random() < 0.5;
  this.fuse = random(-3, -1);
  this.hue = round(random(0, 360));
  this.type = type;
  this.exploded = false;

  // Get random type, if not set
  if (this.type == undefined) {
    let randIndex = floor(random(0, SHELLTYPES.length));
    this.type = SHELLTYPES[randIndex];
  }

  this.draw = () => {
    // Explode if at the apex (i.e., vel )
    if (this.fuse < this.vel.y) {
      this.explode();
      return;
    }

    // Spark trail
    if (this.sparkTrail) {
      // Random spark direction between 0 and 2 pi
      let sparkDir = random(0, TWO_PI);
      // Random velocity between 0 and 1
      let sparkVel = random(0, 1);
      // Random speed? - maybe the jitter?
      let sparkSpd = createVector(
        sparkVel * cos(sparkDir),
        sparkVel * sin(sparkDir)
      );
      // Spark position
      let sparkPos = createVector(
        this.pos.x + sparkSpd.x,
        this.pos.y + sparkSpd.y
      );
      let s = new Spark(
        sparkPos,
        sparkSpd,
        random(50, 75),
        floor(random(20, 40)),
        floor(random(0, 30))
      );
      sparks.push(s);
    }

    // Color shell ±10 hue and 0-20 saturation, fixed brightness
    stroke(this.hue + round(random(-10, 10)), random(0, 20), 90);
    point(this.pos.x, this.pos.y);

    // Update shell position
    this.pos.add(this.vel);
    this.vel.y = this.vel.y + GRAVITY;
  };

  this.drawSparks = (
    numSparks,
    velMin,
    velMax,
    fadeMin,
    fadeMax,
    type,
    baseDir,
    angle
  ) => {
    for (let i = 0; i < numSparks; i++) {
      let dir = random(0, TWO_PI);
      if (baseDir != undefined) dir = baseDir + random(0, PI / angle);
      let vel = random(velMin, velMax);
      let sparkSpd = createVector(
        this.vel.x + vel * cos(dir),
        this.vel.y + vel * sin(dir)
      );
      let hue = this.hue + round(random(-10, 10));
      let sat = round(random(0, 40));
      let fade = random(fadeMin, fadeMax);
      let spark = new Spark(this.pos.copy(), sparkSpd, fade, hue, sat, type);
      sparks.push(spark);
    }
  };

  this.explode = () => {
    if (this.type == "split") {
      this.drawSparks(30, 3, 5, 3, 8, "writer");
      this.drawSparks(10, 3, 5, 3, 6, "sparkr");
    } else if (this.type == "burst") {
      this.drawSparks(60, 0, 6, 3, 8, "sparkr");
    } else if (this.type == "double") {
      this.drawSparks(90, 3, 5, 2, 4);
      this.drawSparks(90, 0.5, 2, 4, 6, "writer");
    } else if (this.type == "mega") {
      this.drawSparks(600, 0, 8, 3, 8);
    } else if (this.type == "writer") {
      this.drawSparks(100, 0, 5, 1, 3, "writer");
    } else if (this.type == "simple") {
      this.drawSparks(100, 0, 5, 1, 3);
    } else if (this.type == "pent") {
      let baseDir = random(0, TWO_PI);
      this.drawSparks(20, 3, 5, 3, 8, "writer", baseDir + (2 / 5) * PI, 6);
      this.drawSparks(20, 3, 5, 3, 8, "writer", baseDir + (4 / 5) * PI, 6);
      this.drawSparks(20, 3, 5, 3, 8, "writer", baseDir + (6 / 5) * PI, 6);
      this.drawSparks(20, 3, 5, 3, 8, "writer", baseDir + (8 / 5) * PI, 6);
      this.drawSparks(20, 3, 5, 3, 8, "writer", baseDir + (10 / 5) * PI, 6);
    } else if (this.type == "comet") {
      let baseDir = random(0, TWO_PI);
      this.drawSparks(10, 3, 7, 3, 8, "sparkr", baseDir + (2 / 3) * PI, 128);
      this.drawSparks(10, 3, 7, 3, 8, "sparkr", baseDir + (4 / 3) * PI, 128);
      this.drawSparks(10, 3, 7, 3, 8, "sparkr", baseDir + (6 / 3) * PI, 128);
      this.drawSparks(200, 0, 8, 3, 8, "writer");
    }
    this.exploded = true;
    if (!MUTE) {
      let randIndex = floor(random(0, sounds.length));
      sounds[randIndex].play();
    }
  };
}

function Spark(pos, vel, fade, hue, sat, type = "default") {
  // Position
  this.pos = pos;

  // Velocity
  this.vel = vel;

  this.fade = fade;
  this.hue = hue;
  this.sat = sat;
  this.type = type;

  // Brightness
  this.brt = 255;
  this.burntime = 0;

  this.draw = () => {
    // Color
    stroke(this.hue, this.sat, this.brt);

    // Trail
    // NB: Confusing
    let newXPos = this.pos.x + log(this.burntime) * 8 * this.vel.x;
    let newYPos =
      this.pos.y +
      log(this.burntime) * 8 * this.vel.y +
      this.burntime * GRAVITY;
    point(newXPos, newYPos);

    if (this.type == "writer" && this.burntime > 1) {
      line(
        newXPos,
        newYPos,
        this.pos.x + log(this.burntime - 2) * 8 * this.vel.x,
        this.pos.y +
          log(this.burntime - 2) * 8 * this.vel.y +
          this.burntime * GRAVITY
      );
    }

    if (this.type == "sparkr") {
      let dir = random(0, TWO_PI);
      let vel = random(0, 1);
      let sparkSpd = createVector(vel * cos(dir), vel * sin(dir));
      let spark = new Spark(
        createVector(newXPos + sparkSpd.x, newYPos + sparkSpd.y),
        sparkSpd,
        random(50, 75),
        round(random(20, 40)),
        round(random(0, 30))
      );
      sparks.push(spark);
    }

    // Fade
    this.brt -= this.fade;
    this.burntime++;
  };
}
