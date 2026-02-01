# Firebase Hosting Deployment Guide

This guide will help you deploy your JetLag Hide and Seek PWA to Firebase Hosting.

## Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. Logged into Firebase: `firebase login`
3. Firebase project initialized: `firebase init` (if not already done)

## Step 1: Set Environment Variables in Firebase

Since Firebase Hosting serves static files, you need to set your environment variables in the build process. You have two options:

### Option A: Build with Environment Variables (Recommended)

1. Create a `.env.production` file in your project root:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
   ```

2. Build the app: `npm run build`
3. Deploy: `npm run deploy`

### Option B: Use Firebase Hosting Environment Variables (Firebase CLI 11.0+)

1. Set environment variables in Firebase:
   ```bash
   firebase hosting:channel:deploy preview --only hosting
   ```

2. Or use Firebase Console:
   - Go to Firebase Console → Hosting → Settings
   - Add environment variables there

## Step 2: Build the App

```bash
npm run build
```

This will:
- Create a static export in the `out` directory
- Generate PWA service worker files
- Optimize all assets

## Step 3: Deploy to Firebase Hosting

### Deploy Only Hosting:
```bash
npm run deploy
```

Or manually:
```bash
firebase deploy --only hosting
```

### Deploy Everything (Hosting + Firestore Rules):
```bash
npm run deploy:all
```

Or manually:
```bash
firebase deploy
```

## Step 4: Verify Deployment

1. After deployment, Firebase will provide you with a URL like:
   `https://your-project-id.web.app`

2. Visit the URL and test:
   - Create a game
   - Join a game
   - Test the map functionality
   - Verify PWA installation

## Step 5: Set Custom Domain (Optional)

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the instructions to verify your domain
4. Update your DNS records as instructed

## Troubleshooting

### Build Errors

If you get build errors:
- Make sure all environment variables are set
- Check that all dependencies are installed: `npm install`
- Verify Next.js version compatibility

### Environment Variables Not Working

- Make sure variables start with `NEXT_PUBLIC_` for client-side access
- Rebuild after changing environment variables
- Check browser console for undefined values

### PWA Not Working

- Verify `manifest.json` is in the `public` folder
- Check that service worker files are generated in `out` folder
- Ensure HTTPS is enabled (Firebase Hosting uses HTTPS by default)

### Map Not Loading

- Verify Mapbox token is set correctly
- Check browser console for Mapbox errors
- Ensure Mapbox token has correct permissions

## Continuous Deployment (Optional)

You can set up GitHub Actions or similar CI/CD:

1. Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to Firebase
   on:
     push:
       branches: [ main ]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - uses: actions/setup-node@v2
           with:
             node-version: '18'
         - run: npm install
         - run: npm run build
         - uses: FirebaseExtended/action-hosting-deploy@v0
           with:
             repoToken: '${{ secrets.GITHUB_TOKEN }}'
             firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
             channelId: live
             projectId: your-project-id
   ```

## Notes

- The app uses static export, so all routes are pre-rendered
- Dynamic routes like `/game/[id]` will work client-side
- Service worker will cache assets for offline use
- All Firebase client SDK features will work as expected
