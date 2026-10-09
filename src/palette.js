/**
 * AMOLED palette family (data only — inlined into the client bundle).
 *
 * A third-party theme is an alias-token override set: `ctx.theme.register`
 * publishes `tokens`, and ui-layout's ThemePresenter writes every entry as an
 * inline custom property on `<body>` while `colorScheme: 'dark'` keeps the
 * shipped dark base palette attribute. Inline properties beat the token
 * stylesheets, so overriding a static scale re-tints every alias that is
 * derived from it, and overriding an alias pins that one decision exactly.
 *
 * One hand-tuned template, one theme per accent:
 *
 *   AMOLED_STATIC / AMOLED_ALIAS
 *                       the reviewed black+red template — pure black canvas,
 *                       near-black surfaces, red hairlines, red brand, warm
 *                       label scale, warm code tokens. Every value is a literal
 *                       colour, so it can be re-hued mechanically.
 *   AMOLED_ACCENTS      the presets the family is generated from.
 *   createTokens()      rotates the template's chroma onto an accent while
 *                       preserving each token's lightness and alpha, then pins
 *                       the few decisions that are accent-specific (text drawn
 *                       on the accent itself). Error reds are never rotated:
 *                       "danger" must not follow the theme.
 *
 * Rotating instead of re-deriving keeps one audited set of contrast decisions
 * for the whole family — the blue theme has exactly the red theme's geometry,
 * one hue over.
 */

/** Raw colour scales: this is what most derived aliases resolve through. */
const AMOLED_STATIC = {
  // Warm neutrals take over the bluish neutral scale the dark palette is built on.
  "--dsw-static-neutral-bluish-00": "#ffffff",
  "--dsw-static-neutral-bluish-50": "#fff5f6",
  "--dsw-static-neutral-bluish-60": "#fbf1f2",
  "--dsw-static-neutral-bluish-75": "#f6e9eb",
  "--dsw-static-neutral-bluish-100": "#f0e2e5",
  "--dsw-static-neutral-bluish-150": "#e8dadd",
  "--dsw-static-neutral-bluish-200": "#dbc9cd",
  "--dsw-static-neutral-bluish-300": "#c3aeb3",
  "--dsw-static-neutral-bluish-400": "#a08a8f",
  "--dsw-static-neutral-bluish-500": "#87747a",
  "--dsw-static-neutral-bluish-600": "#6d5c62",
  "--dsw-static-neutral-bluish-700": "#57474d",
  "--dsw-static-neutral-bluish-750": "#45373d",
  "--dsw-static-neutral-bluish-800": "#2f2429",
  "--dsw-static-neutral-bluish-850": "#241a1e",
  "--dsw-static-neutral-bluish-875": "#150e11",
  "--dsw-static-neutral-bluish-900": "#0a0507",
  "--dsw-static-neutral-bluish-950": "#000000",
  "--dsw-static-neutral-bluish-1000": "#000000",
  // The plain neutral scale (scrollbars, inline code, idle states).
  "--dsw-static-neutral-00": "#ffffff",
  "--dsw-static-neutral-50": "#faf7f8",
  "--dsw-static-neutral-100": "#f5f2f3",
  "--dsw-static-neutral-150": "#efe9eb",
  "--dsw-static-neutral-200": "#e5dfe1",
  "--dsw-static-neutral-250": "#dcd6d8",
  "--dsw-static-neutral-300": "#d4ced0",
  "--dsw-static-neutral-400": "#a29a9c",
  "--dsw-static-neutral-500": "#827a7d",
  "--dsw-static-neutral-550": "#685f63",
  "--dsw-static-neutral-600": "#574e52",
  "--dsw-static-neutral-700": "#3f3539",
  "--dsw-static-neutral-800": "#2b2226",
  "--dsw-static-neutral-850": "#231b1f",
  "--dsw-static-neutral-900": "#0a0607",
  "--dsw-static-neutral-1000": "#000000",
  // The accent scale: shipped blue -> theme red.
  "--dsw-static-deepseek-50": "#fff1f2",
  "--dsw-static-deepseek-100": "#ffe0e3",
  "--dsw-static-deepseek-200": "#ffc7cd",
  "--dsw-static-deepseek-300": "#ff9aa4",
  "--dsw-static-deepseek-400": "#ff4d5e",
  "--dsw-static-deepseek-450": "#ff2d3f",
  "--dsw-static-deepseek-500": "#ef1d33",
  "--dsw-static-deepseek-600": "#c8121f",
  "--dsw-static-deepseek-700-delete": "#a30f1a",
  "--dsw-static-deepseek-800": "#6b0f18",
  "--dsw-static-deepseek-900": "#3d0a11",
  // Secondary accent slots that hard-code the blue family.
  "--dsw-static-blue-100": "#ffe0e3",
  "--dsw-static-blue-300": "#ff9aa4",
  "--dsw-static-blue-400": "#ff4d5e",
  "--dsw-static-blue-450": "#ff2d3f",
  "--dsw-static-blue-500": "#ef1d33",
  "--dsw-static-blue-600": "#c8121f",
  "--dsw-static-blue-800": "#6b0f18",
  "--dsw-static-blue-900": "#3d0a11",
  "--dsw-static-blue-950": "#1a0508",
  // Error reds stay red: they are semantic, only made hotter for pure black.
  "--dsw-static-red-400": "#ff4d5e",
  "--dsw-static-red-400-a12": "#ff4d5e1f",
  "--dsw-static-red-500": "#f01d33",
  "--dsw-static-red-600": "#c8121f",
  "--dsw-static-red-600-a08": "#c8121f14",
}

