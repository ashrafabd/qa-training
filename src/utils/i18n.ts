import { dictionaries, type LocaleCode, type LocaleKey } from "../locales";

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

export function tk(key: LocaleKey, lang: LocaleCode, vars: Record<string, string | number> = {}) {
  const dict = dictionaries[lang] || dictionaries.en;
  const template = dict[key] || dictionaries.en[key] || key;
  return fmt(template, vars);
}

export function fmtTime(timeText, lang) {
  if (lang !== "ar") return timeText;
  return String(timeText).replace(/\bhrs\b/, "ساعات").replace(/\bhr\b/, "ساعة");
}

export function arrow(lang) {
  return lang === "ar" ? "←" : "→";
}
