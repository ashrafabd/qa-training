import { createContext, type Dispatch, type SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { WEEKS } from "../data";
import { progressKey } from "../services/progressService";
import { tk, tr } from "../utils/i18n";
import { useAuthContext } from "./AuthContext";
import type { LocaleCode, LocaleKey } from "../locales";

interface AppContextValue {
  lang: LocaleCode;
  theme: string;
  progressData: Record<string, boolean>;
  totalDays: number;
  doneCount: number;
  progressPct: number;
  navOpen: boolean;
  navCollapsed: boolean;
  setLang: Dispatch<SetStateAction<LocaleCode>>;
  setTheme: Dispatch<SetStateAction<string>>;
  setNavOpen: Dispatch<SetStateAction<boolean>>;
  setNavCollapsed: Dispatch<SetStateAction<boolean>>;
  isDone: (weekNum: number, dayNum: number) => boolean;
  toggleDone: (weekNum: number, dayNum: number) => Promise<void>;
  resetProgress: () => Promise<void>;
  t: (value: any) => any;
  tx: (key: LocaleKey, vars?: Record<string, string | number>) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

function getInitialLang() {
  const value = localStorage.getItem(STORAGE_KEYS.lang);
  return value === "ar" ? "ar" : "en";
}

function getInitialTheme() {
  return localStorage.getItem(STORAGE_KEYS.theme) || "light";
}

function getInitialNavCollapsed() {
  return localStorage.getItem(STORAGE_KEYS.navCollapsed) === "1";
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, updateOwnProgress } = useAuthContext();
  const [lang, setLang] = useState<LocaleCode>(getInitialLang);
  const [theme, setTheme] = useState(getInitialTheme);
  const [progressData, setProgressData] = useState<Record<string, boolean>>({});
  const [navOpen, setNavOpen] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(getInitialNavCollapsed);

  const totalDays = useMemo(() => WEEKS.reduce((total, week) => total + week.days.length, 0), []);

  const doneCount = useMemo(() => Object.keys(progressData).length, [progressData]);
  const progressPct = useMemo(() => Math.round((doneCount / totalDays) * 100), [doneCount, totalDays]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    localStorage.setItem(STORAGE_KEYS.lang, lang);
  }, [lang]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.navCollapsed, navCollapsed ? "1" : "0");
  }, [navCollapsed]);

  useEffect(() => {
    if (!user) {
      setProgressData({});
      return;
    }
    const next = (user.completedLessons || []).reduce<Record<string, boolean>>((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setProgressData(next);
  }, [user]);

  useEffect(() => {
    document.body.classList.toggle("nav-open", navOpen);
  }, [navOpen]);

  useEffect(() => {
    document.body.classList.toggle("nav-collapsed", navCollapsed);
  }, [navCollapsed]);

  const isDone = useCallback((weekNum, dayNum) => !!progressData[progressKey(weekNum, dayNum)], [progressData]);

  const toggleDone = useCallback(async (weekNum: number, dayNum: number) => {
    let nextProgress: Record<string, boolean> = {};
    setProgressData((prev) => {
      const key = progressKey(weekNum, dayNum);
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        nextProgress = next;
        return next;
      }
      const next = { ...prev, [key]: true };
      nextProgress = next;
      return next;
    });
    await updateOwnProgress(Object.keys(nextProgress));
  }, [updateOwnProgress]);

  const resetProgress = useCallback(async () => {
    setProgressData({});
    await updateOwnProgress([]);
  }, [updateOwnProgress]);

  const value = useMemo<AppContextValue>(
    () => ({
      lang,
      theme,
      progressData,
      totalDays,
      doneCount,
      progressPct,
      navOpen,
      navCollapsed,
      setLang,
      setTheme,
      setNavOpen,
      setNavCollapsed,
      isDone,
      toggleDone,
      resetProgress,
      t: (value: any) => tr(value, lang),
      tx: (key: LocaleKey, vars = {}) => tk(key, lang, vars)
    }),
    [lang, theme, progressData, totalDays, doneCount, progressPct, navOpen, navCollapsed, isDone, toggleDone, resetProgress]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}
