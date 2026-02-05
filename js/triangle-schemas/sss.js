import { toDeg } from "../math.js";

const clamp = (v) => Math.min(1, Math.max(-1, v));

export function validateSSS({ a, b, c }) {
  if (!(a > 0 && b > 0 && c > 0)) {
    return { error: "Ungültige Eingaben für SSS" };
  }
  if (a + b <= c || a + c <= b || b + c <= a) {
    return { error: "Ungültige Eingaben für SSS" };
  }
  return { ok: true };
}

export function calculateSSS(input) {
  let { a, b, c, alpha, beta, gamma } = input;

  const cosAlpha = (b * b + c * c - a * a) / (2 * b * c);
  const cosBeta = (a * a + c * c - b * b) / (2 * a * c);
  alpha = toDeg(Math.acos(clamp(cosAlpha)));
  beta = toDeg(Math.acos(clamp(cosBeta)));
  gamma = 180 - alpha - beta;

  return { a, b, c, alpha, beta, gamma };
}
