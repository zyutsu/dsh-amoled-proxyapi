/**
 * Harness for the generated browser bundle.
 *
 * The bundle is run against a fake module loader, a minimal React hook runtime,
 * a fake DOM, and a fake theme/slot context, then asserted on the facts that
 * matter: one registered factory under the manifest name, the theme family it
 * publishes, the two slot occupants, the preference re-assert on load, the
 * accent picker and switch that drive it, and the balance readout end to end.
 *
 * usage: node build/test-client.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const script = readFileSync(join(root, 'lib', 'client.js'), 'utf8');

// --- fake DOM ---------------------------------------------------------------
const head = [];
const listeners = new Map();
globalThis.document = {
  hidden: false,
  head: { append: (element) => head.push(element) },
  createElement: (tagName) => ({
    tagName,
    dataset: {},
    textContent: '',
    remove() {
      this.removed = true;
    },
  }),
  addEventListener: (name, fn) => listeners.set(name, fn),
  removeEventListener: (name) => listeners.delete(name),
};

const storage = new Map();
const opened = [];
const usageUrl = 'https://console.proxyapi.ru/usage';
const fetched = [];
globalThis.window = {
  __ModuleLoader__: { load: (row) => (registered = row) },
  localStorage: {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
  },
  fetch: (input) => {
    fetched.push(input);
    return Promise.resolve({
      status: 200,
      json: async () => ({ ok: true, balance: 1234.56, budget: null, usageUrl }),
    });
  },
  open: (url) => opened.push(url),
};
let registered;

// --- minimal React ----------------------------------------------------------
let hooks = [];
let cursor = 0;
let pendingEffects = [];
const react = {
  createElement: (type, props, ...children) => ({
    type,
    props: { ...(props ?? {}), children: children.length > 1 ? children : children[0] },
  }),
  useState: (initial) => {
    const index = cursor++;
    if (!(index in hooks)) hooks[index] = typeof initial === 'function' ? initial() : initial;
    return [
      hooks[index],
      (next) => {
        hooks[index] = typeof next === 'function' ? next(hooks[index]) : next;
      },
    ];
  },
  useEffect: (effect, deps) => {
    const index = cursor++;
    const previous = hooks[index];
    if (previous === undefined || deps === undefined || deps.some((dep, i) => dep !== previous.deps[i])) {
      pendingEffects.push(effect);
    }
    hooks[index] = { deps };
  },
};

/** Render one component instance through the fake hook runtime. */
const instances = new Map();
function render(component, props) {
  hooks = instances.get(component) ?? [];
  instances.set(component, hooks);
  cursor = 0;
  pendingEffects = [];
  const element = component(props);
  for (const effect of pendingEffects) effect();
  return element;
}

// --- load the bundle --------------------------------------------------------
new Function(script)();
assert.equal(registered?.id, pkg.name, 'bundle registers the manifest package name');
const bundle = registered.factory((specifier) => {
  if (specifier === 'react') return react;
  throw new Error(`unexpected require: ${specifier}`);
});
assert.equal(typeof bundle.apply, 'function', 'apply export');
assert.deepEqual(bundle.inject, ['slots', 'theme'], 'client service inject list');

// --- the palette family -----------------------------------------------------
const themes = [...bundle.AMOLED_THEMES];
const accents = [...bundle.AMOLED_ACCENTS];
assert.equal(themes.length, accents.length, 'one theme per accent');
assert.ok(themes.length >= 6, `theme count (${themes.length})`);
assert.equal(bundle.AMOLED_DEFAULT_ACCENT, 'red', 'default accent');

const template = themes[0].tokens;
const names = Object.keys(template);
assert.ok(names.length > 150, `token count (${names.length})`);
assert.deepEqual(
  themes.map((theme) => theme.id),
  accents.map((accent) => `amoled-${accent.id}`),
  'theme ids follow the accents',
);

