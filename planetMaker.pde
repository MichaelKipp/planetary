/*
Author: Michael Kipp
Date: 12/15/2017
Project: Basic Gravity Sim
*/

ArrayList<Celestial> planets = new ArrayList<Celestial>();
ArrayList<Celestial> meteors = new ArrayList<Celestial>();

boolean planetCreation = false;
boolean meteorCreation = false;

float GRAVITY = 3;
float TRAIL_SIZE = 100;

PVector initialClick = new PVector(width/2, height/2);
float dragRadius;

void setup() {
  size(1080,720);
  smooth();
  background(255);
}

void draw() {
  background(255);
  noFill();
  if (planetCreation) {
    ellipse(initialClick.x, initialClick.y, 2 * dragRadius, 2 * dragRadius);
  }
  if (meteorCreation) {
    stroke(dragRadius, 255 - dragRadius, 10);
    line(mouseX, mouseY, initialClick.x, initialClick.y);
    stroke(210, 210, 210);
    ellipse(initialClick.x, initialClick.y, 200, 200);
  }

  for (int i = 0; i < planets.size(); i++) {
    planets.get(i).display();
  }
  for (int i = 0; i < meteors.size(); i++) {
    meteors.get(i).update();
    meteors.get(i).checkEdges();
    meteors.get(i).display();
  }
}

void mousePressed() {
  if (mousePressed && (mouseButton == RIGHT)) {
    initialClick = new PVector(mouseX, mouseY);
    planetCreation = true;
  }

  if (mousePressed && (mouseButton == LEFT)) {
    stroke(210, 210, 210);
    noFill();
    ellipse(initialClick.x, initialClick.y, 200, 200);
    initialClick = new PVector(mouseX, mouseY);
    meteorCreation = true;
  }
}

void mouseDragged() {
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

void mouseReleased() {
  if (planetCreation) {
    planets.add(new Celestial(initialClick.x, initialClick.y, dragRadius));
    planetCreation = false;
    dragRadius = 0;
  }
  if (meteorCreation) {
    meteors.add(new Celestial(initialClick.x, initialClick.y, 5, new PVector(0, 0), new PVector(((initialClick.x - mouseX)/width) * 15, ((initialClick.y - mouseY)/height) * 15), 10));
    meteorCreation = false;
    dragRadius = 0;
  }
}

class Celestial {
  ArrayList<PVector> history = new ArrayList<PVector>();
  color col;
  PVector location;
  PVector velocity;
  PVector acceleration;
  float radius;
  float topspeed;

  Celestial(float xPos, float yPos, float r) {
    col = color(random(100, 255), random(100, 255), random(100, 255));
    location = new PVector(xPos, yPos);
    radius = r;
    velocity = new PVector(0, 0);
    acceleration = new PVector(0, 0);
    topspeed = 0;
    ArrayList<Celestial> planets = new ArrayList<Celestial>();
  }

  Celestial(float xPos, float yPos, float r, PVector a, PVector v, float s) {
    col = color(random(100, 255), random(100, 255), random(100, 255));
    location = new PVector(xPos, yPos);
    radius = r;
    velocity = v;
    acceleration = a;
    topspeed = s;
  }

  void update() {
    PVector average = new PVector(0, 0);
    PVector force_vector = new PVector(0, 0);
    float force = 0.0;
    for (int i = 0; i < planets.size() || i < meteors.size(); i++) {
      if (i < planets.size()) {
        Celestial planet = planets.get(i);
        force = (GRAVITY * radius/10 * planet.radius)/(dist(location.x, location.y, planet.location.x, planet.location.y));
        force_vector = new PVector(location.x - planet.location.x, location.y - planet.location.y).normalize().mult(force);
        average.add(force_vector);
      }
      if (i < meteors.size()) {
        Celestial meteor = meteors.get(i);
        if (location != meteor.location) {
          force = (GRAVITY * radius/10 * meteor.radius)/(dist(location.x, location.y, meteor.location.x, meteor.location.y));
          force_vector = new PVector(location.x - meteor.location.x, location.y - meteor.location.y).normalize().mult(force);
          average.add(force_vector);
        }
      }
    }
    average.div(-1 * (planets.size() + meteors.size() + 1));
    acceleration = average;

    PVector l = new PVector(location.x, location.y);
    history.add(l);
    if (history.size() > TRAIL_SIZE) {
      history.remove(0);
    }
    velocity.add(acceleration);
    velocity.limit(topspeed);
    location.add(velocity);
  }

  void display() {
    stroke(0);
    fill(175);
    ellipse(location.x,location.y, 2*radius, 2*radius);
    for (int i = 0; i < history.size(); i++) {
      set((int)history.get(i).x, (int)history.get(i).y, col);
    }
  }

  void checkEdges() {
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
  }
}
