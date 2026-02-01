# Firebase Setup Guide

This guide will help you set up your Firebase project for the JetLag Hide and Seek PWA.

## Step 1: Firebase Console Setup

### 1.1 Enable Firestore Database
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** in the left sidebar
4. Click **Create database**
5. Choose **Start in test mode** (for development) or set up custom rules
6. Select a location for your database

### 1.2 Enable Authentication
1. Navigate to **Authentication** in the left sidebar
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Anonymous** authentication:
   - Click on **Anonymous**
   - Toggle **Enable**
   - Click **Save**

### 1.3 Get Your Firebase Config
1. Click the gear icon ⚙️ next to **Project Overview**
2. Select **Project settings**
3. Scroll down to **Your apps** section
4. If you don't have a web app, click **Add app** → **Web** (</> icon)
5. Copy the config values and add them to your `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Step 2: Deploy Firestore Security Rules

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init firestore
   ```
   - Select your Firebase project
   - Use the existing `firestore.rules` file
   - Use the existing `firestore.indexes.json` file

4. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   ```

## Step 3: Seed Initial Data

You have two options to seed data:

### Option A: Using the Admin Page (Easiest)
1. Start your Next.js dev server: `npm run dev`
2. Navigate to `http://localhost:3000/admin/seed`
3. Click **Seed All Collections**
4. Verify the data in Firebase Console → Firestore Database

### Option B: Using Firebase Admin SDK
1. Install Firebase Admin SDK:
   ```bash
   npm install firebase-admin
   ```

2. Download your service account key:
   - Firebase Console → Project Settings → Service Accounts
   - Click **Generate new private key**
   - Save it as `serviceAccountKey.json` in your project root

3. Set environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
   ```

4. Uncomment the initialization code in `scripts/seed-deck.js` and `scripts/seed-questions.js`

5. Run the scripts:
   ```bash
   node scripts/seed-deck.js
   node scripts/seed-questions.js
   ```

## Step 4: Verify Setup

1. Check Firestore Database has these collections:
   - `deck` (should have cards)
   - `questions` (should have questions)
   - `games` (will be created automatically)

2. Test authentication:
   - The app uses anonymous authentication
   - It should work automatically when you run the app

## Step 5: Mapbox Setup

1. Go to [Mapbox](https://account.mapbox.com/)
2. Sign up or log in
3. Go to **Access tokens**
4. Copy your default public token or create a new one
5. Add it to `.env.local`:
   ```env
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
   ```

## Troubleshooting

### "Permission denied" errors
- Make sure Firestore security rules are deployed
- Check that Anonymous authentication is enabled
- Verify your `.env.local` file has correct values

### "Collection not found" errors
- Make sure you've seeded the `deck` and `questions` collections
- Use the admin seed page at `/admin/seed`

### Map not loading
- Verify your Mapbox token is correct
- Check browser console for errors
- Make sure `NEXT_PUBLIC_MAPBOX_TOKEN` is set in `.env.local`

## Security Rules Explanation

The current rules allow:
- **Games**: Any authenticated user can read/write (for development)
- **Deck**: Read-only for authenticated users
- **Questions**: Read-only for authenticated users

For production, you may want to restrict game writes to only game participants.
