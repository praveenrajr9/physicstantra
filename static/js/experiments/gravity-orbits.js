/**
 * Gravity & Orbits - p5.js Simulation
 * Central sun with orbiting planets. Click to add new planets.
 * Gravitational physics: F = G*M*m/r^2
 */
new p5(function (p) {
  var G = 2;
  var sunMass = 5000;
  var sunRadius = 30;
  var sun;
  var planets = [];
  var maxTrailLength = 200;
  var planetColors;

  p.setup = function () {
    var w = Math.min(Math.max(p.windowWidth * 0.9, 400), 800);
    var canvas = p.createCanvas(w, 600);
    canvas.parent('sim-canvas');

    sun = {
      x: p.width / 2,
      y: p.height / 2,
      mass: sunMass,
      radius: sunRadius
    };

    planetColors = [
      [70, 130, 255],   // blue
      [255, 80, 80],    // red
      [80, 220, 120],   // green
      [255, 160, 60],   // orange
      [200, 100, 255],  // purple
      [255, 220, 80],   // yellow
      [100, 220, 220],  // cyan
      [255, 140, 180]   // pink
    ];

    // Add a default planet
    addPlanet(sun.x + 150, sun.y, 0, 2.5);
    addPlanet(sun.x - 220, sun.y, 0, -2.0);
    addPlanet(sun.x, sun.y - 180, 2.2, 0);
  };

  function addPlanet(px, py, vx, vy) {
    var colorIdx = planets.length % planetColors.length;
    var col = planetColors[colorIdx];

    // If no explicit velocity, compute tangential velocity for a roughly circular orbit
    if (vx === undefined || vy === undefined) {
      var dx = px - sun.x;
      var dy = py - sun.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var speed = Math.sqrt(G * sunMass / dist) * 0.8;
      // Tangential direction (perpendicular to radius)
      vx = -dy / dist * speed;
      vy = dx / dist * speed;
    }

    planets.push({
      x: px,
      y: py,
      vx: vx,
      vy: vy,
      mass: 10,
      radius: 8,
      color: col,
      trail: []
    });
  }

  p.draw = function () {
    p.background(10, 10, 46);

    // Update sun position in case of resize
    sun.x = p.width / 2;
    sun.y = p.height / 2;

    // Update and draw planets
    for (var i = planets.length - 1; i >= 0; i--) {
      var planet = planets[i];

      // Gravitational force
      var dx = sun.x - planet.x;
      var dy = sun.y - planet.y;
      var dist = Math.sqrt(dx * dx + dy * dy);

      // Remove planet if it hits the sun
      if (dist < sun.radius + planet.radius) {
        planets.splice(i, 1);
        continue;
      }

      // Remove planet if it flies too far off screen
      if (dist > Math.max(p.width, p.height) * 2) {
        planets.splice(i, 1);
        continue;
      }

      var force = G * sun.mass * planet.mass / (dist * dist);
      var ax = force / planet.mass * (dx / dist);
      var ay = force / planet.mass * (dy / dist);

      planet.vx += ax;
      planet.vy += ay;
      planet.x += planet.vx;
      planet.y += planet.vy;

      // Record trail
      planet.trail.push({ x: planet.x, y: planet.y });
      if (planet.trail.length > maxTrailLength) {
        planet.trail.shift();
      }
    }

    // Draw trails
    for (var i = 0; i < planets.length; i++) {
      var planet = planets[i];
      var trail = planet.trail;
      if (trail.length > 1) {
        p.noFill();
        p.strokeWeight(1.5);
        for (var j = 1; j < trail.length; j++) {
          var alpha = p.map(j, 0, trail.length, 10, 150);
          p.stroke(planet.color[0], planet.color[1], planet.color[2], alpha);
          p.line(trail[j - 1].x, trail[j - 1].y, trail[j].x, trail[j].y);
        }
      }
    }

    // Draw sun glow
    p.noStroke();
    for (var r = sun.radius * 3; r > sun.radius; r -= 4) {
      var alpha = p.map(r, sun.radius, sun.radius * 3, 40, 0);
      p.fill(255, 200, 50, alpha);
      p.ellipse(sun.x, sun.y, r * 2);
    }

    // Draw sun
    p.fill(255, 220, 50);
    p.ellipse(sun.x, sun.y, sun.radius * 2);
    p.fill(255, 245, 150, 120);
    p.ellipse(sun.x - sun.radius * 0.25, sun.y - sun.radius * 0.25, sun.radius * 0.6);

    // Draw planets
    for (var i = 0; i < planets.length; i++) {
      var planet = planets[i];
      p.noStroke();
      // Planet glow
      p.fill(planet.color[0], planet.color[1], planet.color[2], 30);
      p.ellipse(planet.x, planet.y, planet.radius * 4);

      // Planet body
      p.fill(planet.color[0], planet.color[1], planet.color[2]);
      p.ellipse(planet.x, planet.y, planet.radius * 2);

      // Highlight
      p.fill(255, 255, 255, 60);
      p.ellipse(planet.x - planet.radius * 0.3, planet.y - planet.radius * 0.3, planet.radius * 0.5);
    }

    // Instructions
    p.noStroke();
    p.fill(160, 160, 184);
    p.textSize(14);
    p.textAlign(p.CENTER);
    p.text('Click anywhere to add a new planet', p.width / 2, p.height - 20);

    // Planet count
    p.textAlign(p.LEFT);
    p.textSize(12);
    p.fill(255, 215, 0);
    p.text('Planets: ' + planets.length, 15, 25);
  };

  p.mousePressed = function () {
    // Only add if click is within canvas and not on the sun
    if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
      var dx = p.mouseX - sun.x;
      var dy = p.mouseY - sun.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > sun.radius + 20) {
        addPlanet(p.mouseX, p.mouseY);
      }
    }
  };

  p.windowResized = function () {
    var w = Math.min(Math.max(p.windowWidth * 0.9, 400), 800);
    p.resizeCanvas(w, 600);
  };
}, 'sim-canvas');
