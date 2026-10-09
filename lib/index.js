/**
 * Node half of the AMOLED / ProxyAPI plugin.
 *
 * The browser half cannot read the balance itself: the ProxyAPI balance call
 * needs the account's API key, and the key must not travel to the page. So this
 * half owns the network, and serves one small JSON endpoint the sidebar
 * readout polls:
 *
 *     GET /amoled-proxyapi/balance
 *
 * The route sits behind the connection trust fence like every shipped plugin
 * route, resolves the key per request through the credentials service (falling
 * back to the launch environment), and caches the answer so a 60-second poll
 * never becomes a 60-second upstream load. `GET /proxyapi/balance` answers
 * `{ balance }`, plus a `budget` block when the key carries its own budget.
 *
 * The plugin holds no configuration of its own; every knob is an environment
 * override so the composition stays declarative:
 *
 *     DSH_PROXYAPI_BASE_URL      default https://api.proxyapi.ru
 *     DSH_PROXYAPI_BALANCE_PATH  default /proxyapi/balance
 *     DSH_PROXYAPI_USAGE_URL     default https://console.proxyapi.ru/usage
 *     DSH_PROXYAPI_KEY_REF       default PROXYAPI_API_KEY
 *     DSH_PROXYAPI_OK_TTL_MS     default 20000 (successful answer cache)
 *     DSH_PROXYAPI_FAIL_TTL_MS   default 5000  (failure cache)
 *     DSH_PROXYAPI_TIMEOUT_MS    default 15000
 */

/** Cordis function-plugin name. */
export const name = 'amoled-proxyapi';

/** The route carrier and the connection trust fence. */
export const inject = ['webServer', 'connection'];

/** Route the browser half polls. */
const ROUTE_PATH = '/amoled-proxyapi/balance';

/**
 * Read one string setting: entry config first, then the environment, then the
 * built-in default. Blank values are treated as absent.
 * @param config - the loader entry's config object, when present.
 * @param key - config field name.
 * @param envName - environment override name.
 * @param fallback - built-in default.
 * @returns the resolved non-empty string.
 */
function setting(config, key, envName, fallback) {
  for (const candidate of [config?.[key], process.env[envName]]) {
    if (typeof candidate === 'string' && candidate.trim() !== '') return candidate.trim();
  }
  return fallback;
}

/**
 * Read one positive number setting, falling back on anything unusable.
 * @param config - the loader entry's config object, when present.
 * @param key - config field name.
 * @param envName - environment override name.
 * @param fallback - built-in default.
 * @returns the resolved number.
 */
function settingNumber(config, key, envName, fallback) {
  for (const candidate of [config?.[key], process.env[envName]]) {
    const value = typeof candidate === 'string' ? Number(candidate) : candidate;
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  }
  return fallback;
}

/** JSON response (no-store: a balance is a live fact, the cache lives here). */
function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(payload));
}

/**
 * Register the balance route.
 * @param ctx - host plugin context carrying `webServer` and `connection`.
 * @param config - optional loader entry config.
 */
