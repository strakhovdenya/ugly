export function drawTriangle(canvas, a, b, c) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const pad = 24;

  const cssW = canvas.clientWidth || canvas.width;
  const cssH = canvas.clientHeight || canvas.height;
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Coordinates: A(0,0), B(c,0), C(x,y)
  const x = (b * b + c * c - a * a) / (2 * c);
  const y = Math.sqrt(Math.max(0, b * b - x * x));

  const minX = Math.min(0, c, x);
  const maxX = Math.max(0, c, x);
  const minY = Math.min(0, 0, y);
  const maxY = Math.max(0, 0, y);

  const scale = Math.min(
    (cssW - 2 * pad) / (maxX - minX || 1),
    (cssH - 2 * pad) / (maxY - minY || 1)
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
  const AyF = cssH - Ay;
  const ByF = cssH - By;
  const CyF = cssH - Cy;

  ctx.clearRect(0, 0, cssW, cssH);
  ctx.lineWidth = 2.4;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = "#5a54d6";
  ctx.fillStyle = "#222";
  ctx.font = "16px \"IBM Plex Sans\", \"Segoe UI\", sans-serif";

  const drawLabel = (text, xPos, yPos) => {
    const paddingX = 7;
    const paddingY = 4;
    const metrics = ctx.measureText(text);
    const width = metrics.width + paddingX * 2;
    const height = 22;
    const radius = 6;
    const left = xPos - width / 2;
    const top = yPos - height / 2;

    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.strokeStyle = "rgba(90, 84, 214, 0.25)";
    ctx.beginPath();
    ctx.moveTo(left + radius, top);
    ctx.arcTo(left + width, top, left + width, top + height, radius);
    ctx.arcTo(left + width, top + height, left, top + height, radius);
    ctx.arcTo(left, top + height, left, top, radius);
    ctx.arcTo(left, top, left + width, top, radius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#2f3440";
    ctx.fillText(text, left + paddingX, top + height - paddingY - 4);
  };

  const drawVertex = (xPos, yPos) => {
    ctx.fillStyle = "#5a54d6";
    ctx.beginPath();
    ctx.arc(xPos, yPos, 3.4, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawAngleArc = (vertex, p1, p2, radius) => {
    const v1x = p1.x - vertex.x;
    const v1y = p1.y - vertex.y;
    const v2x = p2.x - vertex.x;
    const v2y = p2.y - vertex.y;

    const a1 = Math.atan2(v1y, v1x);
    const a2 = Math.atan2(v2y, v2x);

    let start = a1;
    let end = a2;
    if (end < start) {
      const temp = start;
      start = end;
      end = temp;
    }
    if (end - start > Math.PI) {
      const temp = start;
      start = end;
      end = temp + Math.PI * 2;
    }

    ctx.strokeStyle = "rgba(108, 99, 255, 0.5)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(vertex.x, vertex.y, radius, start, end);
    ctx.stroke();
  };

  const gradient = ctx.createLinearGradient(Ax, AyF, Bx, CyF);
  gradient.addColorStop(0, "rgba(108, 99, 255, 0.12)");
  gradient.addColorStop(1, "rgba(118, 75, 162, 0.18)");

  ctx.beginPath();
  ctx.moveTo(Ax, AyF);
  ctx.lineTo(Bx, ByF);
  ctx.lineTo(Cx, CyF);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.stroke();

  // Angle arcs
  const arcRadius = Math.max(10, Math.min(20, Math.min(cssW, cssH) * 0.06));
  drawAngleArc({ x: Ax, y: AyF }, { x: Bx, y: ByF }, { x: Cx, y: CyF }, arcRadius);
  drawAngleArc({ x: Bx, y: ByF }, { x: Ax, y: AyF }, { x: Cx, y: CyF }, arcRadius);
  drawAngleArc({ x: Cx, y: CyF }, { x: Ax, y: AyF }, { x: Bx, y: ByF }, arcRadius);

  // Labels for vertices (angles)
  drawVertex(Ax, AyF);
  drawVertex(Bx, ByF);
  drawVertex(Cx, CyF);
  drawLabel("alpha", Ax + 16, AyF - 12);
  drawLabel("beta", Bx - 16, ByF - 12);
  drawLabel("gamma", Cx + 18, CyF + 12);

  // Labels for sides
  drawLabel("c", (Ax + Bx) / 2, (AyF + ByF) / 2 - 12);
  drawLabel("b", (Ax + Cx) / 2 - 14, (AyF + CyF) / 2);
  drawLabel("a", (Bx + Cx) / 2 + 14, (ByF + CyF) / 2);
}
