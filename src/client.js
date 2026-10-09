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
