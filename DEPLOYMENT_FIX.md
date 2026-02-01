# Fixing 404 Errors on Firebase Hosting

If you're getting 404 errors when navigating to game routes, follow these steps:

## 1. Rebuild the app
```bash
npm run build
```

## 2. Redeploy to Firebase
```bash
npm run deploy
```

## 3. Clear browser cache
After deployment, clear your browser cache or use incognito mode to test.

## 4. Verify the build output
Make sure the `out` directory contains:
- `index.html`
- `game/index.html`
- All JavaScript chunks in the `_next/static` folder

## 5. Check Firebase Hosting logs
In Firebase Console → Hosting → Logs, check for any routing errors.

## Common Issues:

### Issue: "Unexpected token 'export'" error
This means a JavaScript chunk file is missing or being served incorrectly.

**Solution:**
1. Make sure all files in `out/_next/static` are deployed
2. Check that `firebase.json` doesn't ignore `_next` folder
3. Verify the base path is correct

### Issue: 404 on `/game/[id]` routes
The rewrite rule should catch all `/game/**` routes and serve `/game/index.html`.

**Solution:**
The current `firebase.json` has:
```json
{
  "source": "/game/**",
  "destination": "/game/index.html"
}
```

This should work. If not, try:
```json
{
  "source": "/game/**",
  "destination": "/game/"
}
```

## Testing Locally

Before deploying, test the build locally:
```bash
npm run build
npx serve out
```

Then visit `http://localhost:3000/game/test123` to see if routing works.
