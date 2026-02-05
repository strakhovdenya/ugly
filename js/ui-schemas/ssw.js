const angleToOppositeSide = {
  alpha: "a",
  beta: "b",
  gamma: "c",
};

const sidesToAllowedAngles = [
  { sides: ["a", "b"], allowed: ["alpha", "beta"], disallowed: "gamma", text: "Auswahl: a und b → bitte Winkel α oder β eingeben (nicht γ)." },
  { sides: ["a", "c"], allowed: ["alpha", "gamma"], disallowed: "beta", text: "Auswahl: a und c → bitte Winkel α oder γ eingeben (nicht β)." },
  { sides: ["b", "c"], allowed: ["beta", "gamma"], disallowed: "alpha", text: "Auswahl: b und c → bitte Winkel β oder γ eingeben (nicht α)." },
];

const angleToStatus = {
  alpha: "Auswahl: Winkel α → bitte Seite a und genau eine weitere Seite (b oder c) eingeben.",
  beta: "Auswahl: Winkel β → bitte Seite b und genau eine weitere Seite (a oder c) eingeben.",
  gamma: "Auswahl: Winkel γ → bitte Seite c und genau eine weitere Seite (a oder b) eingeben.",
};

export function createSswController(options) {
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

  const sswUi = {
    hintEl: null,
    errorEl: null,
    lastChanged: null,
    canCalculate: false,
  };

  const ensureSswUi = () => {
    if (!sswUi.hintEl) {
      sswUi.hintEl = document.createElement("div");
      sswUi.hintEl.className = "wsw-hint";
      el.schema.parentElement.appendChild(sswUi.hintEl);
    }
    if (!sswUi.errorEl) {
      sswUi.errorEl = document.createElement("div");
      sswUi.errorEl.className = "wsw-error";
      el.schema.parentElement.appendChild(sswUi.errorEl);
    }
  };

  const setSswHint = (text) => {
    ensureSswUi();
    sswUi.hintEl.textContent = text || "";
    sswUi.hintEl.style.display = text ? "block" : "none";
  };

  const setSswError = (text) => {
    ensureSswUi();
    sswUi.errorEl.textContent = text || "";
    sswUi.errorEl.style.display = text ? "block" : "none";
  };

  const deriveStateSSW = (angleMeta, sideMeta) => {
    const validAngleKeys = angleKeys.filter((k) => angleMeta[k].valid && angleMeta[k].value > 0 && angleMeta[k].value < 180);
    const validSideKeys = sideKeys.filter((k) => sideMeta[k].valid && sideMeta[k].value > 0);

    let mode = "none";
    let activeAngles = [];
    let activeSides = [];
    let disabledAngles = [];
    let disabledSides = [];
    let allowedAngleSet = [];
    let statusText = "";
    let errors = { fields: {}, general: "" };

    if (validSideKeys.length === 2) {
      mode = "sides";
      const pair = sidesToAllowedAngles.find((p) => p.sides.every((s) => validSideKeys.includes(s)));
      if (pair) {
        activeSides = pair.sides;
        disabledSides = sideKeys.filter((s) => !pair.sides.includes(s));
        activeAngles = pair.allowed.slice();
        allowedAngleSet = pair.allowed.slice();
        disabledAngles = angleKeys.filter((a) => !pair.allowed.includes(a));
        statusText = pair.text;
      }
    } else if (validAngleKeys.length >= 1) {
      mode = "angle";
      const chosenAngle = validAngleKeys.includes(sswUi.lastChanged) ? sswUi.lastChanged : validAngleKeys[0];
      activeAngles = [chosenAngle];
      disabledAngles = angleKeys.filter((k) => k !== chosenAngle);
      const oppositeSide = angleToOppositeSide[chosenAngle];
      const optionalSides = sideKeys.filter((s) => s !== oppositeSide);
      activeSides = [oppositeSide, ...optionalSides];
      disabledSides = [];
      statusText = angleToStatus[chosenAngle];
      allowedAngleSet = [chosenAngle];
    }

    return {
      mode,
      activeAngles,
      activeSides,
      disabledAngles,
      disabledSides,
      allowedAngleSet,
      statusText,
      errors,
    };
  };

  const update = () => {
    if (el.schema.value !== "SSW") return;

    resetFieldErrors();
    setSswError("");

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

    const state = deriveStateSSW(angleMeta, sideMeta);

    if (state.mode === "none") {
      setSswHint("Bitte geben Sie genau zwei Seiten und einen Winkel ein (SSW).");
      angleKeys.forEach((k) => setDisabled(angleMeta[k].field, false));
      sideKeys.forEach((k) => setDisabled(sideMeta[k].field, false));
    } else {
      setSswHint(state.statusText);
      angleKeys.forEach((k) => {
        const field = angleMeta[k].field;
        const shouldEnable = state.activeAngles.includes(k) || (state.mode === "sides" && state.allowedAngleSet.includes(k));
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
      if (!meta.valid || meta.value <= 0 || meta.value >= 180) {
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
      if (!meta.valid || meta.value <= 0) {
        setFieldError(meta.field);
        messages.push("Bitte geben Sie eine Seitenlänge größer als 0 ein.");
        hasError = true;
        return { valid: false, empty: false, value: null };
      }
      return { valid: true, empty: false, value: meta.value };
    };

    const validSideKeys = sideKeys.filter((k) => sideMeta[k].valid && sideMeta[k].value > 0);
    const validAngleKeys = angleKeys.filter((k) => angleMeta[k].valid && angleMeta[k].value > 0 && angleMeta[k].value < 180);

    if (state.mode === "sides") {
      const disallowed = angleKeys.filter((k) => !state.allowedAngleSet.includes(k));
      const hasDisallowedValue = disallowed.some((k) => !angleMeta[k].empty);
      if (hasDisallowedValue) {
        disallowed.forEach((k) => {
          angleMeta[k].field.value = "";
        });
        messages.push("Der Winkel ist für die gewählten Seiten nicht zulässig (SSW).");
        hasError = true;
      }
    }

    if (state.mode === "angle") {
      const chosenAngle = state.activeAngles[0];
      const oppositeSide = angleToOppositeSide[chosenAngle];
      const hasOpposite = validSideKeys.includes(oppositeSide);
      const hasTwoSides = validSideKeys.length === 2;
      if (hasTwoSides && !hasOpposite) {
        messages.push("Diese Eingaben passen nicht zum Schema SSW (2 Seiten und 1 Winkel an einer Seite, nicht zwischen den Seiten).");
        hasError = true;
      }
    }

    if (state.mode === "angle") {
      const chosenAngle = state.activeAngles[0];
      const oppositeSide = angleToOppositeSide[chosenAngle];
      const optionalSides = sideKeys.filter((s) => s !== oppositeSide);
      const optionalWithValue = optionalSides.filter((s) => !sideMeta[s].empty);
      if (optionalWithValue.length >= 1) {
        const keep = optionalWithValue.includes(sswUi.lastChanged) ? sswUi.lastChanged : optionalWithValue[0];
        const toDisable = optionalSides.filter((s) => s !== keep);
        toDisable.forEach((s) => {
          setDisabled(sideMeta[s].field, true);
          sideMeta[s].field.value = "";
        });
      }
    }

    if (state.mode === "sides") {
      const allowedAngles = state.allowedAngleSet;
      const angleValues = allowedAngles.map(checkAngle);
      const validAngleCount = angleValues.filter((v) => v.valid).length;

      if (validAngleCount >= 1) {
        const keep = allowedAngles.includes(sswUi.lastChanged) ? sswUi.lastChanged : allowedAngles.find((k) => angleMeta[k].valid) || allowedAngles[0];
        allowedAngles.forEach((k) => {
          if (k !== keep) {
            angleMeta[k].field.value = "";
            setDisabled(angleMeta[k].field, true);
          }
        });
      }
    }

    const activeAngleKeys = angleKeys.filter((k) => !angleMeta[k].field.disabled);
    const activeSideKeys = sideKeys.filter((k) => !sideMeta[k].field.disabled);
    const angleValues = activeAngleKeys.map(checkAngle);
    const sideValues = activeSideKeys.map(checkSide);

    const validAnglesCount = angleValues.filter((v) => v.valid).length;
    const validSidesCount = sideValues.filter((v) => v.valid).length;

    if (validSidesCount === 2 && validAnglesCount === 1) {
      const chosenAngle = activeAngleKeys.find((k) => angleMeta[k].valid && angleMeta[k].value > 0 && angleMeta[k].value < 180);
      if (chosenAngle) {
        const oppositeSide = angleToOppositeSide[chosenAngle];
        const sideSet = sideKeys.filter((k) => sideMeta[k].valid && sideMeta[k].value > 0);
        if (!sideSet.includes(oppositeSide)) {
          messages.push("Diese Eingaben passen nicht zum Schema SSW (2 Seiten und 1 Winkel an einer Seite, nicht zwischen den Seiten).");
          hasError = true;
        }
      }
    }

    const canCalculate =
      !hasError &&
      validSidesCount === 2 &&
      validAnglesCount === 1;

    sswUi.canCalculate = canCalculate;

    if (messages.length > 0) {
      setSswError(messages[0]);
    } else {
      setSswError("");
    }

    el.button.disabled = !sswUi.canCalculate;
  };

  const reset = () => {
    setSswHint("");
    setSswError("");
    resetFieldErrors();
    [el.alpha, el.beta, el.gamma, el.a, el.b, el.c].forEach((field) => {
      setDisabled(field, false);
    });
    el.button.disabled = false;
  };

  const onInputChange = (key) => {
    sswUi.lastChanged = key;
    if (el.schema.value === "SSW") {
      update();
    }
  };

  const canCalculate = () => sswUi.canCalculate;

  return {
    update,
    reset,
    onInputChange,
    canCalculate,
  };
}
