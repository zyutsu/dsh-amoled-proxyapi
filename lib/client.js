window.__ModuleLoader__.load({
	id: "dsh-amoled-proxyapi",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
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

		/**
		 * Browser half of the AMOLED / ProxyAPI plugin.
		 *
		 * Two contributions, one package:
		 *
		 *  1. A family of dark-scheme themes — `amoled-red`, `amoled-orange`,
		 *     `amoled-amber`, `amoled-green`, `amoled-teal`, `amoled-blue`,
		 *     `amoled-violet`, `amoled-magenta` — all sharing one audited black
		 *     geometry, one hue apart. They are registered through the public theme
		 *     service (never by poking variables or stylesheets), and the plugin
		 *     re-asserts the stored one on every load, because a third-party theme id
		 *     is an in-process preference that the durable settings schema does not
		 *     carry. A Settings row (General) picks the accent and switches the family
		 *     on or off; switching the shipped Appearance control to light/dark/system
		 *     switches it off too, so the two surfaces never disagree.
		 *
		 *  2. A ProxyAPI balance readout in the sidebar foot, fed by this package's
		 *     Host half (`GET /amoled-proxyapi/balance`) and clickable straight into
		 *     console.proxyapi.ru/usage — in the built-in browser panel when that tab
		 *     type is available, in a new tab otherwise.
		 *
		 * Self-contained on purpose: the only module it requires is `react` (a
		 * platform seed word), so the bundle has no boot-graph dependencies.
		 */

		/** Fallback preference when the AMOLED family is switched off. */
		const FALLBACK_THEME_ID = "dark"
		/** Where the AMOLED switch stores its state in this browser. */
		const STORAGE_ENABLED = "dsh-amoled:enabled"
		/** Where the chosen accent is stored in this browser. */
		const STORAGE_COLOR = "dsh-amoled:color"
		/** The single-accent key this plugin used before the family existed. */
		const LEGACY_ENABLED = "dsh-amoled-red:enabled"
		/** Host half route serving the balance read. */
		const BALANCE_ROUTE = "amoled-proxyapi/balance"
		/** Fallback usage page when the Host does not answer one. */
		const DEFAULT_USAGE_URL = "https://console.proxyapi.ru/usage"
		/** Balance poll interval while the page is visible. */
		const REFRESH_MS = 60000

		/** Required client services: the slot registry and the theme registry. */
		const inject = ["slots", "theme"]

		/** Widget stylesheet (scoped by class name, expressed in theme tokens). */
		const STYLES = `
		.DshAmoled_balance{display:inline-flex;align-items:center;gap:7px;box-sizing:border-box;flex:1 1 auto;min-width:0;height:34px;padding:0 8px;border:0;border-radius:var(--dsw-radius-md);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;line-height:20px;cursor:pointer;text-align:left;transition:background .1s ease,color .1s ease}
		.DshAmoled_balance[data-wide="0"]{flex:none;width:34px;justify-content:center;padding:0}
		.DshAmoled_balance:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
		.DshAmoled_dot{flex:none;width:7px;height:7px;border-radius:50%;background:var(--dsw-alias-state-success-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-state-success-primary) 22%,transparent)}
		.DshAmoled_balance[data-state="loading"] .DshAmoled_dot{background:var(--dsw-alias-label-caption);box-shadow:none;animation:DshAmoled_pulse 1.4s ease-in-out infinite}
		.DshAmoled_balance[data-state="forbidden"] .DshAmoled_dot,.DshAmoled_balance[data-state="unconfigured"] .DshAmoled_dot,.DshAmoled_balance[data-state="error"] .DshAmoled_dot{background:var(--dsw-alias-state-error-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-state-error-primary) 22%,transparent)}
		.DshAmoled_balanceText{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-variant-numeric:tabular-nums}
		.DshAmoled_row{display:flex;align-items:center;gap:8px;padding:16px 0;border-bottom:.5px solid var(--dsw-alias-border-l2)}
		.DshAmoled_rowText{display:flex;flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:24px}
		.DshAmoled_title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}
		.DshAmoled_description{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
		.DshAmoled_swatches{display:flex;flex:none;flex-wrap:wrap;justify-content:flex-end;gap:6px;max-width:220px}
		.DshAmoled_swatch{box-sizing:border-box;width:20px;height:20px;padding:0;border:0;border-radius:50%;cursor:pointer;box-shadow:inset 0 0 0 1px #ffffff2e;transition:transform .1s ease,box-shadow .1s ease}
		.DshAmoled_swatch:hover{transform:scale(1.12)}
		.DshAmoled_swatch[data-on="1"]{box-shadow:inset 0 0 0 1px #ffffff2e,0 0 0 2px var(--dsw-alias-bg-base),0 0 0 4px var(--dsw-alias-label-secondary)}
		.DshAmoled_swatch:focus-visible{outline:2px solid var(--dsw-alias-label-primary);outline-offset:3px}
		.DshAmoled_switch{position:relative;flex:none;width:40px;height:22px;padding:0;border:0;border-radius:999px;background:var(--dsw-alias-bg-module-platform);cursor:pointer;transition:background .12s ease}
		.DshAmoled_switch[data-on="1"]{background:var(--dsw-alias-button-primary-fill)}
		.DshAmoled_switch:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}
		.DshAmoled_knob{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:var(--dsw-static-neutral-00);transition:transform .12s ease}
		.DshAmoled_switch[data-on="1"] .DshAmoled_knob{transform:translateX(18px)}
		@keyframes DshAmoled_pulse{0%,100%{opacity:.35}50%{opacity:1}}
		`

		/**
		 * Minimal observable snapshot store: components read `getSnapshot()` and
		 * re-render from `subscribe`, so no service or store engine is needed.
		 * @param initial - first snapshot.
		 * @returns the store handle.
		 */
		function createStore(initial) {
		  let snapshot = initial
		  const listeners = new Set()
		  return {
		    getSnapshot: () => snapshot,
		    set: (next) => {
		      if (next === snapshot) return
		      snapshot = next
		      for (const listener of [...listeners]) listener()
		    },
		    subscribe: (listener) => {
		      listeners.add(listener)
		      return () => {
		        listeners.delete(listener)
		      }
		    },
		  }
		}

		/**
		 * Subscribe a component to a store snapshot.
		 * @param store - the store handle.
		 * @returns the current snapshot.
		 */
		function useStore(store) {
		  const [snapshot, setSnapshot] = react.useState(() => store.getSnapshot())
		  react.useEffect(() => store.subscribe(() => setSnapshot(store.getSnapshot())), [store])
		  return snapshot
		}

		/**
		 * Russian rouble formatting for a balance (ru-RU grouping, two decimals).
		 * @param value - numeric balance, or null while unknown.
		 * @returns display text.
		 */
		function formatRubles(value) {
		  if (typeof value !== "number" || !Number.isFinite(value)) return "—"
		  try {
		    return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(value)
		  } catch {
		    return `${value.toFixed(2)} ₽`
		  }
		}

		/**
		 * Short sidebar text for a balance snapshot.
		 * @param snapshot - balance store snapshot.
		 * @returns one-line label.
		 */
		function balanceLabel(snapshot) {
		  if (snapshot.phase === "ok") return formatRubles(snapshot.balance)
		  if (snapshot.phase === "forbidden") return "нет доступа"
		  if (snapshot.phase === "unconfigured") return "нет ключа"
		  if (snapshot.phase === "error") return "ошибка"
		  return "баланс…"
		}

		/**
		 * Multi-line tooltip: the fact, its provenance, and what a click does.
		 * @param snapshot - balance store snapshot.
		 * @param usageUrl - page the click opens.
		 * @returns tooltip text.
		 */
		function balanceTooltip(snapshot, usageUrl) {
		  const open = `Нажмите, чтобы открыть ${usageUrl}`
		  if (snapshot.phase === "ok") {
		    const lines = [`ProxyAPI: ${formatRubles(snapshot.balance)}`]
		    const budget = snapshot.budget
		    if (budget !== null && budget !== undefined && typeof budget.limit === "number") {
		      lines.push(`Бюджет ключа: использовано ${formatRubles(budget.used ?? 0)} из ${formatRubles(budget.limit)}`)
		    } else {
		      lines.push("Баланс аккаунта")
		    }
		    if (snapshot.at > 0) lines.push(`Обновлено ${new Date(snapshot.at).toLocaleTimeString("ru-RU")}`)
		    lines.push(open)
		    return lines.join("\n")
		  }
		  if (snapshot.phase === "forbidden") {
		    return [
		      "ProxyAPI отклонил запрос баланса для этого ключа.",
		      snapshot.message ?? "",
		      "Разрешите «Запрос баланса» в настройках ключа: https://console.proxyapi.ru/keys",
		      open,
		    ].filter(Boolean).join("\n")
		  }
		  if (snapshot.phase === "unconfigured") {
		    return [`Ключ ProxyAPI не найден (${snapshot.message ?? "PROXYAPI_API_KEY"}).`, open].join("\n")
		  }
		  if (snapshot.phase === "error") {
		    return [`Не удалось получить баланс: ${snapshot.message ?? "неизвестная ошибка"}`, open].join("\n")
		  }
		  return "Запрашиваю баланс ProxyAPI…"
		}

		/**
		 * Sidebar-foot balance readout (the `sidebar.footer.action` occupant).
		 * @param props - composed slot props: `wide` from the owner, the balance store
		 *   and the usage opener from this plugin's injection.
		 * @returns the button element.
		 */
		function BalanceAction(props) {
		  const snapshot = useStore(props.balance)
		  const wide = props.wide !== false
		  const usageUrl = snapshot.usageUrl === null || snapshot.usageUrl === undefined ? DEFAULT_USAGE_URL : snapshot.usageUrl
		  return react.createElement(
		    "button",
		    {
		      type: "button",
		      className: "DshAmoled_balance",
		      "data-state": snapshot.phase,
		      "data-wide": wide ? "1" : "0",
		      title: balanceTooltip(snapshot, usageUrl),
		      "aria-label": `Баланс ProxyAPI: ${balanceLabel(snapshot)}`,
		      onClick: () => props.openUsage(),
		    },
		    react.createElement("span", { className: "DshAmoled_dot" }),
		    wide ? react.createElement("span", { className: "DshAmoled_balanceText" }, balanceLabel(snapshot)) : null,
		  )
		}

		/**
		 * Settings → General row: accent swatches plus the on/off switch.
		 * @param props - composed slot props: the theme store, the accent presets, and
		 *   the two setters.
		 * @returns the row element.
		 */
		function AmoledRow(props) {
		  const snapshot = useStore(props.themeState)
		  const current = props.accents.find((accent) => accent.id === snapshot.color) ?? props.accents[0]
		  return react.createElement(
		    "div",
		    { className: "DshAmoled_row" },
		    react.createElement(
		      "div",
		      { className: "DshAmoled_rowText" },
		      react.createElement("div", { className: "DshAmoled_title" }, "AMOLED тема"),
		      react.createElement(
		        "div",
		        { className: "DshAmoled_description" },
		        snapshot.enabled
		          ? `Включена: чистый чёрный фон (#000) и ${current.label} палитра.`
		          : "Выключена: используется обычная тёмная тема оформления.",
		      ),
		    ),
		    react.createElement(
		      "div",
		      { className: "DshAmoled_swatches", role: "group", "aria-label": "Цвет AMOLED темы" },
		      props.accents.map((accent) =>
		        react.createElement("button", {
		          key: accent.id,
		          type: "button",
		          className: "DshAmoled_swatch",
		          style: { background: accent.accent },
		          title: `AMOLED: ${accent.label} палитра`,
		          "aria-label": `AMOLED: ${accent.label} палитра`,
		          "aria-pressed": snapshot.enabled && accent.id === snapshot.color,
		          "data-on": snapshot.enabled && accent.id === snapshot.color ? "1" : "0",
		          onClick: () => props.setColor(accent.id),
		        }),
		      ),
		    ),
		    react.createElement(
		      "button",
		      {
		        type: "button",
		        role: "switch",
		        "aria-checked": snapshot.enabled,
		        className: "DshAmoled_switch",
		        "data-on": snapshot.enabled ? "1" : "0",
		        "aria-label": "AMOLED тема",
		        title: snapshot.enabled ? "Выключить AMOLED тему" : "Включить AMOLED тему",
		        onClick: () => props.setEnabled(!snapshot.enabled),
		      },
		      react.createElement("span", { className: "DshAmoled_knob" }),
		    ),
		  )
		}

		/**
		 * Read a stored string, preferring the current key over the legacy one.
		 * @param key - the current storage key.
		 * @param legacy - the key this plugin used before the family existed.
		 * @returns the stored value, or null.
		 */
		function readStored(key, legacy) {
		  try {
		    const value = window.localStorage.getItem(key) ?? (legacy === undefined ? null : window.localStorage.getItem(legacy))
		    return value === "" ? null : value
		  } catch {
		    return null
		  }
		}

		/** Write a stored flag, ignoring a blocked storage (private mode). */
		function writeStored(key, value) {
		  try {
		    window.localStorage.setItem(key, value)
		  } catch (error) {
		    console.warn("[amoled] localStorage unavailable", error)
		  }
		}

		/**
		 * Client plugin body: register the theme family, its stylesheet, the two slot
		 * occupants, and the balance polling loop.
		 * @param ctx - client root context (slots + theme).
		 */
		function apply(ctx) {
		  // --- theme family ---------------------------------------------------------
		  ctx.effect(() => {
		    const disposers = AMOLED_THEMES.map((theme) =>
		      ctx.theme.register({ id: theme.id, colorScheme: theme.colorScheme, tokens: theme.tokens }),
		    )
		    return () => {
		      for (const dispose of disposers) dispose()
		    }
		  }, "amoled: themes")
		  ctx.effect(() => {
		    const tag = document.createElement("style")
		    tag.dataset.plugin = "dsh-amoled-proxyapi"
		    tag.textContent = STYLES
		    document.head.append(tag)
		    return () => tag.remove()
		  }, "amoled: styles")

		  const knownColor = (id) => AMOLED_ACCENTS.some((accent) => accent.id === id)
		  const storedColor = readStored(STORAGE_COLOR)
		  const themeState = createStore({
		    // On by default: installing the plugin is the request for the theme.
		    enabled: readStored(STORAGE_ENABLED, LEGACY_ENABLED) !== "0",
		    color: knownColor(storedColor) ? storedColor : AMOLED_DEFAULT_ACCENT,
		  })
		  /** True while this plugin itself is writing the preference (not the user). */
		  let writing = false

		  const themeId = (color) => `amoled-${color}`

		  /**
		   * Write the preference the two controls should agree on.
		   * @param on - false returns to the shipped dark theme.
		   * @param color - the accent to assert while on.
		   */
		  const applyTheme = (on, color) => {
		    const next = { enabled: on, color }
		    writeStored(STORAGE_ENABLED, on ? "1" : "0")
		    writeStored(STORAGE_COLOR, color)
		    const preference = on ? themeId(color) : FALLBACK_THEME_ID
		    if (ctx.theme.getTheme().preference !== preference) {
		      writing = true
		      try {
		        ctx.theme.setTheme(preference)
		      } catch (error) {
		        console.warn("[amoled] could not switch theme", error)
		      } finally {
		        writing = false
		      }
		    }
		    themeState.set(next)
		  }

		  const setEnabled = (on) => applyTheme(on, themeState.getSnapshot().color)
		  // Choosing an accent is a request for that theme, so it switches the family on.
		  const setColor = (color) => applyTheme(true, color)

		  /** Follow any preference change; the shipped Appearance control is authoritative. */
		  const syncThemeState = () => {
		    const preference = ctx.theme.getTheme().preference
		    const enabled = preference.startsWith("amoled-")
		    const color = enabled && knownColor(preference.slice("amoled-".length)) ? preference.slice("amoled-".length) : themeState.getSnapshot().color
		    if (!enabled && enabled !== themeState.getSnapshot().enabled) writeStored(STORAGE_ENABLED, "0")
		    themeState.set({ enabled, color })
		  }

		  ctx.effect(
		    () =>
		      ctx.on("theme/change", () => {
		        if (!writing) syncThemeState()
		      }),
		    "amoled: preference tracking",
		  )

		  // Anything but one of our ids on load (a fresh page, or the user picked
		  // light/dark/system) leaves the stored accent untouched.
		  const initial = themeState.getSnapshot()
		  if (initial.enabled && ctx.theme.getTheme().preference !== themeId(initial.color)) applyTheme(true, initial.color)
		  else syncThemeState()

		  // --- balance -------------------------------------------------------------
		  const balance = createStore({
		    phase: "loading",
		    balance: null,
		    budget: null,
		    message: null,
		    at: 0,
		    usageUrl: DEFAULT_USAGE_URL,
		  })
		  /** In-flight read, so a poll tick and a click never double-fetch. */
		  let inFlight = null

		  const refreshBalance = () => {
		    if (inFlight !== null) return inFlight
		    if (typeof document !== "undefined" && document.hidden) return null
		    const previous = balance.getSnapshot()
		    balance.set({ ...previous, phase: previous.phase === "ok" ? "ok" : "loading" })
		    inFlight = window
		      .fetch(BALANCE_ROUTE, { headers: { accept: "application/json" }, credentials: "same-origin" })
		      .then(async (response) => {
		        const payload = await response.json().catch(() => null)
		        if (payload === null || typeof payload !== "object") {
		          balance.set({ ...balance.getSnapshot(), phase: "error", message: `HTTP ${response.status}`, at: Date.now() })
		          return
		        }
		        const usageUrl = typeof payload.usageUrl === "string" ? payload.usageUrl : DEFAULT_USAGE_URL
		        if (payload.ok === true) {
		          balance.set({
		            phase: "ok",
		            balance: typeof payload.balance === "number" ? payload.balance : null,
		            budget: payload.budget ?? null,
		            message: null,
		            at: Date.now(),
		            usageUrl,
		          })
		          return
		        }
		        const code = payload.code
		        balance.set({
		          ...balance.getSnapshot(),
		          phase: code === "forbidden" ? "forbidden" : code === "no-key" ? "unconfigured" : "error",
		          message: typeof payload.message === "string" ? payload.message : null,
		          at: Date.now(),
		          usageUrl,
		        })
		      })
		      .catch((error) => {
		        balance.set({
		          ...balance.getSnapshot(),
		          phase: "error",
		          message: error instanceof Error ? error.message : String(error),
		          at: Date.now(),
		        })
		      })
		      .finally(() => {
		        inFlight = null
		      })
		    return inFlight
		  }

		  /**
		   * Open the ProxyAPI usage page: the built-in browser panel when its tab type
		   * is registered, a new browser tab otherwise.
		   */
		  const openUsage = () => {
		    const url = balance.getSnapshot().usageUrl ?? DEFAULT_USAGE_URL
		    const rightbar = ctx.get("sidebarRight")
		    const tabs = ctx.get("sidebarRightTabs")
		    try {
		      if (rightbar !== void 0 && tabs !== void 0 && tabs.get("browser") !== void 0) {
		        rightbar.openTab("browser", { params: { url } })
		        return
		      }
		    } catch (error) {
		      console.warn("[amoled] browser panel unavailable, opening a tab instead", error)
		    }
		    window.open(url, "_blank", "noopener,noreferrer")
		  }

		  refreshBalance()
		  ctx.effect(() => {
		    const timer = setInterval(refreshBalance, REFRESH_MS)
		    const onVisibility = () => {
		      if (!document.hidden) refreshBalance()
		    }
		    document.addEventListener("visibilitychange", onVisibility)
		    return () => {
		      clearInterval(timer)
		      document.removeEventListener("visibilitychange", onVisibility)
		    }
		  }, "amoled: balance polling")

		  // --- seats ---------------------------------------------------------------
		  ctx.slots.inject("sidebar.footer.action", () =>
		    ctx.slots.register(
		      {
		        name: "sidebar.footer.action",
		        id: "amoled-balance",
		        order: 5,
		        inject: () => ({ balance, openUsage, refreshBalance }),
		      },
		      BalanceAction,
		    ),
		  )
		  ctx.slots.inject("settings.general.item", () =>
		    ctx.slots.register(
		      {
		        name: "settings.general.item",
		        id: "amoled-theme",
		        order: 12,
		        inject: () => ({ themeState, accents: AMOLED_ACCENTS, setEnabled, setColor }),
		      },
		      AmoledRow,
		    ),
		  )
		}
		exports.apply = apply;
		exports.inject = inject;
		exports.AMOLED_THEMES = AMOLED_THEMES;
		exports.AMOLED_ACCENTS = AMOLED_ACCENTS;
		exports.AMOLED_DEFAULT_ACCENT = AMOLED_DEFAULT_ACCENT;
		return module.exports;
	}
});
