// A tiny bag of things about *your* side of a deal, as opposed to a property or
// a buyer. Right now that's just the entity that signs contracts — the Notice
// of Termination needs it, and nothing else in the app had anywhere to keep it.

const KEY = "jacks-realty-settings-v1";

export function emptySettings() {
  return { entityName: "" };
}

export function getSettings() {
  if (typeof window === "undefined") return emptySettings();
  try {
    const raw = window.localStorage.getItem(KEY);
    return { ...emptySettings(), ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return emptySettings();
  }
}

/** Merge a patch in. Returns the saved settings. */
export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Non-fatal: the notice still prints with whatever's on screen.
  }
  return next;
}
