export function drawTriangle(canvas, a, b, c) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const pad = 24;

  // Coordinates: A(0,0), B(c,0), C(x,y)
  const x = (b * b + c * c - a * a) / (2 * c);
  const y = Math.sqrt(Math.max(0, b * b - x * x));

  const minX = Math.min(0, c, x);
  const maxX = Math.max(0, c, x);
  const minY = Math.min(0, 0, y);
  const maxY = Math.max(0, 0, y);

  const scale = Math.min(
    (w - 2 * pad) / (maxX - minX || 1),
    (h - 2 * pad) / (maxY - minY || 1)
  );
  const offsetX = pad - minX * scale;
  const offsetY = pad - minY * scale;

  const Ax = 0 * scale + offsetX;
  const Ay = 0 * scale + offsetY;
  const Bx = c * scale + offsetX;
  const By = 0 * scale + offsetY;
  const Cx = x * scale + offsetX;
  const Cy = y * scale + offsetY;

  // Flip Y so side c is at the bottom of the canvas
  const AyF = h - Ay;
  const ByF = h - By;
  const CyF = h - Cy;

  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#5a54d6";
  ctx.fillStyle = "#222";
  ctx.font = "14px Arial, sans-serif";

  ctx.beginPath();
  ctx.moveTo(Ax, AyF);
  ctx.lineTo(Bx, ByF);
  ctx.lineTo(Cx, CyF);
  ctx.closePath();
  ctx.stroke();

  // Labels for vertices (angles)
  ctx.fillText("alpha", Ax - 6, AyF - 6);
  ctx.fillText("beta", Bx + 6, ByF - 6);
  ctx.fillText("gamma", Cx + 6, CyF + 6);

  // Labels for sides
  ctx.fillText("c", (Ax + Bx) / 2, (AyF + ByF) / 2 - 6);
  ctx.fillText("b", (Ax + Cx) / 2 - 10, (AyF + CyF) / 2);
  ctx.fillText("a", (Bx + Cx) / 2 + 6, (ByF + CyF) / 2);
}