/** Semantic decisions the theme pins outright. */
const AMOLED_ALIAS = {
  // --- canvas: true black, no lit pixels between elements ---
  "--dsw-alias-bg-base": "#000000",
  "--dsw-alias-bg-document-preview": "#000000",
  "--dsw-specific-sidebar-fill": "#000000",
  "--dsw-specific-login-input": "#0a0507",

  // --- raised surfaces: near-black with a red cast ---
  "--dsw-alias-bg-layer-1": "#0a0507",
  "--dsw-alias-bg-layer-2": "#120b0e",
  "--dsw-alias-bg-layer-3": "#1a1014",
  "--dsw-alias-bg-overlay": "#150c10",
  "--dsw-alias-bg-module-platform": "#1c1116",
  "--dsw-alias-bg-multi-select": "#241419",
  "--dsw-alias-interactive-bg-hover-solid": "#2a171d",
  "--dsw-alias-interactive-bg-hover": "#ff2d3f14",
  "--dsw-alias-interactive-bg-active": "#ff2d3f24",
  "--dsw-alias-interactive-bg-hover-accent": "#ff2d3f3d",
  "--dsw-alias-interactive-bg-hover-danger": "#ff4d5e26",
  "--dsw-alias-turn-trigger-bg": "#ff2d3f14",
  "--dsw-alias-turn-trigger-bg-hover": "#ff2d3f24",
  "--dsw-alias-bg-skeleton": "#ff2d3f14",
  "--dsw-alias-bg-document-selection": "color-mix(in srgb, #ef1d33 42%, transparent)",

  // --- masks: a black theme darkens instead of greying ---
  "--dsw-alias-bg-mask-1": "#000000cc",
  "--dsw-alias-bg-mask-2": "#00000059",
  "--dsw-alias-bg-mask-3": "#0000009e",
  "--dsw-alias-bg-mask-photo": "#000000f0",
  "--dsw-alias-bg-mask-drop": "#120b0ed4",

  // --- borders: red-tinted hairlines ---
  "--dsw-alias-border-inverted": "#ffffff0f",
  "--dsw-alias-border-inverted2": "#ffffff14",
  "--dsw-alias-border-l1": "#ff2d3f12",
  "--dsw-alias-border-l2": "#ff2d3f21",
  "--dsw-alias-border-l2-darkmode-thin": "#ff2d3f12",
  "--dsw-alias-border-l3": "#ff2d3f30",
  "--dsw-alias-border-l4": "#ff2d3f3d",
  "--dsw-elevation-stroke-color": "#ff2d3f30",

  // --- brand and buttons: the primary action is red ---
  "--dsw-alias-brand-primary": "#ef1d33",
  "--dsw-alias-brand-primary-invert": "#ff4d5e",
  "--dsw-alias-brand-primary-new-colorprimary-new-color": "#ff4d5e",
  "--dsw-alias-brand-text": "#ff5c6c",
  "--dsw-alias-button-primary-fill": "#e6112a",
  "--dsw-alias-button-primary-hover": "#ff2d3f",
  "--dsw-alias-button-primary-dimmed": "#45161d",
  "--dsw-alias-label-primary-foreground": "#ffffff",
  "--dsw-alias-button-contrast-fill": "#f0e2e5",
  "--dsw-alias-button-elevated-fill": "#241a1e",
  "--dsw-alias-button-floating-fill": "#150e11",
  "--dsw-alias-button-floating-hover": "#241a1e",
  "--dsw-alias-button-ghost-active-border": "#6d5c62",
  "--dsw-alias-button-ghost-active-fill": "#2a171d",
  "--dsw-alias-button-ghost-active-hover": "#3a1c23",
  "--dsw-alias-button-info-fill": "#c8121f",
  "--dsw-alias-button-info-hover": "#ef1d33",
  "--dsw-alias-button-tool-bar-fill": "#3a1c2380",
  "--dsw-alias-button-tool-bar-fill-invisible": "#150e115c",
  "--dsw-alias-button-tool-bar-hover": "#3a1c2399",

  // --- text ---
  "--dsw-alias-label-primary": "#f7f1f2",
  "--dsw-alias-label-primary-bluish": "#f7f1f2",
  "--dsw-alias-label-primary-dimmed": "#ece0e2",
  "--dsw-alias-label-primary-inverted": "#1c1116",
  "--dsw-alias-label-secondary": "#c3aeb3",
  "--dsw-alias-label-tertiary": "#a08a8f",
  "--dsw-alias-label-caption": "#6d5c62",
  "--dsw-alias-label-dimmed": "#45373d",
  "--dsw-alias-label-shimmer": "color-mix(in srgb, #ff9aa4 45%, transparent)",
  "--dsw-alias-menu-icon": "#ece0e2",
  "--dsw-alias-link": "#ff5c6c",
  "--dsw-alias-switch-thumb": "#f0e2e5",
  "--dsw-alias-state-business-primary": "#ff4d5e",
  "--dsw-alias-state-business-tertiary": "#6b0f18",
  "--dsw-alias-label-deep-diving": "color-mix(in srgb, #ff2d3f 55%, #a08a8f)",
  "--dsw-alias-label-deep-diving-shimmer": "color-mix(in srgb, #ff9aa4 65%, #ff4d5e)",

  // --- menus, tooltips, toasts ---
  "--dsw-menu-surface-fill": "#120b0ee6",
  "--dsw-alias-menu-group-header-fill": "#0d0709f0",
  "--dsw-specific-menu": "#120b0ee6",
  "--dsw-alias-tooltip-bg": "#1c1116",
  "--dsw-alias-toast-bg": "#1c1116",
  "--dsw-alias-toast-label": "#ffffff",

  // --- sidebar navigation accents ---
  "--dsw-specific-sidebar-nav-item-active-accent": "#ff2d3f",
  "--dsw-specific-sidebar-nav-item-active": "#2a171d",
  "--dsw-specific-sidebar-nav-item-hover": "#1a1014",
  "--dsw-specific-bubble-highlight": "#241419",
  "--dsw-specific-bubble": "#1c1116",
  "--dsw-specific-input-major": "#0c0709",
  "--dsw-specific-selector": "#2f2429",
  "--dsw-specific-tip": "#2f2429",

  // --- rising text, onboarding gradients ---
  "--dsw-linear-gradient-think": "linear-gradient(180deg, #1a1014 20.19%, #1a101400 100%)",
  "--dsw-linear-think-select": "linear-gradient(180deg, #2a171d 20.19%, #2a171d00 100%)",
  "--dsw-alias-onboarding-accent": "#ff2d3f",
  "--dsw-alias-onboarding-secondary-fill": "#2a171d",
  "--dsw-gradient-onboarding-violet-stops": "#8c1020 33.102%, #ff5c6c 50.954%, #ffc7cd 85.326%, #8c1020",
  "--dsw-gradient-onboarding-blue-stops": "#c8121f 18.75%, #ff2d3f 51.78%, #ff9aa4 86.252%, #c8121f",
  "--dsw-gradient-onboarding-cyan-stops": "#7a0d18 21.154%, #e6112a 50.954%, #ffb3bb 85.326%, #7a0d18",

  // --- code: warm syntax on black ---
  "--shiki-token-constant": "#ff8f9b",
  "--shiki-token-string": "#ffb37a",
  "--shiki-token-string-expression": "#ffc79a",
  "--shiki-token-comment": "#7a6a6f",
  "--shiki-token-keyword": "#ff4d5e",
  "--shiki-token-parameter": "#ffa08a",
  "--shiki-token-function": "#ff9aa4",
  "--shiki-token-punctuation": "#b9a7aa",
  "--shiki-token-link": "#ff7a88",
}

