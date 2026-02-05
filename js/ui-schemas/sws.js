const swsAngleToSides = {
  alpha: { sides: ["b", "c"], disabledSide: "a" },
  beta: { sides: ["a", "c"], disabledSide: "b" },
  gamma: { sides: ["a", "b"], disabledSide: "c" },
};

const swsSidePairs = [
  { sides: ["a", "b"], angle: "gamma" },
  { sides: ["b", "c"], angle: "alpha" },
  { sides: ["a", "c"], angle: "beta" },
];

export function createSwsController(options) {
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

  const swsUi = {
    hintEl: null,
    errorEl: null,
    lastChanged: null,
    canCalculate: false,
  };

  const ensureSwsUi = () => {
    if (!swsUi.hintEl) {
      swsUi.hintEl = document.createElement("div");
      swsUi.hintEl.className = "wsw-hint";
      el.schema.parentElement.appendChild(swsUi.hintEl);
    }
    if (!swsUi.errorEl) {
      swsUi.errorEl = document.createElement("div");
      swsUi.errorEl.className = "wsw-error";
      el.schema.parentElement.appendChild(swsUi.errorEl);
    }
  };

  const setSwsHint = (text) => {
    ensureSwsUi();
    swsUi.hintEl.textContent = text || "";
    swsUi.hintEl.style.display = text ? "block" : "none";
  };

  const setSwsError = (text) => {
    ensureSwsUi();
    swsUi.errorEl.textContent = text || "";
    swsUi.errorEl.style.display = text ? "block" : "none";
  };

  const deriveStateSWS = (angleMeta, sideMeta) => {
    const validAngleKeys = angleKeys.filter((k) => angleMeta[k].valid && angleMeta[k].value > 0 && angleMeta[k].value < 180);
    const validSideKeys = sideKeys.filter((k) => sideMeta[k].valid && sideMeta[k].value > 0);

    let selectedCombo = null;
    let mode = "none";
    let activeAngles = [];
    let activeSides = [];
    let disabledAngles = [];
    let disabledSides = [];
    let errors = { fields: {}, general: "" };
    let statusText = "";

    if (validSideKeys.length === 2) {
      mode = "sides";
      const pair = swsSidePairs.find((p) => p.sides.every((s) => validSideKeys.includes(s)));
      if (pair) {
        selectedCombo =
          pair.sides[0] === "a" && pair.sides[1] === "b"
            ? "ab_gamma"
            : pair.sides[0] === "b" && pair.sides[1] === "c"
            ? "bc_alpha"
            : "ac_beta";
        activeSides = pair.sides;
        activeAngles = [pair.angle];
        disabledSides = sideKeys.filter((s) => !pair.sides.includes(s));
        disabledAngles = angleKeys.filter((a) => a !== pair.angle);
        statusText =
          pair.angle === "gamma"
            ? "Auswahl: a und b → bitte Winkel γ eingeben."
            : pair.angle === "alpha"
            ? "Auswahl: b und c → bitte Winkel α eingeben."
            : "Auswahl: a und c → bitte Winkel β eingeben.";
      } else {
        errors.general = "Bitte geben Sie genau zwei Seiten und einen Winkel ein (SWS).";
      }
    } else if (validAngleKeys.length === 1) {
      mode = "angle";
      const angleKey = validAngleKeys[0];
      activeAngles = [angleKey];
      activeSides = swsAngleToSides[angleKey].sides;
      disabledAngles = angleKeys.filter((k) => k !== angleKey);
      disabledSides = [swsAngleToSides[angleKey].disabledSide];
      statusText =
        angleKey === "alpha"
          ? "Auswahl: Winkel α → bitte Seiten b und c eingeben."
          : angleKey === "beta"
          ? "Auswahl: Winkel β → bitte Seiten a und c eingeben."
          : "Auswahl: Winkel γ → bitte Seiten a und b eingeben.";
    }

    return {
      mode,
      selectedCombo,
      activeAngles,
      activeSides,
      disabledAngles,
      disabledSides,
      errors,
      statusText,
    };
  };

  const update = () => {
    if (el.schema.value !== "SWS") return;

    resetFieldErrors();
    setSwsError("");

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

    const state = deriveStateSWS(angleMeta, sideMeta);

    if (state.mode === "none") {
      setSwsHint("Bitte geben Sie genau zwei Seiten und einen Winkel ein (SWS).");
      angleKeys.forEach((k) => setDisabled(angleMeta[k].field, false));
      sideKeys.forEach((k) => setDisabled(sideMeta[k].field, false));
    } else {
      setSwsHint(state.statusText);
      angleKeys.forEach((k) => {
        const field = angleMeta[k].field;
        const shouldEnable = state.activeAngles.includes(k);
        setDisabled(field, !shouldEnable);
        if (!shouldEnable) {
          field.value = "";
        }
      });
      sideKeys.forEach((k) => {
        const field = sideMeta[k].field;
        const shouldEnable = state.activeSides.includes(k);
        setDisabled(field, !shouldEnable);
        if (!shouldEnable) {
          field.value = "";
        }
      });
    }

    const messages = [];
    let hasError = false;

    const checkAngle = (key) => {
      const meta = angleMeta[key];
      if (meta.field.disabled) return { valid: false, empty: true, value: null };
      if (meta.empty) return { valid: false, empty: true, value: null };
      if (!meta.valid) {
        setFieldError(meta.field);
        messages.push("Bitte geben Sie einen Winkel zwischen 0° und 180° ein.");
        hasError = true;
        return { valid: false, empty: false, value: null };
      }
      if (meta.value <= 0 || meta.value >= 180) {
        setFieldError(meta.field);
        messages.push("Bitte geben Sie einen Winkel zwischen 0° und 180° ein.");
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
        messages.push("Bitte geben Sie eine Seitenlänge größer als 0 ein.");
        hasError = true;
        return { valid: false, empty: false, value: null };
      }
      if (meta.value <= 0) {
        setFieldError(meta.field);
        messages.push("Bitte geben Sie eine Seitenlänge größer als 0 ein.");
        hasError = true;
        return { valid: false, empty: false, value: null };
      }
      return { valid: true, empty: false, value: meta.value };
    };

    const activeAngles = state.activeAngles;
    const activeSides = state.activeSides;

    const angleValues = activeAngles.map(checkAngle);
    const sideValues = activeSides.map(checkSide);

    if (state.mode === "sides") {
      const expectedAngle = state.activeAngles[0];
      const otherAngles = angleKeys.filter((k) => k !== expectedAngle);
      const hasOtherAngleValue = otherAngles.some((k) => !angleMeta[k].empty);
      if (hasOtherAngleValue) {
        otherAngles.forEach((k) => {
          angleMeta[k].field.value = "";
        });
        messages.push("Der Winkel passt nicht zu den ausgewählten Seiten. Für SWS muss der eingeschlossene Winkel eingegeben werden.");
        hasError = true;
      }
    }

    if (state.mode === "angle") {
      const expectedSides = state.activeSides;
      const otherSides = sideKeys.filter((k) => !expectedSides.includes(k));
      const hasOtherSideValue = otherSides.some((k) => !sideMeta[k].empty);
      if (hasOtherSideValue) {
        otherSides.forEach((k) => {
          sideMeta[k].field.value = "";
        });
      }
    }

    const canCalculate =
      !hasError &&
      state.activeAngles.length === 1 &&
      state.activeSides.length === 2 &&
      angleValues.length === 1 &&
      sideValues.length === 2 &&
      angleValues[0]?.valid &&
      sideValues.every((v) => v.valid);

    swsUi.canCalculate = canCalculate;

    if (messages.length > 0) {
      setSwsError(messages[0]);
    } else {
      setSwsError("");
    }

    el.button.disabled = !swsUi.canCalculate;
  };

  const reset = () => {
    setSwsHint("");
    setSwsError("");
    resetFieldErrors();
    [el.alpha, el.beta, el.gamma, el.a, el.b, el.c].forEach((field) => {
      setDisabled(field, false);
    });
    el.button.disabled = false;
  };

  const onInputChange = (key) => {
    swsUi.lastChanged = key;
    if (el.schema.value === "SWS") {
      update();
    }
  };

  const canCalculate = () => swsUi.canCalculate;

  return {
    update,
    reset,
    onInputChange,
    canCalculate,
  };
}
