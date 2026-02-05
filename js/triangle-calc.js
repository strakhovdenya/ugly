import { toRad, toDeg } from "./math.js";

export function calculateTriangle(input) {
  let { schema, alpha, beta, gamma, a, b, c } = input;

  if (schema === "SWS") {
    if (alpha > 0 && b > 0 && c > 0) {
      a = Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(toRad(alpha)));
      beta = toDeg(Math.acos((a * a + c * c - b * b) / (2 * a * c)));
      gamma = 180 - alpha - beta;
    } else if (beta > 0 && a > 0 && c > 0) {
      b = Math.sqrt(a * a + c * c - 2 * a * c * Math.cos(toRad(beta)));
      alpha = toDeg(Math.acos((b * b + c * c - a * a) / (2 * b * c)));
      gamma = 180 - alpha - beta;
    } else if (gamma > 0 && a > 0 && b > 0) {
      c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(toRad(gamma)));
      alpha = toDeg(Math.acos((b * b + c * c - a * a) / (2 * b * c)));
      beta = 180 - alpha - gamma;
    } else {
      return { error: "Ungültige Eingaben für SWS" };
    }
  } else if (schema === "WSW") {
    if (alpha > 0 && beta > 0 && c > 0) {
      gamma = 180 - alpha - beta;
      a = c * Math.sin(toRad(alpha)) / Math.sin(toRad(gamma));
      b = c * Math.sin(toRad(beta)) / Math.sin(toRad(gamma));
    } else if (alpha > 0 && gamma > 0 && b > 0) {
      beta = 180 - alpha - gamma;
      a = b * Math.sin(toRad(alpha)) / Math.sin(toRad(beta));
      c = b * Math.sin(toRad(gamma)) / Math.sin(toRad(beta));
    } else if (beta > 0 && gamma > 0 && a > 0) {
      alpha = 180 - beta - gamma;
      b = a * Math.sin(toRad(beta)) / Math.sin(toRad(alpha));
      c = a * Math.sin(toRad(gamma)) / Math.sin(toRad(alpha));
    } else {
      return { error: "Ungültige Eingaben für WSW" };
    }
  } else if (schema === "SSS") {
    if (a > 0 && b > 0 && c > 0) {
      if (a + b <= c || a + c <= b || b + c <= a) {
        return { error: "Ungültige Eingaben für SSS" };
      }
      const cosAlpha = (b * b + c * c - a * a) / (2 * b * c);
      const cosBeta = (a * a + c * c - b * b) / (2 * a * c);
      const clamp = (v) => Math.min(1, Math.max(-1, v));
      alpha = toDeg(Math.acos(clamp(cosAlpha)));
      beta = toDeg(Math.acos(clamp(cosBeta)));
      gamma = 180 - alpha - beta;
    } else {
      return { error: "Ungültige Eingaben für SSS" };
    }
  } else {
    return { error: "Ungültiges Schema" };
  }

  const angleSum = alpha + beta + gamma;
  if (!isFinite(alpha) || !isFinite(beta) || !isFinite(gamma) || alpha <= 0 || beta <= 0 || gamma <= 0 || Math.abs(angleSum - 180) > 0.1) {
    return { error: "Ungültige Eingaben für Winkel" };
  }

  let typeBySides = "";
  if (Math.abs(a - b) < 0.01 && Math.abs(b - c) < 0.01) {
    typeBySides = "gleichseitig";
  } else if (Math.abs(a - b) < 0.01 || Math.abs(a - c) < 0.01 || Math.abs(b - c) < 0.01) {
    typeBySides = "gleichschenklig";
  } else {
    typeBySides = "ungleichseitig";
  }

  let typeByAngles = "";
  if (Math.abs(alpha - 90) < 0.01 || Math.abs(beta - 90) < 0.01 || Math.abs(gamma - 90) < 0.01) {
    typeByAngles = "rechtwinklig";
  } else if (alpha > 90 || beta > 90 || gamma > 90) {
    typeByAngles = "stumpfwinklig";
  } else {
    typeByAngles = "spitzwinklig";
  }

  return { a, b, c, alpha, beta, gamma, typeBySides, typeByAngles };
}
