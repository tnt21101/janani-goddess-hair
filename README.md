# JANANI Founding List Landing Page

Static React 18 UMD landing page for the JANANI Founding List. The page is built without a frontend build-time dependency and uses Netlify Forms by default, with an optional Kit form integration.

## Build and preview

```sh
npm run build
python3 -m http.server 8000 --directory dist/public
```

Open `http://localhost:8000` to preview the generated site.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Netlify deployment settings are in `netlify.toml`. The form submission and anonymous post-signup feedback flows require a Netlify deployment to store responses.