export function apply(ctx, config = {}) {
  const settings = {
    baseUrl: setting(config, 'baseUrl', 'DSH_PROXYAPI_BASE_URL', 'https://api.proxyapi.ru').replace(/\/+$/, ''),
    balancePath: setting(config, 'balancePath', 'DSH_PROXYAPI_BALANCE_PATH', '/proxyapi/balance'),
    usageUrl: setting(config, 'usageUrl', 'DSH_PROXYAPI_USAGE_URL', 'https://console.proxyapi.ru/usage'),
    keyRef: setting(config, 'keyRef', 'DSH_PROXYAPI_KEY_REF', 'PROXYAPI_API_KEY'),
    okTtlMs: settingNumber(config, 'okTtlMs', 'DSH_PROXYAPI_OK_TTL_MS', 20000),
    failTtlMs: settingNumber(config, 'failTtlMs', 'DSH_PROXYAPI_FAIL_TTL_MS', 5000),
    timeoutMs: settingNumber(config, 'timeoutMs', 'DSH_PROXYAPI_TIMEOUT_MS', 15000),
  };

  /** Last answer: `{ at, ttlMs, payload }`. */
  let cached = null;
  /** In-flight read, so concurrent polls share one upstream call. */
  let inFlight = null;

  /**
   * Resolve the API key for one read. The credentials service is asked first
   * (that is where the Models page writes it); the launch environment is the
   * fallback for a plain `export PROXYAPI_API_KEY=…` setup.
   * @returns `{ value, source }`, or null when nothing is configured.
   */
  const readKey = async () => {
    const credentials = ctx.get('credentials');
    if (credentials !== undefined) {
      try {
        const hit = await credentials.resolve(settings.keyRef);
        if (hit !== undefined && typeof hit.value === 'string' && hit.value !== '') {
          return { value: hit.value, source: hit.source ?? 'credentials' };
        }
      } catch (error) {
        console.warn('[amoled-proxyapi] credentials lookup failed', error);
      }
    }
    const fromEnv = process.env[settings.keyRef];
    if (typeof fromEnv === 'string' && fromEnv !== '') return { value: fromEnv, source: 'env' };
    return null;
  };

  /**
   * One upstream read, normalised into the payload the page consumes.
   * @returns the JSON payload (never throws).
   */
  const readBalance = async () => {
    const key = await readKey();
    if (key === null) {
      return {
        ok: false,
        code: 'no-key',
        status: 0,
        message: `${settings.keyRef} не найден: добавьте ключ в настройках моделей или в окружении`,
        usageUrl: settings.usageUrl,
      };
    }

    let response;
    try {
      response = await fetch(`${settings.baseUrl}${settings.balancePath}`, {
        method: 'GET',
        headers: { authorization: `Bearer ${key.value}`, accept: 'application/json' },
        signal: AbortSignal.timeout(settings.timeoutMs),
      });
    } catch (error) {
      return {
        ok: false,
        code: 'network',
        status: 0,
        message: error instanceof Error ? error.message : String(error),
        usageUrl: settings.usageUrl,
      };
    }

    const text = await response.text().catch(() => '');
    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        code: 'forbidden',
        status: response.status,
        message:
          response.status === 403
            ? 'ключу не разрешён запрос баланса'
            : 'ключ отклонён (401): проверьте значение ключа',
        hint: 'Включите разрешение «Запрос баланса» в настройках ключа: https://console.proxyapi.ru/keys',
        usageUrl: settings.usageUrl,
      };
    }
    if (!response.ok) {
      return {
        ok: false,
        code: 'http',
        status: response.status,
        message: text.slice(0, 300) || `HTTP ${response.status}`,
        usageUrl: settings.usageUrl,
      };
    }

    let body;
    try {
      body = JSON.parse(text);
    } catch {
      return {
        ok: false,
        code: 'bad-payload',
        status: response.status,
        message: 'ответ ProxyAPI не является JSON',
        usageUrl: settings.usageUrl,
      };
    }
    const balance = typeof body?.balance === 'number' ? body.balance : Number(body?.balance);
    if (!Number.isFinite(balance)) {
      return {
        ok: false,
        code: 'bad-payload',
        status: response.status,
        message: 'в ответе ProxyAPI нет числового поля balance',
        usageUrl: settings.usageUrl,
      };
    }
    const budget = body?.budget;
    return {
      ok: true,
      balance,
      budget:
        budget !== null && typeof budget === 'object'
          ? {
              limit: typeof budget.limit === 'number' ? budget.limit : null,
              used: typeof budget.used === 'number' ? budget.used : null,
            }
          : null,
      currency: 'RUB',
      source: key.source,
      updatedAt: new Date().toISOString(),
      usageUrl: settings.usageUrl,
    };
  };

  /**
   * Cached read: a fresh answer is served as-is, an expired one triggers one
   * shared refresh, and failures are cached briefly so a rejected key does not
   * hammer ProxyAPI.
   * @returns the payload, plus `cached: true` when it came from the cache.
   */
  const load = async () => {
    const now = Date.now();
    if (cached !== null && now - cached.at < cached.ttlMs) return { ...cached.payload, cached: true };
    if (inFlight === null) {
      inFlight = readBalance()
        .then((payload) => {
          cached = {
            at: Date.now(),
            ttlMs: payload.ok === true ? settings.okTtlMs : settings.failTtlMs,
            payload,
          };
          return payload;
        })
        .finally(() => {
          inFlight = null;
        });
    }
    return inFlight;
  };

  /** Answer an untrusted/unauthenticated request; true when it was rejected. */
  const rejected = (req, res) => {
    const rejection = ctx.connection.requestRejection(req);
    if (rejection === undefined) return false;
    res.statusCode = rejection;
    res.end();
    return true;
  };

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'exact',
        path: ROUTE_PATH,
        handler: async (req, res) => {
          if (rejected(req, res)) return;
          if (req.method !== 'GET') {
            res.statusCode = 405;
            res.setHeader('allow', 'GET');
            res.end();
            return;
          }
          let payload;
          try {
            payload = await load();
          } catch (error) {
            payload = {
              ok: false,
              code: 'internal',
              status: 500,
              message: error instanceof Error ? error.message : String(error),
              usageUrl: settings.usageUrl,
            };
          }
          sendJson(res, 200, payload);
        },
      }),
    `amoled-proxyapi: GET ${ROUTE_PATH}`,
  );
}
