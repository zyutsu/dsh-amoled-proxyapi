# dsh-amoled-proxyapi

A family of AMOLED (pure-black) themes for the DeepSeek Harness web GUI — one
per accent colour — plus a ProxyAPI balance readout in the sidebar foot that
opens the usage page.

```
sidebar foot  ● 1 234,56 ₽      ← click → console.proxyapi.ru/usage
              ⚙ Settings
```

## Install

This package is a DSH bundle: `package.json` declares `dsh.bundle.patch`, so a
profile installs it as a single Loader entry, and `dsh.client` marks the browser
half the Host serves to the page. `lib/` is committed, so a checkout works
without a build step.

Install it into a profile through that profile's plugin manager, handing it
either the package path or the repository spec:

```
github:zyutsu/dsh-amoled-proxyapi
```

By hand: clone the repository into `<DSH_HOME>/profiles/<profile>/plugins/` and
add the entry from [`cordis.patch.yml`](./cordis.patch.yml) to the profile's own
`cordis.patch.yml`.

Requires DSH ≥ `0.2.0-rc.0` and Node ≥ 20.

## What it installs

| Contribution | Where | Package half |
| --- | --- | --- |
| `amoled-*` theme family (dark scheme, 158 alias tokens each) | `ctx.theme.register` | browser |
| `AMOLED тема` row: accent swatches + switch | Settings → General, last row | browser |
| Balance pill | `sidebar.footer.action` (above Settings) | browser |
| `GET /amoled-proxyapi/balance` | Host HTTP route | Node |

The two halves ship in one package: `lib/index.js` is the Loader entry (the
node half), and `dsh.client` in `package.json` marks `lib/client.js` as the
browser half the Host serves to the page.

## The theme family

Eight themes share one audited black geometry, one hue apart:

| Id | Accent | Text on the accent |
| --- | --- | --- |
| `amoled-red` | `#ff2d3f` | white |
| `amoled-orange` | `#ff7a1a` | near-black |
| `amoled-amber` | `#ffc02e` | near-black |
| `amoled-green` | `#2fd36b` | near-black |
| `amoled-teal` | `#17d1c0` | near-black |
| `amoled-blue` | `#3b82f6` | white |
| `amoled-violet` | `#a06bff` | white |
| `amoled-magenta` | `#ff4d94` | white |

A third-party theme is an alias-token override set. `ctx.theme.register({ id,
colorScheme: 'dark', tokens })` publishes it; ui-layout's ThemePresenter writes
every entry as an inline custom property on `<body>`, and inline properties beat
the token stylesheets. So the palette works in two layers:

* **`src/palette.js` → `AMOLED_STATIC`** re-points the raw scales the shipped
  dark palette is computed from: the bluish neutral scale becomes near-blacks
  (`#000000` canvas, `#0a0507` … `#2f2429` surfaces) and the "deepseek blue"
  accent scale takes the theme's own hue.
* **`AMOLED_ALIAS`** pins the decisions that must be absolute — pure black
  canvas and sidebar, hairline borders, brand/primary buttons, label scale,
  black masks, code tokens, onboarding gradients.

That template is hand-reviewed once, in red. The other seven themes are
generated from it by `createTokens()`: each literal colour in the template is
rotated onto the accent's chroma vector, so **lightness and alpha are preserved
token by token** and only the hue moves — the blue theme has exactly the red
theme's contrast, one hue over. Two small sets are pinned instead of rotated:

* `ACCENT_PINS` — brand, active-nav accent, onboarding accent and the accent
  rung of both scales are the accent exactly, so the swatch never lies.
* `SEMANTIC_KEEP` — the error reds. A red error must not turn blue because the
  theme is blue. Green and amber state tokens are not in the template at all and
  keep the shipped values in every theme for the same reason.

`--dsw-alias-label-primary-foreground` is the per-accent `onAccent` colour, so
bright accents (amber, green, teal) get dark text on their primary button.

Because a third-party theme id is an in-process preference that the durable
settings schema does not carry, the plugin re-applies the stored accent on every
load, driven by `localStorage["dsh-amoled:enabled"]` (on by default) and
`localStorage["dsh-amoled:color"]` (the accent id). The Settings row and the
shipped Appearance control stay in sync through `theme/change`: picking
light/dark/system there switches the family off, and the row writes the same
preference back. Picking an accent always switches the family on. The
pre-family key `dsh-amoled-red:enabled` is still honoured.

## The balance readout

The browser cannot read the balance — the call needs the account API key, and
the key must not reach the page. So the node half owns the network:

```
GET /amoled-proxyapi/balance          (Host, behind the connection trust fence)
  → ProxyAPI GET https://api.proxyapi.ru/proxyapi/balance
      Authorization: Bearer <key>
```

The key is resolved per read through the credentials service
(`PROXYAPI_API_KEY` by default, the same reference the ProxyAPI model provider
uses), falling back to the launch environment. Answers are cached in memory
(20 s on success, 5 s on failure) and concurrent polls share one upstream read.

The route always answers HTTP 200 with a JSON envelope, so the pill can explain
rather than just fail:

```json
{"ok":true,"balance":1234.56,"budget":{"limit":50,"used":12.34},
 "currency":"RUB","source":"credentials","updatedAt":"…",
 "usageUrl":"https://console.proxyapi.ru/usage"}
```

```json
{"ok":false,"code":"forbidden","status":403,
 "message":"ключу не разрешён запрос баланса",
 "hint":"Включите разрешение «Запрос баланса» в настройках ключа: https://console.proxyapi.ru/keys"}
```

`code` is one of `no-key`, `forbidden`, `network`, `http`, `bad-payload`,
`internal`. **`forbidden` is the common one:** ProxyAPI refuses
`GET /proxyapi/balance` with 403 until the key itself carries the
«Запрос баланса» permission — enable it at
<https://console.proxyapi.ru/keys>. A pill reading «нет доступа» with a red dot
means exactly that, and its tooltip links to the page that fixes it.

Clicking the pill opens the usage page in the built-in browser panel when that
tab type is registered, otherwise in a new browser tab.

## Configuration

No plugin settings; every knob is an environment override, so a composition
stays declarative:

| Variable | Default |
| --- | --- |
| `DSH_PROXYAPI_BASE_URL` | `https://api.proxyapi.ru` |
| `DSH_PROXYAPI_BALANCE_PATH` | `/proxyapi/balance` |
| `DSH_PROXYAPI_USAGE_URL` | `https://console.proxyapi.ru/usage` |
| `DSH_PROXYAPI_KEY_REF` | `PROXYAPI_API_KEY` |
| `DSH_PROXYAPI_OK_TTL_MS` | `20000` |
| `DSH_PROXYAPI_FAIL_TTL_MS` | `5000` |
| `DSH_PROXYAPI_TIMEOUT_MS` | `15000` |

The same names are accepted as entry config (`config.baseUrl`, `config.usageUrl`,
…), which take precedence over the environment.

## Development

```sh
node build/build-client.mjs   # src/*.js -> lib/client.js (one lazy-CJS factory)
node build/test-host.mjs      # route contract against a fake carrier + fetch
node build/test-client.mjs    # bundle against a fake loader, React, DOM, theme
```

`src/client.js` and `src/palette.js` are plain scripts with no imports, so the
bundle keeps exactly one external: `react`. The bundle's registered module id is
the package name — the boot-graph row the Host waits for.
