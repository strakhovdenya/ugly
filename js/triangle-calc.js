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
  } else if (schema === "SSW") {
    const sides = { a, b, c };
    const angles = { alpha, beta, gamma };
    const sideKeys = ["a", "b", "c"].filter((k) => sides[k] > 0);
    const angleKeys = ["alpha", "beta", "gamma"].filter((k) => angles[k] > 0);

    if (sideKeys.length !== 2 || angleKeys.length !== 1) {
      return { error: "Für SsW: genau 2 Seiten und 1 Winkel eingeben." };
    }

    const angleKey = angleKeys[0];
    const angleValue = angles[angleKey];

    const angleOppositeSide = angleKey === "alpha" ? "a" : angleKey === "beta" ? "b" : "c";
    const adjacentSides = angleKey === "alpha" ? ["b", "c"] : angleKey === "beta" ? ["a", "c"] : ["a", "b"];

    // SsW: angle must NOT be between the two given sides
    const isSwsCase = sideKeys.includes(adjacentSides[0]) && sideKeys.includes(adjacentSides[1]);
    if (isSwsCase) {
      return { error: "Für SsW: Winkel darf nicht zwischen den Seiten liegen (das ist SWS)." };
    }

    // SSA: angle is opposite one of the given sides
    if (!sideKeys.includes(angleOppositeSide)) {
      return { error: "Für SsW: Winkel muss einer der eingegebenen Seiten gegenüberliegen." };
    }

      const aSide = angleOppositeSide === "a" ? sides.a : angleOppositeSide === "b" ? sides.b : sides.c;
      const otherSideKey = sideKeys.find((k) => k !== angleOppositeSide);
      const otherSide = sides[otherSideKey];

      const sinOther = (otherSide * Math.sin(toRad(angleValue))) / aSide;
      if (sinOther > 1 || sinOther < -1) {
        return { error: "Ungültige Eingaben für SsW" };
      }

      const otherAngle1 = toDeg(Math.asin(sinOther));
      const otherAngle2 = 180 - otherAngle1;

      const buildFromAngles = (otherAngle) => {
        const remaining = 180 - angleValue - otherAngle;
        if (remaining <= 0) return null;
        const scale = aSide / Math.sin(toRad(angleValue));
        const otherSideComputed = scale * Math.sin(toRad(otherAngle));
        const remainingSide = scale * Math.sin(toRad(remaining));
        return { otherAngle, remaining, otherSideComputed, remainingSide };
      };

      const sol1 = buildFromAngles(otherAngle1);
      const sol2 = buildFromAngles(otherAngle2);
      const sol = sol1 || sol2;
      if (!sol) {
        return { error: "Ungültige Eingaben für SsW" };
      }

    if (angleKey === "alpha") {
      alpha = angleValue;
      if (otherSideKey === "b") {
        beta = sol.otherAngle;
        gamma = sol.remaining;
        b = otherSide;
        c = sol.remainingSide;
        a = aSide;
      } else {
        gamma = sol.otherAngle;
        beta = sol.remaining;
        c = otherSide;
        b = sol.remainingSide;
        a = aSide;
      }
    } else if (angleKey === "beta") {
      beta = angleValue;
      if (otherSideKey === "a") {
        alpha = sol.otherAngle;
        gamma = sol.remaining;
        a = otherSide;
        c = sol.remainingSide;
        b = aSide;
      } else {
        gamma = sol.otherAngle;
        alpha = sol.remaining;
        c = otherSide;
        a = sol.remainingSide;
        b = aSide;
      }
    } else {
      gamma = angleValue;
      if (otherSideKey === "a") {
        alpha = sol.otherAngle;
        beta = sol.remaining;
        a = otherSide;
        b = sol.remainingSide;
        c = aSide;
      } else {
        beta = sol.otherAngle;
        alpha = sol.remaining;
        b = otherSide;
        a = sol.remainingSide;
        c = aSide;
      }
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
