/**
 * Projectile Motion - p5.js Simulation
 * Launch a projectile with adjustable angle and velocity.
 * Displays trajectory, max height, range, and time of flight.
 */
(function () {
  // Build HTML controls
  var controls = document.getElementById('sim-controls');
  if (controls) {
    controls.innerHTML =
      '<div class="sim-control-group">' +
        '<span class="sim-control-label">Angle</span>' +
        '<input type="range" id="pm-angle" min="5" max="85" value="45" step="1">' +
        '<span class="sim-control-value" id="pm-angle-val">45°</span>' +
      '</div>' +
      '<div class="sim-control-group">' +
        '<span class="sim-control-label">Velocity</span>' +
        '<input type="range" id="pm-velocity" min="10" max="100" value="50" step="1">' +
        '<span class="sim-control-value" id="pm-velocity-val">50 m/s</span>' +
      '</div>' +
      '<button class="sim-btn" id="pm-fire">Fire!</button>' +
      '<button class="sim-btn reset" id="pm-reset">Reset</button>';
  }

  var angleInput = document.getElementById('pm-angle');
  var angleValEl = document.getElementById('pm-angle-val');
  var velInput = document.getElementById('pm-velocity');
  var velValEl = document.getElementById('pm-velocity-val');
  var fireBtn = document.getElementById('pm-fire');
  var resetBtn = document.getElementById('pm-reset');

  // Update labels in real time
  if (angleInput) angleInput.addEventListener('input', function () {
    angleValEl.textContent = this.value + '\u00B0';
  });
  if (velInput) velInput.addEventListener('input', function () {
    velValEl.textContent = this.value + ' m/s';
  });

  new p5(function (p) {
    var GRAVITY = 9.8;
    var SCALE = 3;
    var groundY, cannonX = 60, cannonBaseY;

    var projectile = null;
    var trail = [];
    var fired = false;
    var completed = false;

    var maxHeightPx = 0, maxHeightM = 0, rangeM = 0, timeOfFlight = 0, maxHeightX = 0;
    var launchAngle = 45, launchVelocity = 50;

    p.setup = function () {
      var w = Math.min(Math.max(p.windowWidth * 0.9, 400), 800);
      var canvas = p.createCanvas(w, 500);
      canvas.parent('sim-canvas');
      groundY = p.height - 60;
      cannonBaseY = groundY;

      if (fireBtn) fireBtn.addEventListener('click', launch);
      if (resetBtn) resetBtn.addEventListener('click', resetSim);
    };

    function launch() {
      launchAngle = angleInput ? parseInt(angleInput.value) : 45;
      launchVelocity = velInput ? parseInt(velInput.value) : 50;

      var angleRad = p.radians(launchAngle);
      projectile = {
        x: cannonX,
        y: cannonBaseY,
        vx: launchVelocity * p.cos(angleRad) * SCALE,
        vy: -launchVelocity * p.sin(angleRad) * SCALE,
        t: 0
      };

      trail = [];
      fired = true;
      completed = false;
      maxHeightPx = cannonBaseY;
      maxHeightM = 0;
      maxHeightX = cannonX;
      rangeM = 0;
      timeOfFlight = 0;
    }

    function resetSim() {
      projectile = null;
      trail = [];
      fired = false;
      completed = false;
      maxHeightPx = 0;
      maxHeightM = 0;
      rangeM = 0;
      timeOfFlight = 0;
      maxHeightX = 0;
    }

    p.draw = function () {
      launchAngle = angleInput ? parseInt(angleInput.value) : 45;
      launchVelocity = velInput ? parseInt(velInput.value) : 50;

      p.background(10, 10, 46);

      // Ground
      p.stroke(50, 180, 80);
      p.strokeWeight(3);
      p.line(0, groundY, p.width, groundY);
      p.noStroke();
      p.fill(30, 100, 40, 60);
      p.rect(0, groundY, p.width, p.height - groundY);

      // Grid lines
      p.stroke(255, 255, 255, 15);
      p.strokeWeight(1);
      for (var gx = 0; gx < p.width; gx += 50) {
        p.line(gx, 0, gx, groundY);
      }
      for (var gy = 0; gy < groundY; gy += 50) {
        p.line(0, gy, p.width, gy);
      }

      drawCannon();

      // Update projectile
      if (fired && projectile && !completed) {
        var dt = 1 / 60;
        projectile.t += dt;
        projectile.vy += GRAVITY * SCALE * dt;
        projectile.x += projectile.vx * dt;
        projectile.y += projectile.vy * dt;

        trail.push({ x: projectile.x, y: projectile.y });

        if (projectile.y < maxHeightPx) {
          maxHeightPx = projectile.y;
          maxHeightX = projectile.x;
          maxHeightM = (cannonBaseY - projectile.y) / SCALE;
        }

        if (projectile.y >= groundY && projectile.t > 0.05) {
          projectile.y = groundY;
          completed = true;
          rangeM = (projectile.x - cannonX) / SCALE;
          timeOfFlight = projectile.t;
        }
      }

      // Trajectory trail
      if (trail.length > 1) {
        p.noFill();
        p.strokeWeight(2);
        for (var i = 1; i < trail.length; i++) {
          var alpha = p.map(i, 0, trail.length, 80, 255);
          p.stroke(255, 255, 255, alpha);
          p.line(trail[i - 1].x, trail[i - 1].y, trail[i].x, trail[i].y);
        }
      }

      // Projectile
      if (fired && projectile) {
        p.noStroke();
        p.fill(255, 215, 0);
        p.ellipse(projectile.x, projectile.y, 14);
        p.fill(255, 235, 100, 100);
        p.ellipse(projectile.x, projectile.y, 22);
      }

      // Markers
      if (fired) {
        if (maxHeightM > 0) {
          p.stroke(255, 100, 100);
          p.strokeWeight(1);
          p.drawingContext.setLineDash([4, 4]);
          p.line(maxHeightX, maxHeightPx, maxHeightX, groundY);
          p.drawingContext.setLineDash([]);
          p.noStroke();
          p.fill(255, 100, 100);
          p.textSize(11);
          p.textAlign(p.CENTER);
          p.text(maxHeightM.toFixed(1) + ' m', maxHeightX, maxHeightPx - 10);
        }

        if (completed && projectile) {
          p.stroke(100, 200, 255);
          p.strokeWeight(1);
          p.drawingContext.setLineDash([4, 4]);
          p.line(cannonX, groundY + 15, projectile.x, groundY + 15);
          p.drawingContext.setLineDash([]);
          p.noStroke();
          p.fill(100, 200, 255);
          p.textSize(11);
          p.textAlign(p.CENTER);
          p.text(rangeM.toFixed(1) + ' m', (cannonX + projectile.x) / 2, groundY + 30);
        }
      }

      drawStats();
    };

    function drawCannon() {
      var angleRad = p.radians(launchAngle);
      var barrelLen = 40;

      p.push();
      p.translate(cannonX, cannonBaseY);

      // Base
      p.noStroke();
      p.fill(80, 80, 100);
      p.ellipse(0, 0, 30, 16);

      // Barrel
      p.stroke(120, 120, 140);
      p.strokeWeight(10);
      p.strokeCap(p.ROUND);
      p.line(0, 0, barrelLen * p.cos(-angleRad), barrelLen * p.sin(-angleRad));

      // Barrel tip highlight
      p.stroke(160, 160, 180);
      p.strokeWeight(6);
      var tipX = barrelLen * p.cos(-angleRad);
      var tipY = barrelLen * p.sin(-angleRad);
      p.line(tipX * 0.8, tipY * 0.8, tipX, tipY);

      p.pop();
    }

    function drawStats() {
      var panelW = 190;
      var panelH = 85;
      var panelX = p.width - panelW - 10;
      var panelY = 10;

      p.noStroke();
      p.fill(18, 18, 58, 210);
      p.rect(panelX, panelY, panelW, panelH, 10);

      // Border accent
      p.fill(255, 215, 0);
      p.rect(panelX, panelY, 3, panelH, 3, 0, 0, 3);

      p.fill(255, 255, 255, 150);
      p.textSize(10);
      p.textAlign(p.LEFT);
      p.text('STATS', panelX + 14, panelY + 16);

      p.fill(255, 215, 0);
      p.textSize(12);
      p.text('Max Height:  ' + maxHeightM.toFixed(1) + ' m', panelX + 14, panelY + 36);
      p.text('Range:       ' + rangeM.toFixed(1) + ' m', panelX + 14, panelY + 54);
      p.text('Time:        ' + timeOfFlight.toFixed(2) + ' s', panelX + 14, panelY + 72);
    }

    p.windowResized = function () {
      var w = Math.min(Math.max(p.windowWidth * 0.9, 400), 800);
      p.resizeCanvas(w, 500);
      groundY = p.height - 60;
      cannonBaseY = groundY;
    };
  }, 'sim-canvas');
})();
