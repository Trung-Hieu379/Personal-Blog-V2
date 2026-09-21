
function drawSketchBorders() {
  const buttons = document.querySelectorAll('.sketch-btn');

  buttons.forEach((btn, index) => {
    const canvas = btn.querySelector('.sketch-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // get size
    const rect = btn.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    // Sketch styling config
    ctx.strokeStyle = '#02721b'; // Ink color
    ctx.lineWidth = 2;            // Thickness of pp
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // make a seed base based on text content + index
    const btnText = btn.textContent.trim();
    let seed = btnText.split('').reduce((acc, char) => acc + char.charCodeAt(0), 42) + index;

    // Linear Congruential Generator (LCG)
    function seededRandom() {
      const a = 1664525;
      const c = 1013904223;
      const m = Math.pow(2, 32);
      seed = (a * seed + c) % m;
      return seed / m;
    }

    // draw a wobbly line from (x1,y1) to (x2,y2)
    function drawWobblyLine(x1, y1, x2, y2) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);

      const distance = Math.hypot(x2 - x1, y2 - y1);
      const segments = Math.max(4, Math.floor(distance / 10)); // every 10px

      for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        // find the straight path point w/ linear interlop? interlope idk what am I doing
        let px = x1 + (x2 - x1) * t;
        let py = y1 + (y2 - y1) * t;

        // Skip applying wobble to the absolute final endpoint so corners meet up
        if (i < segments) {
          const wobble = 1.5;
          px += (seededRandom() - 0.5) * wobble;
          py += (seededRandom() - 0.5) * wobble;
        }

        ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // draw one full
    function drawPass() {
      const padding = 3; // Keep lines slightly inside canvas edge
      const offset = () => (seededRandom() - 0.5) * 3; 

      const tl = { x: padding + offset(), y: padding + offset() };
      const tr = { x: w - padding + offset(), y: padding + offset() };
      const br = { x: w - padding + offset(), y: h - padding + offset() };
      const bl = { x: padding + offset(), y: h - padding + offset() };

      // Draw all 4 
      drawWobblyLine(tl.x, tl.y, tr.x, tr.tr || tr.y);
      drawWobblyLine(tr.x, tr.y, br.x, br.y);
      drawWobblyLine(br.x, br.y, bl.x, bl.y);
      drawWobblyLine(bl.x, bl.y, tl.x, tl.y);
    }

    // Run two separate passes to simulate a designer drawing over the line twice
    drawPass();
    drawPass();
  });
}

drawSketchBorders();
