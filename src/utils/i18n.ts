export function tr(value, lang) {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return value;
  if (Array.isArray(value)) return value.map((item) => tr(item, lang));
  if (typeof value === "object" && ("en" in value || "ar" in value)) {
    return value[lang] != null ? value[lang] : value.en;
  }
  return value;
}

export function fmt(template, vars) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => (vars[key] != null ? vars[key] : ""));
}

export function fmtTime(timeText, lang) {
  if (lang !== "ar") return timeText;
  return String(timeText).replace(/\bhrs\b/, "ساعات").replace(/\bhr\b/, "ساعة");
}

export function arrow(lang) {
  return lang === "ar" ? "←" : "→";
}
