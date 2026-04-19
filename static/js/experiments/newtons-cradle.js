/**
 * Newton's Cradle - p5.js Simulation
 * Demonstrates conservation of momentum and energy transfer.
 * 5 balls hanging from fixed points, click-drag the leftmost to pull back.
 */
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

    // Ball
    p.noStroke();
    p.fill(255, 215, 0);
    p.ellipse(this.x, this.y, ballRadius * 2);

    // Highlight
    p.fill(255, 235, 100, 80);
    p.ellipse(this.x - ballRadius * 0.3, this.y - ballRadius * 0.3, ballRadius * 0.7);
  };

  p.setup = function () {
    var w = Math.min(Math.max(p.windowWidth * 0.9, 400), 800);
    var canvas = p.createCanvas(w, 500);
    canvas.parent('sim-canvas');

    var totalWidth = (NUM_BALLS - 1) * ballRadius * 2;
    var startX = w / 2 - totalWidth / 2;

    for (var i = 0; i < NUM_BALLS; i++) {
      balls.push(new Ball(startX + i * ballRadius * 2, i));
    }
  };

  p.draw = function () {
    p.background(10, 10, 46);

    // Top bar
    var barLeft = balls[0].anchorX - ballRadius;
    var barRight = balls[NUM_BALLS - 1].anchorX + ballRadius;
    p.stroke(120);
    p.strokeWeight(4);
    p.line(barLeft, anchorY, barRight, anchorY);

    // Update physics
    for (var i = 0; i < NUM_BALLS; i++) {
      if (!(dragging && i === dragIndex)) {
        balls[i].update();
      }
    }

    // Collision detection - transfer momentum between adjacent balls
    for (var i = 0; i < NUM_BALLS - 1; i++) {
      var b1 = balls[i];
      var b2 = balls[i + 1];
      var dist = p.dist(b1.x, b1.y, b2.x, b2.y);
      if (dist <= ballRadius * 2) {
        // Elastic collision: swap angular velocities
        var temp = b1.angleV;
        b1.angleV = b2.angleV;
        b2.angleV = temp;

        // Push apart slightly to prevent overlap
        var overlap = ballRadius * 2 - dist;
        if (overlap > 0) {
          b1.angle -= overlap * 0.001;
          b2.angle += overlap * 0.001;
        }
      }
    }

    // Display all balls
    for (var i = 0; i < NUM_BALLS; i++) {
      balls[i].display();
    }

    // Instructions
    p.noStroke();
    p.fill(160, 160, 184);
    p.textSize(14);
    p.textAlign(p.CENTER);
    p.text('Click and drag the end balls to pull them back', p.width / 2, p.height - 20);
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
      // Limit swing angle
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