for (const theme of themes) {
  assert.equal(theme.colorScheme, 'dark', `${theme.id}: dark scheme`);
  assert.deepEqual(Object.keys(theme.tokens), names, `${theme.id}: identical token keys`);
  for (const [name, value] of Object.entries(theme.tokens)) {
    assert.match(name, /^--[a-z0-9-]+$/, `token name ${name}`);
    assert.ok(typeof value === 'string' && value.trim().length > 0, `${theme.id}: ${name} value`);
  }
  assert.equal(theme.tokens['--dsw-alias-bg-base'], '#000000', `${theme.id}: black canvas`);
  assert.equal(theme.tokens['--dsw-specific-sidebar-fill'], '#000000', `${theme.id}: black sidebar`);
  assert.equal(theme.tokens['--dsw-alias-brand-primary'], theme.accent, `${theme.id}: brand is the accent`);
  assert.equal(theme.tokens['--dsw-static-deepseek-450'], theme.accent, `${theme.id}: accent rung`);
  assert.equal(theme.tokens['--dsw-static-red-500'], template['--dsw-static-red-500'], `${theme.id}: error red stays red`);
  assert.ok(/^#ff|^#[0-9a-f]{6}$/.test(theme.tokens['--shiki-token-keyword']), `${theme.id}: code tokens themed`);
  const layer = theme.tokens['--dsw-alias-bg-layer-1'];
  const mean = [1, 3, 5].reduce((sum, at) => sum + Number.parseInt(layer.slice(at, at + 2), 16), 0) / 3;
  assert.ok(mean < 16, `${theme.id}: layer-1 stays near-black (${layer})`);
}
assert.notEqual(themes[5].tokens['--dsw-alias-bg-layer-1'], template['--dsw-alias-bg-layer-1'], 'each accent casts its own hue');
assert.notEqual(themes[5].tokens['--shiki-token-keyword'], template['--shiki-token-keyword'], 'code tokens follow the accent');

// --- fake client context ----------------------------------------------------
/**
 * Boot the plugin body against a fresh fake context.
 * @param options - `{ stored, preference }` overrides.
 * @returns the live handles the assertions need.
 */
function mount(options = {}) {
  storage.clear();
  opened.length = 0;
  fetched.length = 0;
  head.length = 0;
  listeners.clear();
  instances.clear();
  for (const [key, value] of Object.entries(options.stored ?? {})) storage.set(key, value);

  const registry = new Map([
    ['light', { id: 'light', colorScheme: 'light', tokens: {} }],
    ['dark', { id: 'dark', colorScheme: 'dark', tokens: {} }],
  ]);
  let preference = options.preference ?? 'system';
  const changeListeners = new Set();
  const theme = {
    getTheme: () => ({
      preference,
      fontSize: 14,
      active: registry.get(preference === 'system' ? 'dark' : preference),
      themes: [...registry.values()],
      revision: 0,
    }),
    setTheme: (id) => {
      if (id !== 'system' && !registry.has(id)) throw new Error(`theme "${id}" is not registered`);
      if (preference === id) return;
      preference = id;
      for (const listener of [...changeListeners]) listener();
    },
    register: (definition) => {
      if (registry.has(definition.id)) throw new Error(`theme "${definition.id}" is already registered`);
      if (definition.tokens === undefined) throw new Error('theme registered without tokens');
      registry.set(definition.id, definition);
      if (preference === definition.id) for (const listener of [...changeListeners]) listener();
      return () => registry.delete(definition.id);
    },
  };
  const registrations = [];
  const injections = [];
  const ctx = {
    theme,
    slots: {
      register: (slotOptions, component) => {
        registrations.push({ options: slotOptions, component });
        return () => {};
      },
      inject: (key, callback) => {
        injections.push(key);
        callback();
      },
    },
    on: (event, listener) => {
      assert.equal(event, 'theme/change', 'subscribed event');
      changeListeners.add(listener);
      return () => changeListeners.delete(listener);
    },
    effect: (callback) => callback() ?? (() => {}),
    get: () => undefined,
  };

  bundle.apply(ctx);

  return {
    ctx,
    registry,
    registrations,
    injections,
    storage,
    changeListeners,
    get preference() {
      return preference;
    },
    /** Simulate the shipped Appearance control picking a built-in theme. */
    externalTheme(id) {
      preference = id;
      for (const listener of [...changeListeners]) listener();
    },
  };
}

// --- registration and the load-time re-assert -------------------------------
{
  const app = mount();
  assert.equal(app.registry.size, 2 + themes.length, 'every theme registered');
  for (const theme of themes) assert.ok(app.registry.has(theme.id), `${theme.id} registered`);
  assert.equal(app.preference, 'amoled-red', 'stored accent re-asserted on load');
  assert.equal(app.storage.get('dsh-amoled:enabled'), '1', 'the adoption is remembered');
  assert.equal(app.storage.get('dsh-amoled:color'), 'red', 'the accent is remembered');
  assert.deepEqual(app.injections, ['sidebar.footer.action', 'settings.general.item'], 'seat order');
  assert.equal(head.length, 1, 'one stylesheet inserted');
  assert.equal(head[0].dataset.plugin, 'dsh-amoled-proxyapi', 'stylesheet tagged');
  assert.match(head[0].textContent, /\.DshAmoled_balance\{/, 'widget styles present');
  assert.match(head[0].textContent, /\.DshAmoled_swatch\[data-on="1"\]/, 'swatch styles present');
  assert.equal(listeners.has('visibilitychange'), true, 'polling listens for visibility');
}

// --- stored accent, switch, and the legacies --------------------------------
{
  const app = mount({ stored: { 'dsh-amoled:color': 'blue' } });
  assert.equal(app.preference, 'amoled-blue', 'stored accent applied');
}
{
  const app = mount({ stored: { 'dsh-amoled:enabled': '0', 'dsh-amoled:color': 'violet' } });
  assert.equal(app.preference, 'system', 'switch off leaves the shipped preference');
  assert.equal(app.storage.get('dsh-amoled:color'), 'violet', 'accent still remembered');
}
{
  const app = mount({ stored: { 'dsh-amoled:color': 'not-a-color' } });
  assert.equal(app.preference, 'amoled-red', 'unknown accent falls back to the default');
}
{
  const app = mount({ stored: { 'dsh-amoled-red:enabled': '0' } });
  assert.equal(app.preference, 'system', 'the pre-family key still switches the family off');
}
{
  const app = mount({ preference: 'light' });
  assert.equal(app.preference, 'amoled-red', 'the stored accent wins over the shipped preference');
}

// --- slots and the theme row ------------------------------------------------
const seats = mount().registrations;
const balanceSeat = seats[0];
const settingsSeat = seats[1];
assert.equal(balanceSeat.options.name, 'sidebar.footer.action', 'balance seat');
assert.equal(balanceSeat.options.id, 'amoled-balance', 'balance entry id');
assert.equal(settingsSeat.options.name, 'settings.general.item', 'settings seat');
assert.equal(settingsSeat.options.id, 'amoled-theme', 'settings entry id');
assert.ok(settingsSeat.options.order > balanceSeat.options.order, 'settings row ordered after');

{
  const app = mount({ stored: { 'dsh-amoled:color': 'teal' } });
  const seat = app.registrations[1];
  const props = seat.options.inject();
  assert.deepEqual(props.accents, accents, 'accents handed to the row');

  const row = render(seat.component, props);
  const text = row.props.children[0];
  const swatches = row.props.children[1];
  const toggle = row.props.children[2];
  assert.equal(text.props.children[0].props.children, 'AMOLED тема', 'row title');
  assert.match(text.props.children[1].props.children, /^Включена: .*бирюзовая палитра\.$/);
  assert.equal(swatches.props.children.length, accents.length, 'one swatch per accent');
  assert.equal(swatches.props.children[3].props.style.background, accents[3].accent, 'swatch colour');
  assert.equal(swatches.props.children[4].props['data-on'], '1', 'current accent marked');
  assert.equal(swatches.props.children[0].props['data-on'], '0', 'other accents unmarked');
  assert.equal(toggle.props['aria-checked'], true, 'switch reads as on');
  assert.equal(toggle.props['data-on'], '1', 'switch drawn on');

  // picking an accent switches the family to it
  swatches.props.children[6].props.onClick();
  assert.equal(app.preference, 'amoled-violet', 'accent pick switches the theme');
  assert.equal(app.storage.get('dsh-amoled:color'), 'violet', 'accent persisted');
  const picked = render(seat.component, props);
  assert.match(picked.props.children[0].props.children[1].props.children, /фиолетовая/);
  assert.equal(picked.props.children[1].props.children[6].props['data-on'], '1', 'new accent marked');

  // the switch turns the family off and back on with the same accent
  picked.props.children[2].props.onClick();
  assert.equal(app.preference, 'dark', 'switch falls back to the dark theme');
  assert.equal(app.storage.get('dsh-amoled:enabled'), '0', 'switch persisted');
  const off = render(seat.component, props);
  assert.equal(off.props.children[2].props['aria-checked'], false, 'switch reads as off');
  assert.match(off.props.children[0].props.children[1].props.children, /^Выключена/);
  off.props.children[2].props.onClick();
  assert.equal(app.preference, 'amoled-violet', 'switch restores the chosen accent');
  assert.equal(app.storage.get('dsh-amoled:enabled'), '1', 're-enable persisted');

  // the shipped Appearance control is authoritative
  app.externalTheme('light');
  assert.equal(app.storage.get('dsh-amoled:enabled'), '0', 'external switch-off persisted');
  const after = render(seat.component, props);
  assert.match(after.props.children[0].props.children[1].props.children, /^Выключена/);
  assert.equal(after.props.children[1].props.children[6].props['data-on'], '0', 'no accent marked while off');
}

// --- balance readout --------------------------------------------------------
{
  const app = mount();
  const props = app.registrations[0].options.inject();
  const cooling = render(app.registrations[0].component, { wide: true, ...props });
  assert.equal(cooling.type, 'button', 'balance renders a button');
  assert.equal(cooling.props['data-state'], 'loading', 'loading first');
  assert.equal(fetched[0], 'amoled-proxyapi/balance', 'relative Host route');

  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
  const loaded = render(app.registrations[0].component, { wide: true, ...props });
  assert.equal(loaded.props['data-state'], 'ok', 'balance resolved');
  const text = loaded.props.children[1].props.children;
  assert.match(text, /1\s?234,56/, `formatted balance (${text})`);
  assert.match(loaded.props.title, /console\.proxyapi\.ru\/usage/, 'tooltip points at usage');

  loaded.props.onClick();
  assert.deepEqual(opened, [usageUrl], 'click opens the usage page');

  const rail = render(app.registrations[0].component, { wide: false, ...props });
  assert.equal(rail.props.children[1], null, 'collapsed rail drops the number');
}

console.log(
  `ok: ${themes.length} themes x ${names.length} tokens (${accents.map((accent) => accent.id).join(', ')}), seats ${balanceSeat.options.id} + ${settingsSeat.options.id}`,
);
// The plugin's poll interval is real (the browser owns it); end the harness.
process.exit(0);