// --- the family: one template, one theme per accent --------------------------

/** The template's own accent: the hue every theme is derived from. */
const TEMPLATE_ACCENT = "#ff2d3f"

/** Accent presets. `onAccent` is the text drawn on the accent itself. */
const AMOLED_ACCENTS = [
  { id: "red", label: "красная", accent: "#ff2d3f", onAccent: "#ffffff" },
  { id: "orange", label: "оранжевая", accent: "#ff7a1a", onAccent: "#180800" },
  { id: "amber", label: "янтарная", accent: "#ffc02e", onAccent: "#1a1200" },
  { id: "green", label: "зелёная", accent: "#2fd36b", onAccent: "#00170a" },
  { id: "teal", label: "бирюзовая", accent: "#17d1c0", onAccent: "#001614" },
  { id: "blue", label: "синяя", accent: "#3b82f6", onAccent: "#ffffff" },
  { id: "violet", label: "фиолетовая", accent: "#a06bff", onAccent: "#ffffff" },
  { id: "magenta", label: "розовая", accent: "#ff4d94", onAccent: "#ffffff" },
]

/**
 * Tokens no theme may re-hue: a red error must stay red when the theme is blue.
 * (Green and amber state tokens are not in the template at all — they keep the
 * shipped values in every theme for the same reason.)
 */
