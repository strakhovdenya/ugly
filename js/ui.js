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

const angleKeys = ["alpha", "beta", "gamma"];
const sideKeys = ["a", "b", "c"];

const wswAnglePairs = [
  { angles: ["alpha", "beta"], side: "c", thirdAngle: "gamma" },
  { angles: ["beta", "gamma"], side: "a", thirdAngle: "alpha" },
  { angles: ["alpha", "gamma"], side: "b", thirdAngle: "beta" },
];

const wswSideToAngles = {
  a: { activeAngles: ["beta", "gamma"], disabledAngle: "alpha" },
  b: { activeAngles: ["alpha", "gamma"], disabledAngle: "beta" },
  c: { activeAngles: ["alpha", "beta"], disabledAngle: "gamma" },
};

const parseNumber = (raw) => {
  const text = raw.trim();
  if (!text) return { empty: true, valid: false, value: null };
  const normalized = text.replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value)) return { empty: false, valid: false, value: null };
  return { empty: false, valid: true, value };
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

  const wswUi = {
    hintEl: null,
    errorEl: null,
    lastChanged: null,
    canCalculate: false,
  };

  const getFieldValue = (field) => parseNumber(field.value);

  const readValues = () => ({
    schema: el.schema.value,
    alpha: getFieldValue(el.alpha).value || 0,
    beta: getFieldValue(el.beta).value || 0,
    gamma: getFieldValue(el.gamma).value || 0,
    a: getFieldValue(el.a).value || 0,
    b: getFieldValue(el.b).value || 0,
    c: getFieldValue(el.c).value || 0
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
      hint.textContent = "WSW: 2 Winkel + 1 Seite eingeben (Seite zwischen den Winkeln).";
    }
  };

  const ensureWswUi = () => {
    if (!wswUi.hintEl) {
      wswUi.hintEl = document.createElement("div");
      wswUi.hintEl.className = "wsw-hint";
      el.schema.parentElement.appendChild(wswUi.hintEl);
    }
    if (!wswUi.errorEl) {
      wswUi.errorEl = document.createElement("div");
      wswUi.errorEl.className = "wsw-error";
      el.schema.parentElement.appendChild(wswUi.errorEl);
    }
  };

  const setWswHint = (text) => {
    ensureWswUi();
    wswUi.hintEl.textContent = text || "";
    wswUi.hintEl.style.display = text ? "block" : "none";
  };

  const setWswError = (text) => {
    ensureWswUi();
    wswUi.errorEl.textContent = text || "";
    wswUi.errorEl.style.display = text ? "block" : "none";
  };

  const setDisabled = (field, disabled) => {
    field.disabled = disabled;
  };


  const clearFieldError = (field) => {
    field.classList.remove("field-error");
  };

  const setFieldError = (field) => {
    field.classList.add("field-error");
  };

  const resetFieldErrors = () => {
    [el.alpha, el.beta, el.gamma, el.a, el.b, el.c].forEach(clearFieldError);
  };

  const resetWswUi = () => {
    setWswHint("");
    setWswError("");
    resetFieldErrors();
    [el.alpha, el.beta, el.gamma, el.a, el.b, el.c].forEach((field) => {
      setDisabled(field, false);
      field.dataset.auto = "0";
    });
    el.button.disabled = false;
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

  const getAnglePairFromValid = (validAngles) => {
    const candidates = wswAnglePairs.filter((pair) => pair.angles.every((k) => validAngles.includes(k)));
    if (candidates.length === 1) return candidates[0];
    if (candidates.length > 1) {
      const byLast = candidates.find((pair) => pair.angles.includes(wswUi.lastChanged));
      return byLast || candidates[0];
    }
    return null;
  };

  const updateWswState = () => {
    if (el.schema.value !== "WSW") return;

    resetFieldErrors();
    setWswError("");

    const angleMeta = {
      alpha: { field: el.alpha, ...getFieldValue(el.alpha) },
      beta: { field: el.beta, ...getFieldValue(el.beta) },
      gamma: { field: el.gamma, ...getFieldValue(el.gamma) },
    };
    const sideMeta = {
      a: { field: el.a, ...getFieldValue(el.a) },
      b: { field: el.b, ...getFieldValue(el.b) },
      c: { field: el.c, ...getFieldValue(el.c) },
    };

    const validAngleKeys = angleKeys.filter((k) => angleMeta[k].valid && angleMeta[k].value > 0 && angleMeta[k].value < 180);
    const validSideKeys = sideKeys.filter((k) => sideMeta[k].valid && sideMeta[k].value > 0);

    let mode = "none";
    let activeAngles = [];
    let disabledAngle = null;
    let activeSide = null;

    if (validSideKeys.length === 1) {
      mode = "side";
      activeSide = validSideKeys[0];
      activeAngles = wswSideToAngles[activeSide].activeAngles;
      disabledAngle = wswSideToAngles[activeSide].disabledAngle;
    } else {
      const pair = getAnglePairFromValid(validAngleKeys);
      if (pair) {
        mode = "angles";
        activeAngles = pair.angles;
        disabledAngle = pair.thirdAngle;
        activeSide = pair.side;
      }
    }

    if (mode === "none") {
      setWswHint("WSW: zwei Winkel oder eine Seite wählen.");
      angleKeys.forEach((k) => setDisabled(angleMeta[k].field, false));
      sideKeys.forEach((k) => setDisabled(sideMeta[k].field, false));
      angleKeys.forEach((k) => {
        if (angleMeta[k].field.disabled) {
          angleMeta[k].field.value = "";
          angleMeta[k].field.dataset.auto = "0";
        }
      });
    } else {
      setWswHint(
        mode === "side"
          ? `Auswahl: Seite ${activeSide} → Winkel ${activeAngles[0]} und ${activeAngles[1]} eingeben`
          : `Auswahl: ${activeAngles[0]} + ${activeAngles[1]} → Seite ${activeSide} eingeben`
      );

      angleKeys.forEach((k) => {
        const field = angleMeta[k].field;
        const shouldEnable = activeAngles.includes(k);
        setDisabled(field, !shouldEnable);
        if (!shouldEnable) {
          field.value = "";
          field.dataset.auto = "0";
        }
      });

      sideKeys.forEach((k) => {
        const field = sideMeta[k].field;
        const shouldEnable = k === activeSide;
        setDisabled(field, !shouldEnable);
        if (!shouldEnable) {
          field.value = "";
        }
      });

      if (disabledAngle) {
        const thirdField = angleMeta[disabledAngle].field;
        setDisabled(thirdField, true);
        thirdField.value = "";
        thirdField.dataset.auto = "0";
      }
    }

    let hasError = false;
    const messages = [];

    const checkAngle = (key) => {
      const meta = angleMeta[key];
      if (meta.field.disabled) return { valid: false, empty: true, value: null };
      if (meta.empty) return { valid: false, empty: true, value: null };
      if (!meta.valid) {
        setFieldError(meta.field);
        messages.push("Bitte eine korrekte Zahl für den Winkel eingeben.");
        hasError = true;
        return { valid: false, empty: false, value: null };
      }
      if (meta.value <= 0 || meta.value >= 180) {
        setFieldError(meta.field);
        messages.push("Winkel muss größer als 0 und kleiner als 180° sein.");
        hasError = true;
        return { valid: false, empty: false, value: null };
      }
      return { valid: true, empty: false, value: meta.value };
    };

    const checkSide = (key) => {
      const meta = sideMeta[key];
      if (meta.field.disabled) return { valid: false, empty: true, value: null };
      if (meta.empty) return { valid: false, empty: true, value: null };
      if (!meta.valid) {
        setFieldError(meta.field);
        messages.push("Bitte eine korrekte Zahl für die Seite eingeben.");
        hasError = true;
        return { valid: false, empty: false, value: null };
      }
      if (meta.value <= 0) {
        setFieldError(meta.field);
        messages.push("Seite muss größer als 0 sein.");
        hasError = true;
        return { valid: false, empty: false, value: null };
      }
      return { valid: true, empty: false, value: meta.value };
    };

    let angleValues = [];
    if (mode !== "none") {
      angleValues = activeAngles.map(checkAngle);
      const sideValue = activeSide ? checkSide(activeSide) : { valid: false, empty: true };

      if (angleValues.every((v) => v.valid)) {
        const sum = angleValues[0].value + angleValues[1].value;
        if (sum >= 180) {
          hasError = true;
          messages.push("Die Summe der beiden Winkel muss kleiner als 180° sein.");
        }
      }

      if (mode === "angles" && sideValue.empty) {
        messages.push("Bitte die Seite zwischen den gewählten Winkeln eingeben.");
      }

      if (mode === "side" && angleValues.some((v) => v.empty)) {
        messages.push("Bitte die zwei Winkel an der gewählten Seite eingeben.");
      }

      const canCalculate =
        !hasError &&
        angleValues.length === 2 &&
        angleValues.every((v) => v.valid) &&
        sideValue.valid &&
        angleValues[0].value + angleValues[1].value < 180;

      wswUi.canCalculate = canCalculate;
    } else {
      wswUi.canCalculate = false;
    }

    if (messages.length > 0) {
      setWswError(messages[0]);
    } else {
      setWswError("");
    }

    el.button.disabled = !wswUi.canCalculate;
  };

  const handle = () => {
    const values = readValues();
    const schema = values.schema;

    if (schema === "WSW") {
      updateWswState();
      if (!wswUi.canCalculate) {
        showError("Bitte Eingaben prüfen: Für WSW sind 2 Winkel und 1 Seite zwischen ihnen erforderlich.");
        return;
      }
    }

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

  const onInputChange = (key) => {
    wswUi.lastChanged = key;
    if (el.schema.value === "WSW") {
      updateWswState();
    }
  };

  el.alpha.addEventListener("input", () => onInputChange("alpha"));
  el.beta.addEventListener("input", () => onInputChange("beta"));
  el.gamma.addEventListener("input", () => onInputChange("gamma"));
  el.a.addEventListener("input", () => onInputChange("a"));
  el.b.addEventListener("input", () => onInputChange("b"));
  el.c.addEventListener("input", () => onInputChange("c"));

  el.button.addEventListener("click", handle);
  el.schema.addEventListener("change", () => {
    setSchemaHint();
    applySchemaVisibility();
    if (el.schema.value === "SSS") {
      el.alpha.value = "";
      el.beta.value = "";
      el.gamma.value = "";
    }

    if (el.schema.value === "WSW") {
      updateWswState();
    } else {
      resetWswUi();
    }
  });

  // Beispielwerte
  el.schema.value = "WSW";
  el.alpha.value = 40;
  el.beta.value = 70;
  el.c.value = 4.8;

  setSchemaHint();
  applySchemaVisibility();
  updateWswState();
}
