# V2 component kit

The visual fixture is [`web/v2-kit.html`](../../web/v2-kit.html). It is intentionally outside the app nav and uses `html.v2` plus `data-fx="full|lite|solid"`.

## Tokens and type

```html
<p class="v2-eyebrow">WEEK 3 · DAY 2</p>
<div class="v2-hero">PUSH <span class="v2-accent">day</span></div>
<div class="v2-numeral">04</div>
```

## Glass navigation and mini-session

```html
<nav class="v2-nav v2-glass"><button class="v2-tab" aria-current="page">Today</button></nav>
<div class="v2-mini v2-glass">…</div>
```

## Cards, rows, settings, and controls

```html
<div class="v2-row-cards"><article class="v2-card">…</article></div>
<div class="v2-group"><button class="v2-setting">…</button></div>
<label class="v2-switch"><input type="checkbox"><i></i></label>
<div class="v2-segment"><button aria-pressed="true">Auto</button></div>
<label class="v2-search"><input type="search" aria-label="Search settings"></label>
```

## Actions and sheet

```html
<button class="v2-button">Start workout</button>
<button class="v2-button v2-button--secondary">Preview</button>
<section class="v2-sheet v2-glass">…</section>
```

All components use `--v2-*`, the shared radius/spacing/motion tokens, semantic native controls, and `html.v2` scope.
