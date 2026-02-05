import { toRad, toDeg } from "../math.js";

export function validateSSW({ alpha, beta, gamma, a, b, c }) {
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

  const isSwsCase = sideKeys.includes(adjacentSides[0]) && sideKeys.includes(adjacentSides[1]);
  if (isSwsCase) {
    return { error: "Für SsW: Winkel darf nicht zwischen den Seiten liegen (das ist SWS)." };
  }

  if (!sideKeys.includes(angleOppositeSide)) {
    return { error: "Für SsW: Winkel muss einer der eingegebenen Seiten gegenüberliegen." };
  }

  const aSide = sides[angleOppositeSide];
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

  return {
    ok: true,
    meta: { angleKey, angleValue, angleOppositeSide, otherSideKey, otherSide, aSide, sol },
  };
}

export function calculateSSW(input, validation) {
  let { alpha, beta, gamma, a, b, c } = input;
  const { angleKey, angleValue, otherSideKey, otherSide, aSide, sol } = validation.meta;

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

  return { a, b, c, alpha, beta, gamma };
}
