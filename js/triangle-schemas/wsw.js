import { toRad } from "../math.js";

export function validateWSW({ alpha, beta, gamma, a, b, c }) {
  if (alpha > 0 && beta > 0 && c > 0) return { ok: true, variant: "gamma" };
  if (alpha > 0 && gamma > 0 && b > 0) return { ok: true, variant: "beta" };
  if (beta > 0 && gamma > 0 && a > 0) return { ok: true, variant: "alpha" };
  return { error: "Ungültige Eingaben für WSW" };
}

export function calculateWSW(input, validation) {
  let { alpha, beta, gamma, a, b, c } = input;

  if (validation.variant === "gamma") {
    gamma = 180 - alpha - beta;
    a = c * Math.sin(toRad(alpha)) / Math.sin(toRad(gamma));
    b = c * Math.sin(toRad(beta)) / Math.sin(toRad(gamma));
  } else if (validation.variant === "beta") {
    beta = 180 - alpha - gamma;
    a = b * Math.sin(toRad(alpha)) / Math.sin(toRad(beta));
    c = b * Math.sin(toRad(gamma)) / Math.sin(toRad(beta));
  } else {
    alpha = 180 - beta - gamma;
    b = a * Math.sin(toRad(beta)) / Math.sin(toRad(alpha));
    c = a * Math.sin(toRad(gamma)) / Math.sin(toRad(alpha));
  }

  return { a, b, c, alpha, beta, gamma };
}
