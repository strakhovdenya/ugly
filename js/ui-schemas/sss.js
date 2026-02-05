export function createSssController(options) {
  const {
    el,
    angleKeys,
    sideKeys,
    getFieldValue,
    setDisabled,
    setFieldError,
    clearFieldError,
    resetFieldErrors,
  } = options;

  const sssUi = {
    hintEl: null,
    errorEl: null,
    lastChanged: null,
    canCalculate: false,
  };

  const ensureSssUi = () => {
    if (!sssUi.hintEl) {
      sssUi.hintEl = document.createElement("div");
      sssUi.hintEl.className = "wsw-hint";
      el.schema.parentElement.appendChild(sssUi.hintEl);
    }
    if (!sssUi.errorEl) {
      sssUi.errorEl = document.createElement("div");
      sssUi.errorEl.className = "wsw-error";
      el.schema.parentElement.appendChild(sssUi.errorEl);
    }
  };

  const setSssHint = (text) => {
    ensureSssUi();
    sssUi.hintEl.textContent = text || "";
    sssUi.hintEl.style.display = text ? "block" : "none";
  };

  const setSssError = (text) => {
    ensureSssUi();
    sssUi.errorEl.textContent = text || "";
    sssUi.errorEl.style.display = text ? "block" : "none";
  };

  const deriveStateSSS = (angleMeta, sideMeta) => {
    const disabledFields = angleKeys.slice();
    const errors = { fields: {}, general: "" };
    const statusText = "Bitte geben Sie drei Seitenlängen ein (SSS).";

    const sideValues = sideKeys.map((k) => sideMeta[k]);
    const validSideValues = sideKeys.filter((k) => sideMeta[k].valid && sideMeta[k].value > 0);
    const allSidesFilled = sideKeys.every((k) => !sideMeta[k].empty);

    let canCalculate = false;

    if (allSidesFilled && validSideValues.length === 3) {
      const a = sideMeta.a.value;
      const b = sideMeta.b.value;
      const c = sideMeta.c.value;
      if (a + b > c && a + c > b && b + c > a) {
        canCalculate = true;
      } else {
        errors.general = "Die Seitenlängen erfüllen nicht die Dreiecksungleichung (Summe zweier Seiten muss größer als die dritte sein).";
      }
    }

    return {
      disabledFields,
      errors,
      statusText,
      canCalculate,
    };
  };

  const update = () => {
    if (el.schema.value !== "SSS") return;

    resetFieldErrors();
    setSssError("");

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

    const state = deriveStateSSS(angleMeta, sideMeta);
    setSssHint(state.statusText);

    angleKeys.forEach((k) => {
      const field = angleMeta[k].field;
      setDisabled(field, true);
      field.value = "";
    });

    sideKeys.forEach((k) => {
      const field = sideMeta[k].field;
      setDisabled(field, false);
    });

    const messages = [];
    let hasError = false;

    const checkSide = (key) => {
      const meta = sideMeta[key];
      if (meta.empty) return { valid: false, empty: true, value: null };
      if (!meta.valid || meta.value <= 0) {
        setFieldError(meta.field);
        messages.push("Bitte geben Sie eine Seitenlänge größer als 0 ein.");
        hasError = true;
        return { valid: false, empty: false, value: null };
      }
      return { valid: true, empty: false, value: meta.value };
    };

    const sideValues = sideKeys.map(checkSide);
    const validCount = sideValues.filter((v) => v.valid).length;

    if (validCount === 3) {
      const a = sideMeta.a.value;
      const b = sideMeta.b.value;
      const c = sideMeta.c.value;
      if (!(a + b > c && a + c > b && b + c > a)) {
        messages.push("Die Seitenlängen erfüllen nicht die Dreiecksungleichung (Summe zweier Seiten muss größer als die dritte sein).");
        hasError = true;
      }
    }

    sssUi.canCalculate = state.canCalculate && !hasError;

    if (messages.length > 0) {
      setSssError(messages[0]);
    } else if (state.errors.general) {
      setSssError(state.errors.general);
    } else {
      setSssError("");
    }

    el.button.disabled = !sssUi.canCalculate;
  };

  const reset = () => {
    setSssHint("");
    setSssError("");
    resetFieldErrors();
    [el.alpha, el.beta, el.gamma].forEach((field) => {
      setDisabled(field, false);
    });
    [el.a, el.b, el.c].forEach((field) => {
      setDisabled(field, false);
    });
    el.button.disabled = false;
  };

  const onInputChange = (key) => {
    sssUi.lastChanged = key;
    if (el.schema.value === "SSS") {
      update();
    }
  };

  const canCalculate = () => sssUi.canCalculate;

  return {
    update,
    reset,
    onInputChange,
    canCalculate,
  };
}
