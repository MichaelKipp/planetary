/*
Author: Michael Kipp
Date: 12/15/2017
Project: Basic Gravity Sim
*/

var planets;
var meteors;
var planetCreation;
var meteorCreation;
var GRAVITY;
var gravitySlider;
var TRAIL_SIZE;
var TOP_SPEED;
var initialClick;
var dragRadius;
var paused = false;

var launchedMeteor
var createdPlanet
var hasPaused

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);

  planets = [];
  meteors = [];
  planetCreation = 0;
  meteorCreation = 0;
  GRAVITY = 5;
  TRAIL_SIZE = 100;
  TOP_SPEED = 10;
  initialClick = createVector(width/2, height/2);
  dragRadius = 0;

  // gravitySlider = createSlider(0, 100, 5);
  // gravitySlider.position(20, 20);
}

function draw() {
  if (!paused) {
    background(255);
    noFill();
    // GRAVITY = gravitySlider.value();
    if (planetCreation) {
      ellipse(initialClick.x, initialClick.y, 2 * dragRadius, 2 * dragRadius);
    }
    if (meteorCreation) {
      stroke(dragRadius, 255 - dragRadius, 10);
      line(mouseX, mouseY, initialClick.x, initialClick.y);
      stroke(210, 210, 210);
      ellipse(initialClick.x, initialClick.y, 200, 200);
    }

    for (var i = 0; i < planets.length; i++) {
      planets[i].display();
    }
    for (var i = 0; i < meteors.length; i++) {
      meteors[i].update();
      meteors[i].checkEdges();
      meteors[i].display();
    }
    push();
    stroke(0, 0, 0);
    strokeWeight(2.5);
    fill(255, .75);
    textSize(30);
    if (!launchedMeteor) {
      text("Click and drag to shoot a meteor", (windowWidth * 1/5), (windowHeight/2));
    }
    if (!createdPlanet) {
      text("Right click and drag to create a planet", (windowWidth * 1/5), (windowHeight/2) + 30);
    }
    if (!hasPaused) {
      text("Space to pause", (windowWidth * 1/5), (windowHeight/2) + 60);
    }
    pop();
  }
}

function keyPressed() {
  if (keyCode == 32) {
    paused = !paused
    hasPaused = true;
  }
  return false;
}

function mousePressed() {
  if (mousePressed && mouseButton == RIGHT) {
    initialClick = createVector(mouseX, mouseY);
    planetCreation = 1;
  }
  if (mousePressed && mouseButton == LEFT) {
    stroke(210, 210, 210);
    noFill();
    ellipse(initialClick.x, initialClick.y, 200, 200);
    initialClick = createVector(mouseX, mouseY);
    meteorCreation = 1;
  }
}

function mouseDragged() {
  if (planetCreation) {
    dragRadius = dist(mouseX, mouseY, initialClick.x, initialClick.y);
    stroke(10);
    noFill();
    ellipse(initialClick.x, initialClick.y, 2 * dragRadius, 2 * dragRadius);
  }
  if (meteorCreation) {
    dragRadius = dist(mouseX, mouseY, initialClick.x, initialClick.y);
    stroke(210, 255 - dragRadius, 210);
    line(mouseX, mouseY, initialClick.x, initialClick.y);
    stroke(210, 210, 210);
    noFill();
    ellipse(initialClick.x, initialClick.y, 200, 200);
  }
}

function mouseReleased() {
  if (planetCreation) {
    planets.push(new Celestial(createVector(initialClick.x, initialClick.y), dragRadius, createVector(0, 0), createVector(0, 0), 0));
    planetCreation = 0;
    dragRadius = 0;
    createdPlanet = true;
  }
  if (meteorCreation) {
    meteors.push(new Celestial(createVector(initialClick.x, initialClick.y), 5, createVector(0, 0), createVector(((initialClick.x - mouseX)/width) * 15, ((initialClick.y - mouseY)/height) * 15), TOP_SPEED));
    meteorCreation = 0;
    dragRadius = 0;
    launchedMeteor = true;
  }
}

function Celestial (location, radius, acceleration, velocity, topspeed) {
  var history = new Array();
  var col = color(random(100, 200), random(100, 200), random(100, 200));
  this.location = location;
  this.velocity = velocity;
  this.acceleration = acceleration;
  this.radius = radius;
  this.topspeed = topspeed;

  this.update = function() {
    var average = createVector(0, 0);
    var force_vector = createVector(0, 0);
    var force = 0.0;
    for (var i = 0; i < planets.length || i < meteors.length; i++) {
      if (i < planets.length) {
        var planet = planets[i];
        force = (GRAVITY * radius/15 * planet.radius)/(dist(location.x, location.y, planet.location.x, planet.location.y));
        force_vector = createVector(location.x - planet.location.x, location.y - planet.location.y).normalize().mult(force);
        average.add(force_vector);
      }
      if (i < meteors.length) {
        var meteor = meteors[i];
        if (location != meteor.location) {
          force = (GRAVITY * radius/10 * meteor.radius)/(dist(location.x, location.y, meteor.location.x, meteor.location.y));
          force_vector = createVector(location.x - meteor.location.x, location.y - meteor.location.y).normalize().mult(force);
          average.add(force_vector);
        }
      }
    }
    average.div(-1 * (planets.length + meteors.length + 1));
    acceleration = average;

    var l = createVector(location.x, location.y);
    history.push(l);
    if (history.length > TRAIL_SIZE) {
      history.splice(0, 1);
    }
    velocity.add(acceleration);
    velocity.limit(topspeed);
    location.add(velocity);
  };

  this.display = function() {
    stroke(0);
    fill(175);
    ellipse(location.x,location.y, 2*radius, 2*radius);
    for (var i = 0; i < history.length; i++) {
      stroke(col);
      point(history[i].x, history[i].y);
    }
  };

  this.checkEdges = function() {
    if (location.x > width) {
      location.x = 0;
    } else if (location.x < 0) {
      location.x = width;
    }

    if (location.y > height) {
      location.y = 0;
    }  else if (location.y < 0) {
      location.y = height;
    }
  };
}
