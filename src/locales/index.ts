import en from "./en";
import ar from "./ar";

export const dictionaries = { en, ar } as const;

export type LocaleCode = keyof typeof dictionaries;
export type LocaleKey = keyof typeof en;
