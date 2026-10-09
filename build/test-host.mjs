/**
 * Harness for the Host half: mount the route against a fake web carrier and
 * assert the contract the page depends on — trust fence first, GET only, the
 * key resolved per read, ProxyAPI's 403/401 answered as a teachable payload,
 * the balance and key-budget shapes passed through, and the answer cached.
 *
 * usage: node build/test-host.mjs
 */
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { apply, inject, name } = await import(new URL(`file://${join(root, 'lib', 'index.js')}`).href);

assert.equal(name, 'amoled-proxyapi', 'plugin name');
assert.deepEqual(inject, ['webServer', 'connection'], 'host service inject list');

/** Fake server response capturing everything the handler wrote. */
function fakeRes() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    ended: false,
    setHeader(k, v) {
      this.headers[k] = v;
    },
    end(body) {
      this.ended = true;
      if (typeof body === 'string') this.body = body;
    },
  };
}

/**
 * Mount the plugin against a fake carrier.
 * @param options - `{ fetch, credentials, rejection, env }` overrides.
 * @returns `{ request(method), calls, route }`.
 */
function mount(options = {}) {
  const calls = [];
  const routes = [];
  const previousFetch = globalThis.fetch;
  const previousKey = process.env.PROXYAPI_API_KEY;
  if (options.env === undefined) delete process.env.PROXYAPI_API_KEY;
  else process.env.PROXYAPI_API_KEY = options.env;

  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    if (typeof options.fetch === 'function') return options.fetch(url, init);
    throw new Error('unexpected fetch');
  };

  const ctx = {
    webServer: {
      register: (route) => {
        routes.push(route);
        return () => {};
      },
    },
    connection: {
      requestRejection: () => options.rejection,
    },
    get: (service) => (service === 'credentials' ? options.credentials : undefined),
    effect: (callback) => callback() ?? (() => {}),
  };

  apply(ctx, options.config);

  const restore = () => {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.PROXYAPI_API_KEY;
    else process.env.PROXYAPI_API_KEY = previousKey;
  };

  return {
    calls,
    route: routes[0],
    restore,
    async request(method = 'GET') {
      const res = fakeRes();
      await routes[0].handler({ method, url: routes[0].path, headers: {} }, res);
      return { res, payload: res.body === '' ? null : JSON.parse(res.body) };
    },
  };
}

const okResponse = (body, status = 200) => ({
  status,
  ok: status >= 200 && status < 300,
  text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
});

// --- route shape ------------------------------------------------------------
{
  const plugin = mount({ env: 'sk-test' });
  assert.equal(plugin.route.kind, 'exact', 'exact route');
  assert.equal(plugin.route.path, '/amoled-proxyapi/balance', 'route path');
  plugin.restore();
}

// --- the trust fence answers before anything else ---------------------------
{
  const plugin = mount({ env: 'sk-test', rejection: 401 });
  const { res, payload } = await plugin.request();
  assert.equal(res.statusCode, 401, 'fence status');
  assert.equal(payload, null, 'fence writes no body');
  assert.equal(plugin.calls.length, 0, 'fence short-circuits the upstream read');
  plugin.restore();
}

// --- only GET ---------------------------------------------------------------
{
  const plugin = mount({ env: 'sk-test' });
  const { res } = await plugin.request('POST');
  assert.equal(res.statusCode, 405, 'method not allowed');
  assert.equal(res.headers.allow, 'GET', 'allow header');
  assert.equal(plugin.calls.length, 0, 'no upstream read');
  plugin.restore();
}

// --- nothing configured -----------------------------------------------------
{
  const plugin = mount({});
  const { payload } = await plugin.request();
  assert.equal(payload.ok, false, 'not ok');
  assert.equal(payload.code, 'no-key', 'no-key code');
  assert.match(payload.message, /PROXYAPI_API_KEY/, 'names the missing reference');
  assert.equal(plugin.calls.length, 0, 'no upstream read without a key');
  plugin.restore();
}

// --- credentials win over the environment ----------------------------------
{
  const plugin = mount({
    env: 'sk-from-env',
    credentials: { resolve: async (ref) => ({ value: 'sk-from-store', source: `store:${ref}` }) },
    fetch: async () => okResponse({ balance: 10 }),
  });
  const { payload } = await plugin.request();
  assert.equal(payload.ok, true, 'ok');
  assert.equal(payload.balance, 10, 'balance passed through');
  assert.equal(payload.source, 'store:PROXYAPI_API_KEY', 'credential source reported');
  assert.equal(plugin.calls[0].init.headers.authorization, 'Bearer sk-from-store', 'stored key used');
  assert.equal(plugin.calls[0].url, 'https://api.proxyapi.ru/proxyapi/balance', 'upstream url');
  plugin.restore();
}

