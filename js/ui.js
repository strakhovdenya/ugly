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
    button: byId("calculateBtn"),
    anglesSection: byId("anglesSection")
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

  const countSides = () => [el.a, el.b, el.c].filter((f) => f.value.trim() !== "").length;
  const countAngles = () => [el.alpha, el.beta, el.gamma].filter((f) => f.value.trim() !== "").length;

  const showError = (msg) => {
    el.result.textContent = msg;
    el.wrap.style.display = "none";
  };

  const setSchemaHint = () => {
    let hint = document.getElementById("schemaHint");
    if (!hint) {
      hint = document.createElement("div");
      hint.id = "schemaHint";
      hint.className = "schema-hint";
      el.schema.parentElement.appendChild(hint);
    }

    if (el.schema.value === "SSS") {
      hint.textContent = "SSS: 3 Seiten eingeben. Winkel werden berechnet.";
    } else if (el.schema.value === "SWS") {
      hint.textContent = "SWS: 2 Seiten + 1 Winkel eingeben.";
    } else {
      hint.textContent = "WSW: 2 Winkel + 1 Seite eingeben.";
    }
  };

  const applySchemaVisibility = () => {
    if (el.schema.value === "SSS") {
      el.anglesSection.style.display = "none";
    } else {
      el.anglesSection.style.display = "";
    }
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
    const schema = el.schema.value;
    const sidesCount = countSides();
    const anglesCount = countAngles();

    if (schema === "SSS") {
      if (sidesCount !== 3) {
        showError("Für SSS: genau 3 Seiten eingeben.");
        return;
      }
    } else {
      const filled = countFilled();
      if (filled !== 3) {
        if (schema === "SWS") {
          showError("Für SWS: genau 2 Seiten und 1 Winkel eingeben.");
        } else {
          showError("Für WSW: genau 2 Winkel und 1 Seite eingeben.");
        }
        return;
      }
    }

    const res = calculateTriangle(readValues());
    if (res.error) {
      showError(res.error);
      return;
    }
    showResult(res);
  };

  el.button.addEventListener("click", handle);
  el.schema.addEventListener("change", () => {
    setSchemaHint();
    applySchemaVisibility();
    if (el.schema.value === "SSS") {
      el.alpha.value = "";
      el.beta.value = "";
      el.gamma.value = "";
    }
  });

  // Beispielwerte
  el.schema.value = "WSW";
  el.alpha.value = 40;
  el.beta.value = 70;
  el.c.value = 4.8;

  setSchemaHint();
  applySchemaVisibility();
}
