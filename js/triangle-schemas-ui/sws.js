export function validateUiSWS(values) {
  const { alpha, beta, gamma, a, b, c } = values;
  const sidesCount = [a, b, c].filter((v) => v > 0).length;
  const anglesCount = [alpha, beta, gamma].filter((v) => v > 0).length;
  if (sidesCount !== 2 || anglesCount !== 1) {
    return { error: "Für SWS: genau 2 Seiten und 1 Winkel eingeben." };
  }
  return { ok: true };
}
