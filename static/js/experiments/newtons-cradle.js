/**
 * Newton's Cradle - p5.js Simulation
 * Demonstrates conservation of momentum and energy transfer.
 * Click-drag the end balls to pull them back.
 */
(function () {
  var controls = document.getElementById('sim-controls');
  if (controls) {
    controls.innerHTML =
      '<div class="sim-control-group">' +
        '<span class="sim-control-label">Gravity</span>' +
        '<input type="range" id="nc-gravity" min="0.1" max="1" value="0.4" step="0.05">' +
        '<span class="sim-control-value" id="nc-gravity-val">0.40</span>' +
      '</div>' +
      '<div class="sim-control-group">' +
        '<span class="sim-control-label">Damping</span>' +
        '<input type="range" id="nc-damping" min="0.990" max="1" value="0.999" step="0.001">' +
        '<span class="sim-control-value" id="nc-damping-val">0.999</span>' +
      '</div>' +
      '<button class="sim-btn reset" id="nc-reset">Reset</button>' +
      '<span class="sim-info">Drag end balls to swing</span>';
  }

  var gravInput = document.getElementById('nc-gravity');
  var gravValEl = document.getElementById('nc-gravity-val');
  var dampInput = document.getElementById('nc-damping');
  var dampValEl = document.getElementById('nc-damping-val');
  var resetBtn = document.getElementById('nc-reset');

  if (gravInput) gravInput.addEventListener('input', function () {
    gravValEl.textContent = parseFloat(this.value).toFixed(2);
  });
  if (dampInput) dampInput.addEventListener('input', function () {
    dampValEl.textContent = parseFloat(this.value).toFixed(3);
  });

  new p5(function (p) {
    var NUM_BALLS = 5;
    var balls = [];
    var stringLen = 180;
    var ballRadius = 22;
    var anchorY = 40;
    var gravity = 0.4;
    var damping = 0.999;
    var dragging = false;
    var dragIndex = -1;

    function Ball(anchorX, index) {
      this.anchorX = anchorX;
      this.anchorY = anchorY;
      this.angle = 0;
      this.angleV = 0;
      this.angleA = 0;
      this.index = index;
      this.x = anchorX;
      this.y = anchorY + stringLen;
    }

    Ball.prototype.update = function () {
      this.angleA = (-gravity / stringLen) * p.sin(this.angle);
      this.angleV += this.angleA;
      this.angleV *= damping;
      this.angle += this.angleV;
      this.x = this.anchorX + stringLen * p.sin(this.angle);
      this.y = this.anchorY + stringLen * p.cos(this.angle);
    };

    Ball.prototype.display = function () {
      // String
      p.stroke(220);
      p.strokeWeight(1.5);
      p.line(this.anchorX, this.anchorY, this.x, this.y);

      // Ball shadow
      p.noStroke();
      p.fill(255, 215, 0, 20);
      p.ellipse(this.x, this.y, ballRadius * 2.6);

      // Ball
      p.fill(255, 215, 0);
      p.ellipse(this.x, this.y, ballRadius * 2);

      // Highlight
      p.fill(255, 235, 100, 80);
      p.ellipse(this.x - ballRadius * 0.3, this.y - ballRadius * 0.3, ballRadius * 0.7);
    };

    function initBalls() {
      balls = [];
      var w = p.width;
      var totalWidth = (NUM_BALLS - 1) * ballRadius * 2;
      var startX = w / 2 - totalWidth / 2;
      for (var i = 0; i < NUM_BALLS; i++) {
        balls.push(new Ball(startX + i * ballRadius * 2, i));
      }
    }

    p.setup = function () {
      var w = Math.min(Math.max(p.windowWidth * 0.9, 400), 800);
      var canvas = p.createCanvas(w, 500);
      canvas.parent('sim-canvas');
      initBalls();

      if (resetBtn) resetBtn.addEventListener('click', initBalls);
    };

    p.draw = function () {
      gravity = gravInput ? parseFloat(gravInput.value) : 0.4;
      damping = dampInput ? parseFloat(dampInput.value) : 0.999;

      p.background(10, 10, 46);

      // Top bar
      var barLeft = balls[0].anchorX - ballRadius;
      var barRight = balls[NUM_BALLS - 1].anchorX + ballRadius;
      p.stroke(120);
      p.strokeWeight(4);
      p.line(barLeft, anchorY, barRight, anchorY);

      // Bar end caps
      p.noStroke();
      p.fill(120);
      p.ellipse(barLeft, anchorY, 8);
      p.ellipse(barRight, anchorY, 8);

      // Update physics
      for (var i = 0; i < NUM_BALLS; i++) {
        if (!(dragging && i === dragIndex)) {
          balls[i].update();
        }
      }

      // Collision
      for (var i = 0; i < NUM_BALLS - 1; i++) {
        var b1 = balls[i];
        var b2 = balls[i + 1];
        var dist = p.dist(b1.x, b1.y, b2.x, b2.y);
        if (dist <= ballRadius * 2) {
          var temp = b1.angleV;
          b1.angleV = b2.angleV;
          b2.angleV = temp;
          var overlap = ballRadius * 2 - dist;
          if (overlap > 0) {
            b1.angle -= overlap * 0.001;
            b2.angle += overlap * 0.001;
          }
        }
      }

      // Display
      for (var i = 0; i < NUM_BALLS; i++) {
        balls[i].display();
      }
    };

    p.mousePressed = function () {
      for (var i = 0; i < NUM_BALLS; i++) {
        var d = p.dist(p.mouseX, p.mouseY, balls[i].x, balls[i].y);
        if (d < ballRadius && (i === 0 || i === NUM_BALLS - 1)) {
          dragging = true;
          dragIndex = i;
          balls[i].angleV = 0;
          break;
        }
      }
    };

    p.mouseDragged = function () {
      if (dragging && dragIndex >= 0) {
        var b = balls[dragIndex];
        var dx = p.mouseX - b.anchorX;
        var dy = p.mouseY - b.anchorY;
        var angle = p.atan2(dx, dy);
        angle = p.constrain(angle, -p.PI / 3, p.PI / 3);
        b.angle = angle;
        b.x = b.anchorX + stringLen * p.sin(b.angle);
        b.y = b.anchorY + stringLen * p.cos(b.angle);
        b.angleV = 0;
      }
    };

    p.mouseReleased = function () {
      dragging = false;
      dragIndex = -1;
    };

    p.windowResized = function () {
      var w = Math.min(Math.max(p.windowWidth * 0.9, 400), 800);
      p.resizeCanvas(w, 500);
      var totalWidth = (NUM_BALLS - 1) * ballRadius * 2;
      var startX = w / 2 - totalWidth / 2;
      for (var i = 0; i < NUM_BALLS; i++) {
        balls[i].anchorX = startX + i * ballRadius * 2;
      }
    };
  }, 'sim-canvas');
})();
