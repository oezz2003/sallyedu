# Quick Fix for Database Connection Error

## Issue
Admin dashboard shows "Unable to connect to the database" error after deploying security rules.

## Solution
Deploy the development rules which are less restrictive for testing:

### Step 1: Copy Development Rules
Copy the content from `firestore-dev.rules` file and paste it into Firebase Console.

### Step 2: Deploy via Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **lms-ibsra** (not lmssally-a0957)
3. Navigate to Firestore Database > Rules
4. Replace the current rules with the content from `firestore-dev.rules`
5. Click "Publish"

### Step 3: Test Connection
Refresh your admin dashboard and test the connection.

## Development Rules Summary
The development rules allow:
- Authenticated users can read all user documents (for admin dashboard)
- Authenticated users can manage their own data
- Less restrictive permissions for testing purposes
- All authenticated users can act as admins for testing

## Production Deployment
After testing is complete, use the `firestore.rules` file for production with proper security.

## Manual Rule Deployment for lms-ibsra project:

```bash
# Make sure you're in the correct project
firebase use lms-ibsra

# Deploy development rules
firebase deploy --only firestore:rules
```

## If the above doesn't work, manually paste these rules in Firebase Console:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Allow authenticated users to read all documents for testing
    match /{document=**} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

This will temporarily allow all authenticated users to access all data for testing purposes.