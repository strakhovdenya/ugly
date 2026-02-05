import { calculateTriangle } from "./triangle-calc.js";
import { drawTriangle } from "./triangle-draw.js";
import { validateUiSSS } from "./triangle-schemas-ui/sss.js";
import { validateUiSSW } from "./triangle-schemas-ui/ssw.js";
import { validateUiSWS } from "./triangle-schemas-ui/sws.js";
import { validateUiWSW } from "./triangle-schemas-ui/wsw.js";

const byId = (id) => document.getElementById(id);

const schemaUiValidators = {
  SSS: validateUiSSS,
  SSW: validateUiSSW,
  SWS: validateUiSWS,
  WSW: validateUiWSW,
};

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
    } else if (el.schema.value === "SSW") {
      hint.textContent = "SsW: 2 Seiten und 1 Winkel eingeben (Winkel an einer Seite, nicht zwischen den Seiten).";
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
    const values = readValues();
    const schema = values.schema;

    const validator = schemaUiValidators[schema];
    if (!validator) {
      showError("Ungültiges Schema");
      return;
    }

    const validation = validator(values);
    if (!validation || validation.ok !== true) {
      showError(validation?.error || "Ungültige Eingaben");
      return;
    }

    const res = calculateTriangle(values);
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
