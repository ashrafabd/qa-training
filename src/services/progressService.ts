import { STORAGE_KEYS } from "../constants/storageKeys";

export function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.progress)) || {};
  } catch {
    return {};
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
  } catch {
    // Ignore storage failures to keep app usable.
  }
}

export function progressKey(weekNum, dayNum) {
  return `w${weekNum}d${dayNum}`;
}
