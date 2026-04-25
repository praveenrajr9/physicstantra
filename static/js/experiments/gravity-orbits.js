/**
 * Gravity & Orbits - p5.js Simulation
 * Central sun with orbiting planets. Click to add new planets.
 * Gravitational physics: F = G*M*m/r^2
 */
(function () {
  var controls = document.getElementById('sim-controls');
  if (controls) {
    controls.innerHTML =
      '<div class="sim-control-group">' +
        '<span class="sim-control-label">Gravity</span>' +
        '<input type="range" id="go-gravity" min="0.5" max="5" value="2" step="0.1">' +
        '<span class="sim-control-value" id="go-gravity-val">2.0</span>' +
      '</div>' +
      '<div class="sim-control-group">' +
        '<span class="sim-control-label">Sun Mass</span>' +
        '<input type="range" id="go-sunmass" min="1000" max="10000" value="5000" step="500">' +
        '<span class="sim-control-value" id="go-sunmass-val">5000</span>' +
      '</div>' +
      '<button class="sim-btn reset" id="go-clear">Clear Planets</button>' +
      '<span class="sim-info">Click to add planets</span>';
  }

  var gravInput = document.getElementById('go-gravity');
  var gravValEl = document.getElementById('go-gravity-val');
  var massInput = document.getElementById('go-sunmass');
  var massValEl = document.getElementById('go-sunmass-val');
  var clearBtn = document.getElementById('go-clear');

  if (gravInput) gravInput.addEventListener('input', function () {
    gravValEl.textContent = parseFloat(this.value).toFixed(1);
  });
  if (massInput) massInput.addEventListener('input', function () {
    massValEl.textContent = this.value;
  });

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
        [70, 130, 255], [255, 80, 80], [80, 220, 120], [255, 160, 60],
        [200, 100, 255], [255, 220, 80], [100, 220, 220], [255, 140, 180]
      ];

      addPlanet(sun.x + 150, sun.y, 0, 2.5);
      addPlanet(sun.x - 220, sun.y, 0, -2.0);
      addPlanet(sun.x, sun.y - 180, 2.2, 0);

      if (clearBtn) clearBtn.addEventListener('click', function () {
        planets = [];
      });
    };

    function addPlanet(px, py, vx, vy) {
      var colorIdx = planets.length % planetColors.length;
      var col = planetColors[colorIdx];

      if (vx === undefined || vy === undefined) {
        var dx = px - sun.x;
        var dy = py - sun.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var speed = Math.sqrt(G * sunMass / dist) * 0.8;
        vx = -dy / dist * speed;
        vy = dx / dist * speed;
      }

      planets.push({
        x: px, y: py, vx: vx, vy: vy,
        mass: 10, radius: 8, color: col, trail: []
      });
    }

    p.draw = function () {
      G = gravInput ? parseFloat(gravInput.value) : 2;
      sunMass = massInput ? parseInt(massInput.value) : 5000;
      sun.mass = sunMass;

      p.background(10, 10, 46);

      sun.x = p.width / 2;
      sun.y = p.height / 2;

      for (var i = planets.length - 1; i >= 0; i--) {
        var planet = planets[i];
        var dx = sun.x - planet.x;
        var dy = sun.y - planet.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < sun.radius + planet.radius) { planets.splice(i, 1); continue; }
        if (dist > Math.max(p.width, p.height) * 2) { planets.splice(i, 1); continue; }

        var force = G * sun.mass * planet.mass / (dist * dist);
        planet.vx += force / planet.mass * (dx / dist);
        planet.vy += force / planet.mass * (dy / dist);
        planet.x += planet.vx;
        planet.y += planet.vy;

        planet.trail.push({ x: planet.x, y: planet.y });
        if (planet.trail.length > maxTrailLength) planet.trail.shift();
      }

      // Trails
      for (var i = 0; i < planets.length; i++) {
        var trail = planets[i].trail;
        if (trail.length > 1) {
          p.noFill();
          p.strokeWeight(1.5);
          for (var j = 1; j < trail.length; j++) {
            var alpha = p.map(j, 0, trail.length, 10, 150);
            p.stroke(planets[i].color[0], planets[i].color[1], planets[i].color[2], alpha);
            p.line(trail[j - 1].x, trail[j - 1].y, trail[j].x, trail[j].y);
          }
        }
      }

      // Sun glow
      p.noStroke();
      for (var r = sun.radius * 3; r > sun.radius; r -= 4) {
        var alpha = p.map(r, sun.radius, sun.radius * 3, 40, 0);
        p.fill(255, 200, 50, alpha);
        p.ellipse(sun.x, sun.y, r * 2);
      }

      // Sun
      p.fill(255, 220, 50);
      p.ellipse(sun.x, sun.y, sun.radius * 2);
      p.fill(255, 245, 150, 120);
      p.ellipse(sun.x - sun.radius * 0.25, sun.y - sun.radius * 0.25, sun.radius * 0.6);

      // Planets
      for (var i = 0; i < planets.length; i++) {
        var planet = planets[i];
        p.noStroke();
        p.fill(planet.color[0], planet.color[1], planet.color[2], 30);
        p.ellipse(planet.x, planet.y, planet.radius * 4);
        p.fill(planet.color[0], planet.color[1], planet.color[2]);
        p.ellipse(planet.x, planet.y, planet.radius * 2);
        p.fill(255, 255, 255, 60);
        p.ellipse(planet.x - planet.radius * 0.3, planet.y - planet.radius * 0.3, planet.radius * 0.5);
      }

      // Planet count badge
      p.noStroke();
      p.fill(18, 18, 58, 200);
      p.rect(10, 10, 100, 28, 8);
      p.fill(255, 215, 0);
      p.textSize(12);
      p.textAlign(p.LEFT);
      p.text('Planets: ' + planets.length, 20, 29);
    };

    p.mousePressed = function () {
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
})();
