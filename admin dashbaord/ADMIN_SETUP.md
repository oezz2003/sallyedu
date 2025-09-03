# Admin SDK Setup Instructions

## 1. Environment Variables

Create a `.env` file in your project root with your Firebase Admin SDK credentials:

```bash
FIREBASE_PROJECT_ID=lmssally-a0957
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@lmssally-a0957.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**⚠️ IMPORTANT:** 
- Replace `YOUR_ACTUAL_PRIVATE_KEY_HERE` with your real private key
- Make sure to escape newlines with `\n`
- **NEVER commit this file to git**

## 2. Deploy Firestore Rules

Copy the contents of `firestore.rules` to your Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project `lmssally-a0957`
3. Go to Firestore Database → Rules
4. Replace the rules with the contents of `firestore.rules`
5. Click "Publish"

## 3. Set Up Your First Admin User

After creating your `.env` file, run:

```bash
node scripts/setup-admin.js your-email@example.com
```

This will:
- Find your user by email
- Set custom claims `{ role: 'admin' }`
- Update your Firestore document

## 4. Test the System

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `/login` and sign in with your admin account

3. Try creating a user from the Students page

## Security Features

✅ **Client-side protection removed**: No more direct Firestore writes for privileged operations
✅ **Admin SDK endpoints**: All user management goes through secure server routes
✅ **Token verification**: Each admin request verifies the caller's ID token
✅ **Role-based access**: Only users with `admin` or `editor` role can access admin functions
✅ **Firestore rules**: Server-side rules prevent unauthorized client access

## API Endpoints

- `POST /api/admin/create-user` - Create new user (requires admin token)
- `POST /api/admin/update-role` - Update user role (requires admin token)  
- `POST /api/admin/delete-user` - Delete user (requires admin token)

## Troubleshooting

**"Permission denied" errors:**
- Check your `.env` file has correct credentials
- Ensure Firestore rules are deployed
- Verify your user has admin role (run setup script)

**"Module not found" errors:**
- Run `npm install` to install dependencies
- Check `firebase-admin` is installed

**Token verification fails:**
- Make sure you're signed in
- Check your user has admin role in Firestore
- Verify custom claims are set correctly
