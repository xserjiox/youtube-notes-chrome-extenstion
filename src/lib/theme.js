const STORAGE_KEY = 'settings:theme';
const VALID_THEMES = ['light', 'dark', 'system'];

let _theme = 'system';
let _listeners = [];
let _target = null;
let _mediaQuery = null;

function notify() {
  const resolved = resolvedTheme();
  for (const fn of _listeners) fn(_theme, resolved);
}

/**
 * Subscribe to theme changes. Callback receives (theme, resolved).
 * Returns an unsubscribe function.
 */
export function onThemeChange(fn) {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((f) => f !== fn);
  };
}

/**
 * Set the target element for data-theme attribute.
 * Used by content script to target the shadow host instead of documentElement.
 */
export function setThemeTarget(el) {
  _target = el;
}

function getTarget() {
  if (_target) return _target;
  try {
    return document.documentElement;
  } catch {
    return null;
  }
}

/**
 * Apply the data-theme attribute to the target element.
 */
function applyTheme() {
  const el = getTarget();
  if (!el) return;
  el.setAttribute('data-theme', resolvedTheme());
}

/**
 * Resolve 'system' to the actual theme based on OS preference.
 */
export function resolvedTheme() {
  if (_theme !== 'system') return _theme;
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/**
 * Get current theme setting ('light' | 'dark' | 'system').
 */
export function currentTheme() {
  return _theme;
}

/**
 * Set theme, persist to storage, apply, and notify listeners.
 */
export async function setTheme(code) {
  if (!VALID_THEMES.includes(code)) return;
  _theme = code;
  applyTheme();
  notify();
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: code });
  } catch {
    // Storage may not be available
  }
}

/**
 * Initialize theme from storage, defaulting to 'system'.
 * Call once at app startup before mounting.
 */
export async function initTheme() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const stored = result[STORAGE_KEY];
    if (stored && VALID_THEMES.includes(stored)) {
      _theme = stored;
    }
  } catch {
    // Storage may not be available
  }
  applyTheme();

  // Listen for OS theme changes when in system mode
  try {
    _mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    _mediaQuery.addEventListener('change', () => {
      if (_theme === 'system') {
        applyTheme();
        notify();
      }
    });
  } catch {
    // matchMedia may not be available
  }

  // Sync theme when another context (e.g. popup) changes it in storage
  try {
    chrome.storage.onChanged.addListener((changes) => {
      const change = changes[STORAGE_KEY];
      if (!change) return;
      const val = change.newValue;
      if (val && VALID_THEMES.includes(val) && val !== _theme) {
        _theme = val;
        applyTheme();
        notify();
      }
    });
  } catch {
    // chrome.storage may not be available
  }
}
