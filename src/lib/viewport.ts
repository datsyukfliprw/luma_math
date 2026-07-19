// @SECTION FILE_OVERVIEW
// viewport.ts
// Single source of truth for the student app's supported viewport targets.
//
// This module DEFINES and DOCUMENTS the viewport ranges that future
// responsive work (audits, landscape/portrait layouts, touch targets, Safari
// viewport handling) will build on. It intentionally does NOT change the
// current scaling or responsive behavior — that logic still lives in
// src/App.tsx and is unchanged by this ticket (LUM-20).
//
// Design intent:
// - We target viewport *ranges* that all supported iPads fall into, rather
//   than optimizing for individual device models.
// - Landscape is the primary student experience.
// - Portrait must remain fully usable, but is a secondary layout.
// - Phones are not the primary student experience. They will receive a
//   simplified layout later; they are out of scope for the tablet targets
//   defined here.

// @SECTION VIEWPORT_CLASSES
/**
 * Named width ranges the student app supports.
 *
 * - `compact-tablet` — smaller tablets in portrait (e.g. iPad mini portrait).
 * - `standard-tablet` — most iPads in portrait.
 * - `large-tablet` — the primary design target; iPads in landscape and large
 *   iPads in portrait.
 * - `desktop` — wider-than-tablet displays. The app shell is centered and
 *   capped (see {@link APP_SHELL}); it is never expanded to fill the display.
 */
export type ViewportClassName = "compact-tablet" | "standard-tablet" | "large-tablet" | "desktop";

export type ViewportClass = {
  /** Stable identifier used in code and tests. */
  name: ViewportClassName;
  /** Human-readable label. */
  label: string;
  /** Inclusive minimum CSS width in pixels. */
  minWidth: number;
  /** Inclusive maximum CSS width in pixels, or `null` for the open-ended top range. */
  maxWidth: number | null;
  /** Whether this range is the primary design target. */
  isPrimaryDesignTarget: boolean;
  description: string;
};

/**
 * The minimum CSS width (in pixels) considered a supported tablet viewport.
 * Widths below this belong to phones, which are out of scope for this ticket.
 */
export const MIN_SUPPORTED_TABLET_WIDTH = 768;

export const VIEWPORT_CLASSES: readonly ViewportClass[] = [
  {
    name: "compact-tablet",
    label: "Compact Tablet",
    minWidth: 768,
    maxWidth: 819,
    isPrimaryDesignTarget: false,
    description: "Smaller tablets, typically portrait (e.g. iPad mini portrait).",
  },
  {
    name: "standard-tablet",
    label: "Standard Tablet",
    minWidth: 820,
    maxWidth: 1023,
    isPrimaryDesignTarget: false,
    description: "Most iPads in portrait orientation.",
  },
  {
    name: "large-tablet",
    label: "Large Tablet",
    minWidth: 1024,
    maxWidth: 1366,
    isPrimaryDesignTarget: true,
    description: "Primary design target: iPads in landscape and large iPads in portrait.",
  },
  {
    name: "desktop",
    label: "Desktop",
    minWidth: 1367,
    maxWidth: null,
    isPrimaryDesignTarget: false,
    description: "Displays wider than the app shell. The shell is centered, not expanded.",
  },
] as const;

// @SECTION APP_SHELL
/**
 * Maximum size of the student app shell in CSS pixels.
 *
 * The shell must never render larger than this, matching the largest
 * supported tablet (iPad Pro 12.9" landscape). On wider displays the shell is
 * centered rather than expanded.
 *
 * NOTE: These are the documented targets for future responsive work. The
 * current shell in src/App.tsx uses a separate 1540x900 "App Stage" and is
 * intentionally left unchanged by this ticket.
 */
export const APP_SHELL_MAX_WIDTH = 1366;
export const APP_SHELL_MAX_HEIGHT = 1024;

/**
 * Documented layout behavior the student app shell should follow. These flags
 * describe the intended behavior for future responsive work and are not wired
 * into the current implementation.
 */
export const APP_SHELL = {
  maxWidth: APP_SHELL_MAX_WIDTH,
  maxHeight: APP_SHELL_MAX_HEIGHT,
  /** Center the shell on displays larger than the shell's max size. */
  centerOnLargerDisplays: true,
  /** Never scale the shell larger than its max size. */
  allowUpscaling: false,
  /** The content area scrolls independently of the fixed sidebar. */
  contentScrollsIndependently: true,
  /** The sidebar stays fixed at the full shell height while content scrolls. */
  sidebarFixedFullHeight: true,
} as const;

// @SECTION ORIENTATION
export type Orientation = "landscape" | "portrait";

/**
 * Orientation guidance for the student experience.
 * - Landscape is the primary experience.
 * - Portrait must remain fully usable but is a secondary layout.
 */
export const PRIMARY_ORIENTATION: Orientation = "landscape";
export const SECONDARY_ORIENTATION: Orientation = "portrait";

// @SECTION REFERENCE_VIEWPORTS
export type DeviceViewport = {
  /** Reference device label. */
  device: string;
  /** Portrait CSS dimensions. Landscape swaps width and height. */
  portrait: { width: number; height: number };
};

/**
 * Common iPad viewport dimensions, provided as reference constants for
 * testing and audits. Dimensions are the portrait CSS pixel sizes; landscape
 * is the same values with width and height swapped (see {@link getLandscape}).
 *
 * These are references only — the supported targets are the width ranges in
 * {@link VIEWPORT_CLASSES}, not individual devices.
 */
export const IPAD_REFERENCE_VIEWPORTS: readonly DeviceViewport[] = [
  { device: "iPad mini", portrait: { width: 744, height: 1133 } },
  { device: 'iPad (10.2")', portrait: { width: 810, height: 1080 } },
  { device: 'iPad (10.9")', portrait: { width: 820, height: 1180 } },
  { device: 'iPad Pro 11"', portrait: { width: 834, height: 1194 } },
  { device: 'iPad Pro 12.9"/13"', portrait: { width: 1024, height: 1366 } },
] as const;

// @SECTION HELPERS
/** Return the landscape dimensions for a portrait viewport (width/height swapped). */
export function getLandscape(portrait: { width: number; height: number }): {
  width: number;
  height: number;
} {
  return { width: portrait.height, height: portrait.width };
}

/**
 * Classify a CSS width into a supported viewport class.
 * Returns `null` for widths below {@link MIN_SUPPORTED_TABLET_WIDTH} (phones),
 * which are out of scope for the tablet targets defined here.
 */
export function getViewportClass(width: number): ViewportClassName | null {
  if (width < MIN_SUPPORTED_TABLET_WIDTH) {
    return null;
  }

  for (const viewportClass of VIEWPORT_CLASSES) {
    const withinLowerBound = width >= viewportClass.minWidth;
    const withinUpperBound = viewportClass.maxWidth === null || width <= viewportClass.maxWidth;

    if (withinLowerBound && withinUpperBound) {
      return viewportClass.name;
    }
  }

  return null;
}
