/**
 * Wave Interference - p5.js Simulation
 * Two draggable point sources emitting circular waves.
 * Visualizes constructive and destructive interference patterns.
 */
new p5(function (p) {
  var source1, source2;
  var draggingSource = null;
  var wavelength = 40;
  var speed = 2;
  var time = 0;
  var resolution = 4; // pixel step for performance
  var freqSlider;

  p.setup = function () {
    var w = Math.min(Math.max(p.windowWidth * 0.9, 400), 800);
    var canvas = p.createCanvas(w, 600);
    canvas.parent('sim-canvas');

    source1 = { x: p.width * 0.35, y: p.height * 0.5 };
    source2 = { x: p.width * 0.65, y: p.height * 0.5 };

    // Wavelength slider
    freqSlider = p.createSlider(15, 80, 40, 1);
    freqSlider.parent('sim-canvas');
    freqSlider.style('width', '150px');
    freqSlider.position(10, p.height + 10);

    p.pixelDensity(1);
  };

  p.draw = function () {
    wavelength = freqSlider.value();
    time += speed;

    var k = p.TWO_PI / wavelength;

    p.loadPixels();

    for (var y = 0; y < p.height; y += resolution) {
      for (var x = 0; x < p.width; x += resolution) {
        // Distance from each source
        var d1 = p.dist(x, y, source1.x, source1.y);
        var d2 = p.dist(x, y, source2.x, source2.y);

        // Wave amplitude from each source (with distance falloff)
        var amp1 = p.sin(k * d1 - time * 0.1) / Math.max(1, Math.sqrt(d1) * 0.15);
        var amp2 = p.sin(k * d2 - time * 0.1) / Math.max(1, Math.sqrt(d2) * 0.15);

        // Combined amplitude
        var combined = amp1 + amp2;

        // Map to color
        // Constructive: bright blue-white, Destructive: dark
        var brightness = p.map(combined, -2, 2, 0, 1);
        brightness = p.constrain(brightness, 0, 1);

        var r = Math.floor(brightness * 60);
        var g = Math.floor(brightness * 120 + 20);
        var b = Math.floor(brightness * 255);

        // Fill block of pixels for performance
        for (var dy = 0; dy < resolution && y + dy < p.height; dy++) {
          for (var dx = 0; dx < resolution && x + dx < p.width; dx++) {
            var idx = 4 * ((y + dy) * p.width + (x + dx));
            p.pixels[idx] = r;
            p.pixels[idx + 1] = g;
            p.pixels[idx + 2] = b;
            p.pixels[idx + 3] = 255;
          }
        }
      }
    }

    p.updatePixels();

    // Draw source markers
    drawSource(source1, 'S1');
    drawSource(source2, 'S2');

    // Instructions and label
    p.noStroke();
    p.fill(255, 215, 0, 200);
    p.textSize(13);
    p.textAlign(p.LEFT);
    p.text('Wavelength: ' + wavelength + ' px', 10, p.height - 16);

    p.fill(160, 160, 184);
    p.textSize(14);
    p.textAlign(p.CENTER);
    p.text('Drag the sources (S1, S2) to move them', p.width / 2, 25);
  };

  function drawSource(src, label) {
    // Outer glow
    p.noStroke();
    p.fill(255, 215, 0, 40);
    p.ellipse(src.x, src.y, 36);

    // Inner circle
    p.fill(255, 215, 0);
    p.stroke(255, 245, 200);
    p.strokeWeight(2);
    p.ellipse(src.x, src.y, 16);

    // Label
    p.noStroke();
    p.fill(255);
    p.textSize(11);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(label, src.x, src.y - 18);
  }

  p.mousePressed = function () {
    if (p.dist(p.mouseX, p.mouseY, source1.x, source1.y) < 20) {
      draggingSource = source1;
    } else if (p.dist(p.mouseX, p.mouseY, source2.x, source2.y) < 20) {
      draggingSource = source2;
    }
  };

  p.mouseDragged = function () {
    if (draggingSource) {
      draggingSource.x = p.constrain(p.mouseX, 10, p.width - 10);
      draggingSource.y = p.constrain(p.mouseY, 10, p.height - 10);
    }
  };

  p.mouseReleased = function () {
    draggingSource = null;
  };

  p.windowResized = function () {
    var w = Math.min(Math.max(p.windowWidth * 0.9, 400), 800);
    p.resizeCanvas(w, 600);
  };
}, 'sim-canvas');
