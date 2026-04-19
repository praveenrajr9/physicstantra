/**
 * Projectile Motion - p5.js Simulation
 * Launch a projectile with adjustable angle and velocity.
 * Displays trajectory, max height, range, and time of flight.
 */
new p5(function (p) {
  var GRAVITY = 9.8;
  var SCALE = 3; // pixels per meter
  var groundY;
  var cannonX = 60;
  var cannonBaseY;

  var angleSlider, velocitySlider;
  var fireButton;
  var angleLabel, velocityLabel;

  var projectile = null;
  var trail = [];
  var fired = false;
  var completed = false;

  var maxHeightPx = 0;
  var maxHeightM = 0;
  var rangeM = 0;
  var timeOfFlight = 0;
  var maxHeightX = 0;

  var launchAngle = 45;
  var launchVelocity = 50;

  p.setup = function () {
    var w = Math.min(Math.max(p.windowWidth * 0.9, 400), 800);
    var canvas = p.createCanvas(w, 500);
    canvas.parent('sim-canvas');

    groundY = p.height - 60;
    cannonBaseY = groundY;

    // Create controls container
    var container = p.select('#sim-canvas');

    // Angle slider
    angleSlider = p.createSlider(5, 85, 45, 1);
    angleSlider.parent('sim-canvas');
    angleSlider.style('width', '120px');
    angleSlider.position(10, p.height + 10);

    // Velocity slider
    velocitySlider = p.createSlider(10, 100, 50, 1);
    velocitySlider.parent('sim-canvas');
    velocitySlider.style('width', '120px');
    velocitySlider.position(200, p.height + 10);

    // Fire button
    fireButton = p.createButton('Fire!');
    fireButton.parent('sim-canvas');
    fireButton.position(400, p.height + 8);
    fireButton.style('background', '#ffd700');
    fireButton.style('color', '#0a0a2e');
    fireButton.style('border', 'none');
    fireButton.style('padding', '6px 24px');
    fireButton.style('border-radius', '20px');
    fireButton.style('font-weight', 'bold');
    fireButton.style('cursor', 'pointer');
    fireButton.style('font-size', '14px');
    fireButton.mousePressed(launch);
  };

  function launch() {
    launchAngle = angleSlider.value();
    launchVelocity = velocitySlider.value();

    var angleRad = p.radians(launchAngle);
    var vx = launchVelocity * p.cos(angleRad) * SCALE;
    var vy = -launchVelocity * p.sin(angleRad) * SCALE;

    projectile = {
      x: cannonX,
      y: cannonBaseY,
      vx: vx,
      vy: vy,
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

  p.draw = function () {
    p.background(10, 10, 46);

    launchAngle = angleSlider.value();
    launchVelocity = velocitySlider.value();

    // Ground
    p.stroke(50, 180, 80);
    p.strokeWeight(3);
    p.line(0, groundY, p.width, groundY);
    p.noStroke();
    p.fill(30, 100, 40, 60);
    p.rect(0, groundY, p.width, p.height - groundY);

    // Draw cannon
    drawCannon();

    // Update projectile
    if (fired && projectile && !completed) {
      var dt = 1 / 60;
      projectile.t += dt;
      projectile.vy += GRAVITY * SCALE * dt;
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;

      trail.push({ x: projectile.x, y: projectile.y });

      // Track max height
      if (projectile.y < maxHeightPx) {
        maxHeightPx = projectile.y;
        maxHeightX = projectile.x;
        maxHeightM = (cannonBaseY - projectile.y) / SCALE;
      }

      // Check landing
      if (projectile.y >= groundY && projectile.t > 0.05) {
        projectile.y = groundY;
        completed = true;
        rangeM = (projectile.x - cannonX) / SCALE;
        timeOfFlight = projectile.t;
      }
    }

    // Draw trajectory trail
    if (trail.length > 1) {
      p.noFill();
      p.strokeWeight(2);
      for (var i = 1; i < trail.length; i++) {
        var alpha = p.map(i, 0, trail.length, 80, 255);
        p.stroke(255, 255, 255, alpha);
        p.line(trail[i - 1].x, trail[i - 1].y, trail[i].x, trail[i].y);
      }
    }

    // Draw projectile
    if (fired && projectile) {
      p.noStroke();
      p.fill(255, 215, 0);
      p.ellipse(projectile.x, projectile.y, 14);
      p.fill(255, 235, 100, 100);
      p.ellipse(projectile.x, projectile.y, 20);
    }

    // Draw markers
    if (fired) {
      // Max height marker
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

      // Range marker
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

    // Draw stats panel
    drawStats();

    // Draw slider labels
    p.noStroke();
    p.fill(200);
    p.textSize(12);
    p.textAlign(p.LEFT);
    p.text('Angle: ' + launchAngle + '\u00B0', 10, p.height - 16);
    p.text('Velocity: ' + launchVelocity + ' m/s', 200, p.height - 16);
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

    p.pop();
  }

  function drawStats() {
    p.noStroke();
    p.fill(18, 18, 58, 200);
    p.rect(p.width - 190, 10, 180, 80, 8);

    p.fill(255, 215, 0);
    p.textSize(12);
    p.textAlign(p.LEFT);
    p.text('Max Height: ' + maxHeightM.toFixed(1) + ' m', p.width - 180, 32);
    p.text('Range: ' + rangeM.toFixed(1) + ' m', p.width - 180, 50);
    p.text('Time: ' + timeOfFlight.toFixed(2) + ' s', p.width - 180, 68);
  }

  p.windowResized = function () {
    var w = Math.min(Math.max(p.windowWidth * 0.9, 400), 800);
    p.resizeCanvas(w, 500);
    groundY = p.height - 60;
    cannonBaseY = groundY;
  };
}, 'sim-canvas');
