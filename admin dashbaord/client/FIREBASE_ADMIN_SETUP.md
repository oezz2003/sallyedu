# Firebase Client SDK Setup for Development

## Overview
This setup allows you to use Firebase Client SDK directly in the client-side code for development purposes. **This is for development only - never use this in production!**

## How It Works

The Courses page now uses a Firebase Client SDK wrapper instead of server endpoints:

- **Direct Firestore Access**: No more API calls to `/api/admin/*` endpoints
- **Real-time Operations**: Direct database operations for CRUD functionality
- **Development Only**: This approach bypasses server-side authentication and security rules
- **No WebAssembly Issues**: Uses the standard Firebase client SDK that's compatible with Vite

## Setup Steps

### 1. No Additional Installation Required
The Firebase Client SDK is already installed in your project, so no additional packages are needed.

### 2. How It Works
The `client/lib/firebaseAdmin.ts` file provides a wrapper around the standard Firebase client SDK that mimics the Admin SDK interface:

- **Collection Operations**: `admin.collection('courses')`
- **Document Operations**: `admin.addDocument()`, `admin.updateDocument()`, `admin.deleteDocument()`
- **Query Operations**: `admin.queryWithOrder()` for ordered results

### 3. Security Considerations
⚠️ **IMPORTANT**: This approach still respects Firestore security rules, unlike the Admin SDK. You'll need to ensure your Firestore rules allow read/write access for the operations you want to perform.

## Benefits

- **🚀 No WebAssembly Issues**: Compatible with Vite and other bundlers
- **🔒 Respects Security Rules**: Still follows Firestore security configuration
- **⚡ Direct Operations**: No server round-trips for database operations
- **📱 Browser Compatible**: Works in all modern browsers

## Limitations

- **Security Rules**: Must comply with Firestore security rules
- **Authentication**: Uses client-side authentication (Firebase Auth)
- **Permissions**: Limited by user's Firestore permissions

## Troubleshooting

### Error: "Permission denied"
This means your Firestore security rules are blocking the operation. You'll need to:
1. Check your Firestore security rules
2. Ensure the authenticated user has the necessary permissions
3. Consider using server endpoints for admin operations

### Error: "Collection not found"
Make sure the collection exists in your Firestore database.

## Switching Back to Production

When ready for production, simply:
1. Remove the `firebaseAdmin` import from `Courses.tsx`
2. Replace client SDK calls with fetch calls to your server endpoints
3. The server endpoints will handle authentication and security properly

## Firestore Security Rules Example

For development, you might want to temporarily allow all operations (NEVER in production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Remember**: This is for development only. In production, implement proper role-based access control.
