import { calculateTriangle } from "./triangle-calc.js";
import { drawTriangle } from "./triangle-draw.js";
import { validateUiSSS } from "./triangle-schemas-ui/sss.js";
import { validateUiSSW } from "./triangle-schemas-ui/ssw.js";
import { validateUiSWS } from "./triangle-schemas-ui/sws.js";
import { validateUiWSW } from "./triangle-schemas-ui/wsw.js";
import { createWswController } from "./ui-schemas/wsw.js";
import { createSwsController } from "./ui-schemas/sws.js";
import { createSswController } from "./ui-schemas/ssw.js";
import { createSssController } from "./ui-schemas/sss.js";

const byId = (id) => document.getElementById(id);

const schemaUiValidators = {
  SSS: validateUiSSS,
  SSW: validateUiSSW,
  SWS: validateUiSWS,
  WSW: validateUiWSW,
};

const angleKeys = ["alpha", "beta", "gamma"];
const sideKeys = ["a", "b", "c"];

const parseNumber = (raw) => {
  const text = raw.trim();
  if (!text) return { empty: true, valid: false, value: null };
  const normalized = text.replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value)) return { empty: false, valid: false, value: null };
  return { empty: false, valid: true, value };
};

const initCustomSelect = (selectEl, triggerEl, menuEl) => {
  if (!selectEl || !triggerEl || !menuEl) return null;
  const wrapper = triggerEl.closest(".select-wrap");
  const options = Array.from(selectEl.options);

  const updateTrigger = () => {
    const current = selectEl.selectedOptions[0];
    triggerEl.textContent = current ? current.textContent : "—";
  };

  const renderOptions = () => {
    menuEl.innerHTML = "";
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "select-option";
      btn.setAttribute("role", "option");
      btn.dataset.value = opt.value;
      btn.textContent = opt.textContent;
      if (opt.value === selectEl.value) {
        btn.setAttribute("aria-selected", "true");
      }
      menuEl.appendChild(btn);
    });
  };

  const open = () => {
    wrapper.classList.add("open");
    triggerEl.setAttribute("aria-expanded", "true");
  };

  const close = () => {
    wrapper.classList.remove("open");
    triggerEl.setAttribute("aria-expanded", "false");
  };

  const toggle = () => {
    if (wrapper.classList.contains("open")) {
      close();
    } else {
      open();
    }
  };

  triggerEl.addEventListener("click", (event) => {
    event.preventDefault();
    toggle();
  });

  menuEl.addEventListener("click", (event) => {
    const option = event.target.closest(".select-option");
    if (!option) return;
    const value = option.dataset.value;
    if (!value) return;
    selectEl.value = value;
    selectEl.dispatchEvent(new Event("change", { bubbles: true }));
    updateTrigger();
    renderOptions();
    close();
  });

  document.addEventListener("click", (event) => {
    if (!wrapper.contains(event.target)) {
      close();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      close();
    }
  });

  selectEl.addEventListener("change", () => {
    updateTrigger();
    renderOptions();
  });

  renderOptions();
  updateTrigger();
  triggerEl.setAttribute("aria-expanded", "false");
  return { updateTrigger, renderOptions, close };
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

    el.wrap.style.display = "block";
    requestAnimationFrame(() => {
      drawTriangle(el.canvas, res.a, res.b, res.c);
    });
  };

  const schemaSelectUi = initCustomSelect(el.schema, byId("schemaTrigger"), byId("schemaMenu"));

  const wswController = createWswController({
    el,
    angleKeys,
    sideKeys,
    getFieldValue,
    setDisabled,
    setFieldError,
    clearFieldError,
    resetFieldErrors,
  });

  const swsController = createSwsController({
    el,
    angleKeys,
    sideKeys,
    getFieldValue,
    setDisabled,
    setFieldError,
    clearFieldError,
    resetFieldErrors,
  });

  const sswController = createSswController({
    el,
    angleKeys,
    sideKeys,
    getFieldValue,
    setDisabled,
    setFieldError,
    clearFieldError,
    resetFieldErrors,
  });

  const sssController = createSssController({
    el,
    angleKeys,
    sideKeys,
    getFieldValue,
    setDisabled,
    setFieldError,
    clearFieldError,
    resetFieldErrors,
  });

  const handle = () => {
    const values = readValues();
    const schema = values.schema;

    if (schema === "WSW") {
      wswController.update();
      if (!wswController.canCalculate()) {
        showError("Bitte Eingaben prüfen: Für WSW sind 2 Winkel und 1 Seite zwischen ihnen erforderlich.");
        return;
      }
    }

    if (schema === "SWS") {
      swsController.update();
      if (!swsController.canCalculate()) {
        showError("Bitte geben Sie genau zwei Seiten und einen Winkel ein (SWS).");
        return;
      }
    }

    if (schema === "SSW") {
      sswController.update();
      if (!sswController.canCalculate()) {
        showError("Bitte geben Sie genau zwei Seiten und einen Winkel ein (SSW).");
        return;
      }
    }

    if (schema === "SSS") {
      sssController.update();
      if (!sssController.canCalculate()) {
        showError("Bitte geben Sie drei Seitenlängen ein (SSS).");
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
    wswController.onInputChange(key);
    swsController.onInputChange(key);
    sswController.onInputChange(key);
    sssController.onInputChange(key);
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
    el.alpha.value = "";
    el.beta.value = "";
    el.gamma.value = "";
    el.a.value = "";
    el.b.value = "";
    el.c.value = "";
    el.result.textContent = "";
    el.wrap.style.display = "none";
    if (schemaSelectUi) {
      schemaSelectUi.updateTrigger();
    }

    wswController.reset();
    swsController.reset();
    sswController.reset();
    sssController.reset();

    if (el.schema.value === "WSW") {
      wswController.update();
    }
    if (el.schema.value === "SWS") {
      swsController.update();
    }
    if (el.schema.value === "SSW") {
      sswController.update();
    }
    if (el.schema.value === "SSS") {
      sssController.update();
    }
  });

  // Beispielwerte
  el.schema.value = "WSW";
  el.alpha.value = 40;
  el.beta.value = 70;
  el.c.value = 4.8;

  setSchemaHint();
  applySchemaVisibility();
  if (schemaSelectUi) {
    schemaSelectUi.updateTrigger();
  }
  wswController.update();
  swsController.update();
  sswController.update();
  sssController.update();
}
