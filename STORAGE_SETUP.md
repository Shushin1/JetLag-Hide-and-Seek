# Firebase Storage Setup Instructions

## Enable Firebase Storage

1. Go to the Firebase Console: https://console.firebase.google.com/project/buc-n-seek/storage
2. Click **"Get Started"** to enable Firebase Storage
3. Choose a location (preferably the same as your Firestore location: `eur3`)
4. Start in **test mode** (we'll deploy rules after)

## Deploy Storage Rules

After enabling Storage, run:
```bash
firebase deploy --only storage
```

This will deploy the security rules from `storage.rules` that allow read/write access to game photos.

## Verify Storage is Working

1. Try uploading a photo in the app
2. Check the browser console for any errors
3. Check Firebase Console > Storage to see if files are being uploaded

## Troubleshooting

- **"Storage is not initialized"**: Make sure `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` is set in `.env.local`
- **Upload fails**: Check that Storage rules are deployed and allow access
- **Photos don't appear**: Check that the `photoUrl` is being saved correctly in Firestore
