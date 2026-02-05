import { calculateSWS, validateSWS } from "./triangle-schemas/sws.js";
import { calculateWSW, validateWSW } from "./triangle-schemas/wsw.js";
import { calculateSSS, validateSSS } from "./triangle-schemas/sss.js";
import { calculateSSW, validateSSW } from "./triangle-schemas/ssw.js";

const schemaHandlers = {
  SWS: { validate: validateSWS, calculate: calculateSWS },
  WSW: { validate: validateWSW, calculate: calculateWSW },
  SSS: { validate: validateSSS, calculate: calculateSSS },
  SSW: { validate: validateSSW, calculate: calculateSSW },
};

export function calculateTriangle(input) {
  let { schema, alpha, beta, gamma, a, b, c } = input;

  const handler = schemaHandlers[schema];
  if (!handler) {
    return { error: "Ungültiges Schema" };
  }

  const validation = handler.validate({ alpha, beta, gamma, a, b, c });
  if (!validation || validation.ok !== true) {
    return { error: validation?.error || "Ungültige Eingaben" };
  }

  const result = handler.calculate({ alpha, beta, gamma, a, b, c }, validation);
  if (result?.error) {
    return { error: result.error };
  }

  ({ a, b, c, alpha, beta, gamma } = result);

  const angleSum = alpha + beta + gamma;
  if (!isFinite(alpha) || !isFinite(beta) || !isFinite(gamma) || alpha <= 0 || beta <= 0 || gamma <= 0 || Math.abs(angleSum - 180) > 0.1) {
    return { error: "Ungültige Eingaben für Winkel" };
  }

  let typeBySides = "";
  if (Math.abs(a - b) < 0.01 && Math.abs(b - c) < 0.01) {
    typeBySides = "gleichseitig";
  } else if (Math.abs(a - b) < 0.01 || Math.abs(a - c) < 0.01 || Math.abs(b - c) < 0.01) {
    typeBySides = "gleichschenklig";
  } else {
    typeBySides = "ungleichseitig";
  }

  let typeByAngles = "";
  if (Math.abs(alpha - 90) < 0.01 || Math.abs(beta - 90) < 0.01 || Math.abs(gamma - 90) < 0.01) {
    typeByAngles = "rechtwinklig";
  } else if (alpha > 90 || beta > 90 || gamma > 90) {
    typeByAngles = "stumpfwinklig";
  } else {
    typeByAngles = "spitzwinklig";
  }

  return { a, b, c, alpha, beta, gamma, typeBySides, typeByAngles };
}
