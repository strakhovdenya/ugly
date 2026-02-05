export function validateUiWSW(values) {
  const { alpha, beta, gamma, a, b, c } = values;
  const sidesCount = [a, b, c].filter((v) => v > 0).length;
  const anglesCount = [alpha, beta, gamma].filter((v) => v > 0).length;
  if (sidesCount !== 1 || anglesCount !== 2) {
    return { error: "Für WSW: genau 2 Winkel und 1 Seite eingeben." };
  }
  return { ok: true };
}
