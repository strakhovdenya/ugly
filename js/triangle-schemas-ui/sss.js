export function validateUiSSS(values) {
  const { a, b, c } = values;
  const sidesCount = [a, b, c].filter((v) => v > 0).length;
  if (sidesCount !== 3) {
    return { error: "Für SSS: genau 3 Seiten eingeben." };
  }
  return { ok: true };
}
