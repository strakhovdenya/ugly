import { toRad, toDeg } from "../math.js";

export function validateSWS({ alpha, beta, gamma, a, b, c }) {
  if (alpha > 0 && b > 0 && c > 0) return { ok: true, variant: "alpha" };
  if (beta > 0 && a > 0 && c > 0) return { ok: true, variant: "beta" };
  if (gamma > 0 && a > 0 && b > 0) return { ok: true, variant: "gamma" };
  return { error: "Ungültige Eingaben für SWS" };
}

export function calculateSWS(input, validation) {
  let { alpha, beta, gamma, a, b, c } = input;

  if (validation.variant === "alpha") {
    a = Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(toRad(alpha)));
    beta = toDeg(Math.acos((a * a + c * c - b * b) / (2 * a * c)));
    gamma = 180 - alpha - beta;
  } else if (validation.variant === "beta") {
    b = Math.sqrt(a * a + c * c - 2 * a * c * Math.cos(toRad(beta)));
    alpha = toDeg(Math.acos((b * b + c * c - a * a) / (2 * b * c)));
    gamma = 180 - alpha - beta;
  } else {
    c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(toRad(gamma)));
    alpha = toDeg(Math.acos((b * b + c * c - a * a) / (2 * b * c)));
    beta = 180 - alpha - gamma;
  }

  return { a, b, c, alpha, beta, gamma };
}