const SEMANTIC_KEEP = [
  "--dsw-static-red-400",
  "--dsw-static-red-400-a12",
  "--dsw-static-red-500",
  "--dsw-static-red-600",
  "--dsw-static-red-600-a08",
  "--dsw-alias-interactive-bg-hover-danger",
]

/** Expanded RGB triple of a `#rgb`/`#rrggbb` value. */
function hexToRgb(hex) {
  const raw = hex.startsWith("#") ? hex.slice(1) : hex
  return [0, 2, 4].map((at) => Number.parseInt(raw.slice(at, at + 2), 16))
}

/** Pack an RGB triple back into `#rrggbb`. */
function rgbToHex(rgb) {
  return "#" + rgb.map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0")).join("")
}

/**
 * Mix two colours, `weight` percent of `a` and the rest of `b`.
 * @param a - the dominant colour as a percentage.
 * @param b - the colour taking the remainder.
 * @param weight - percentage of `a`, 0..100.
 * @returns the mixed colour.
 */
function mixHex(a, b, weight) {
  const first = hexToRgb(a)
  const second = hexToRgb(b)
  const share = weight / 100
  return rgbToHex(first.map((channel, at) => channel * share + second[at] * (1 - share)))
}

/** The chroma of a colour: each channel minus the colour's own lightness. */
function chromaVector(hex) {
  const rgb = hexToRgb(hex)
  const mean = (rgb[0] + rgb[1] + rgb[2]) / 3
  return rgb.map((channel) => channel - mean)
}

