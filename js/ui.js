import { calculateTriangle } from "./triangle-calc.js";
import { drawTriangle } from "./triangle-draw.js";

const byId = (id) => document.getElementById(id);

export function init() {
  const el = {
    schema: byId("schema"),
    alpha: byId("alpha"),
    beta: byId("beta"),
    gamma: byId("gamma"),
    a: byId("a"),
    b: byId("b"),
    c: byId("c"),
    result: byId("result"),
    wrap: byId("triangleWrap"),
    canvas: byId("triangleCanvas"),
    button: byId("calculateBtn")
  };

  const readValues = () => ({
    schema: el.schema.value,
    alpha: +el.alpha.value,
    beta: +el.beta.value,
    gamma: +el.gamma.value,
    a: +el.a.value,
    b: +el.b.value,
    c: +el.c.value
  });

  const countFilled = () => {
    const fields = [el.alpha, el.beta, el.gamma, el.a, el.b, el.c];
    return fields.filter((f) => f.value.trim() !== "").length;
  };

  const showError = (msg) => {
    el.result.textContent = msg;
    el.wrap.style.display = "none";
  };

  const showResult = (res) => {
    el.result.textContent =
      `Dreieck: ${res.typeBySides}, ${res.typeByAngles}` +
      `\nWinkel: α=${res.alpha.toFixed(1)}°, β=${res.beta.toFixed(1)}°, γ=${res.gamma.toFixed(1)}°` +
      `\nSeiten: a=${res.a.toFixed(2)}, b=${res.b.toFixed(2)}, c=${res.c.toFixed(2)}`;

    drawTriangle(el.canvas, res.a, res.b, res.c);
    el.wrap.style.display = "block";
  };

  const handle = () => {
    const filled = countFilled();
    if (filled !== 3) {
      if (el.schema.value === "SWS") {
        showError("Für SWS: genau 2 Seiten und 1 Winkel eingeben.");
      } else {
        showError("Für WSW: genau 2 Winkel und 1 Seite eingeben.");
      }
      return;
    }

    const res = calculateTriangle(readValues());
    if (res.error) {
      showError(res.error);
      return;
    }
    showResult(res);
  };

  el.button.addEventListener("click", handle);

  // Beispielwerte
  el.schema.value = "WSW";
  el.alpha.value = 40;
  el.beta.value = 70;
  el.c.value = 4.8;

}
