# NH Civic Commons Vote Tracker

A framework-agnostic Lit web component plus a Cloudflare Worker lookup route. Styles are isolated by Shadow DOM, and the browser calls NH Civic Commons—not Google—so the Civic Information API key stays secret.

## Develop

```sh
npm install
npm run dev
npm run check
npm test
npm run build
```

For local Worker development, create an uncommitted `.dev.vars` file containing `CIVIC_API_KEY`, build the widget, then run `npm run dev:worker`. Production may bind `CIVIC_API_KEY` from Cloudflare Secrets Store; the Worker supports both binding forms.

## Embed

```html
<nhcc-vote-tracker
  title="See how your NH representatives voted">
</nhcc-vote-tracker>
<script async src="https://api.nhciviccommons.com/widgets/vote-tracker.js"></script>
```

The API defaults to `https://api.nhciviccommons.com`, and the widget defaults to the NH Civic Commons published bill tracker. Partners can override the tracker with a public Google Sheets CSV URL using the optional `sheet` attribute. Use `api-base` only for local or staging environments.

## Existing API integration

Copy `worker/` into the existing NH Civic Commons API Worker or merge its three routes:

- `POST /widgets/vote-tracker/lookup`
- `GET /widgets/vote-tracker/demo`
- static `/widgets/vote-tracker.js`

Bind the Secrets Store secret named `SECRET_CIVIC_API_KEY` to the Worker variable `CIVIC_API_KEY`. Alternatively, a per-Worker secret can be set with `npx wrangler secret put CIVIC_API_KEY`. The `DB` binding expects existing `representatives` and `roll_call_votes` tables; align the two queries in `worker/repository.ts` with the production schema and add the production D1 binding to `wrangler.jsonc`. Without `DB`, Civic matching and tracker parsing work, but the response intentionally contains empty representative groups.