const TEMPLATE_VECTOR = chromaVector(TEMPLATE_ACCENT)
const TEMPLATE_CHROMA = Math.hypot(...TEMPLATE_VECTOR)

/**
 * Move one colour onto an accent's hue, keeping its lightness and alpha: the
 * colour's chroma vector is re-scaled onto the accent's vector, so a template
 * accent comes back out as the accent exactly, and a near-neutral surface comes
 * back out as a near-neutral surface carrying that hue.
 * @param hex - `#rgb`, `#rrggbb`, or an 8-digit alpha form.
 * @param vector - the target accent's chroma vector.
 * @returns the re-hued colour.
 */
function rotateHex(hex, vector) {
  const raw = hex.slice(1)
  const full = raw.length <= 4 ? raw.split("").map((c) => c + c).join("") : raw
  const rgb = hexToRgb(full)
  const alpha = full.length === 8 ? full.slice(6) : ""
  const mean = (rgb[0] + rgb[1] + rgb[2]) / 3
  const scale = Math.hypot(...rgb.map((channel) => channel - mean)) / TEMPLATE_CHROMA
  return rgbToHex(vector.map((channel) => mean + channel * scale)) + alpha
}

/** Re-hue every literal colour inside a token value (gradients included). */
function recolor(value, vector) {
  return value.replace(/#[0-9a-fA-F]{3,8}\b/g, (hex) => rotateHex(hex, vector))
}

/**
 * Tokens pinned to the accent itself rather than to its re-hued template value:
 * the identity colours a user recognises from the swatch (brand, active accent,
 * the accent rung of both scales). Their contrast is not a guess — the accent
 * presets were picked for a black canvas, and `onAccent` covers the text drawn
 * on top.
 */
const ACCENT_PINS = [
  "--dsw-static-deepseek-450",
  "--dsw-static-blue-450",
  "--dsw-alias-brand-primary",
  "--dsw-alias-brand-primary-new-colorprimary-new-color",
  "--dsw-specific-sidebar-nav-item-active-accent",
  "--dsw-alias-onboarding-accent",
]

/**
 * Build one theme's complete override set from the template.
 * @param accent - an `AMOLED_ACCENTS` entry.
 * @returns a frozen token map.
 */
function createTokens(accent) {
  const vector = chromaVector(accent.accent)
  const tokens = {}
  for (const [name, value] of Object.entries({ ...AMOLED_STATIC, ...AMOLED_ALIAS })) {
    tokens[name] = SEMANTIC_KEEP.includes(name) ? value : recolor(value, vector)
  }
  for (const name of ACCENT_PINS) tokens[name] = accent.accent
  // Primary button fill: the accent, deepened for a little more contrast with
  // the label, so white-on-accent themes keep a readable button.
  tokens["--dsw-alias-button-primary-fill"] = mixHex(accent.accent, "#000000", 90)
  // Text drawn on the accent: bright accents need dark text.
  tokens["--dsw-alias-label-primary-foreground"] = accent.onAccent
  return Object.freeze(tokens)
}

/** The registered family: `amoled-red`, `amoled-blue`, … */
const AMOLED_THEMES = AMOLED_ACCENTS.map((accent) => ({
  id: `amoled-${accent.id}`,
  accentId: accent.id,
  label: accent.label,
  accent: accent.accent,
  colorScheme: "dark",
  tokens: createTokens(accent),
}))

/** Default accent for a fresh install. */
const AMOLED_DEFAULT_ACCENT = "red"