// --- the real-world 403: permission not granted for this key ----------------
{
  const plugin = mount({
    credentials: { resolve: async () => ({ value: 'sk-test', source: 'store' }) },
    fetch: async () => okResponse({ message: 'forbidden' }, 403),
  });
  const { res, payload } = await plugin.request();
  assert.equal(res.statusCode, 200, 'the page always gets a JSON answer');
  assert.equal(payload.ok, false, 'not ok');
  assert.equal(payload.code, 'forbidden', 'forbidden code');
  assert.match(payload.hint, /console\.proxyapi\.ru\/keys/, 'teaches where to grant it');
  assert.equal(payload.usageUrl, 'https://console.proxyapi.ru/usage', 'usage url carried');
  plugin.restore();
}

// --- 401, a key budget, and the success cache -------------------------------
{
  let responses = 0;
  const plugin = mount({
    credentials: { resolve: async () => ({ value: 'sk-test', source: 'store' }) },
    fetch: async () => {
      responses += 1;
      return okResponse({ balance: 37.66, budget: { limit: 50, used: 12.34 } });
    },
  });
  const first = await plugin.request();
  assert.equal(first.payload.ok, true, 'ok');
  assert.deepEqual(first.payload.budget, { limit: 50, used: 12.34 }, 'key budget passed through');
  assert.equal(first.payload.currency, 'RUB', 'roubles');
  const second = await plugin.request();
  assert.equal(second.payload.cached, true, 'second read served from the cache');
  assert.equal(responses, 1, 'one upstream read for two polls');
  plugin.restore();
}

// --- concurrent polls share one upstream read -------------------------------
{
  let responses = 0;
  const plugin = mount({
    credentials: { resolve: async () => ({ value: 'sk-test', source: 'store' }) },
    fetch: async () => {
      responses += 1;
      await new Promise((resolve) => setImmediate(resolve));
      return okResponse({ balance: 1 });
    },
  });
  const [a, b] = await Promise.all([plugin.request(), plugin.request()]);
  assert.equal(a.payload.balance, 1, 'first caller answered');
  assert.equal(b.payload.balance, 1, 'second caller answered');
  assert.equal(responses, 1, 'one in-flight read');
  plugin.restore();
}

// --- upstream failures stay readable ---------------------------------------
for (const [label, fetcher, code] of [
  ['401', async () => okResponse({ message: 'unauthorized' }, 401), 'forbidden'],
  ['500', async () => okResponse('upstream exploded', 500), 'http'],
  ['non-JSON', async () => okResponse('<html>', 200), 'bad-payload'],
  ['no balance field', async () => okResponse({ ok: true }, 200), 'bad-payload'],
  ['network', async () => { throw new Error('ENOTFOUND api.proxyapi.ru'); }, 'network'],
]) {
  const plugin = mount({
    credentials: { resolve: async () => ({ value: 'sk-test', source: 'store' }) },
    fetch: fetcher,
  });
  const { res, payload } = await plugin.request();
  assert.equal(res.statusCode, 200, `${label}: page still gets JSON`);
  assert.equal(payload.ok, false, `${label}: not ok`);
  assert.equal(payload.code, code, `${label}: code`);
  assert.equal(typeof payload.message, 'string', `${label}: message`);
  assert.ok(payload.message.length > 0, `${label}: message not empty`);
  plugin.restore();
}

// --- environment overrides --------------------------------------------------
{
  process.env.DSH_PROXYAPI_USAGE_URL = 'https://example.test/usage';
  process.env.DSH_PROXYAPI_BALANCE_PATH = '/custom/balance';
  const plugin = mount({
    env: 'sk-test',
    fetch: async () => okResponse({ balance: 5 }),
  });
  const { payload } = await plugin.request();
  assert.equal(plugin.calls[0].url, 'https://api.proxyapi.ru/custom/balance', 'path override');
  assert.equal(payload.usageUrl, 'https://example.test/usage', 'usage override');
  delete process.env.DSH_PROXYAPI_USAGE_URL;
  delete process.env.DSH_PROXYAPI_BALANCE_PATH;
  plugin.restore();
}

console.log('ok: host route contract, key resolution, error mapping, caching');
