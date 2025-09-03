import 'dotenv/config';
import admin from 'firebase-admin';

let isInitialized = false;

function initializeAdmin() {
  if (isInitialized) return admin;
  
  // Initialize Admin SDK using environment variables. Never commit credentials.
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!privateKey || !clientEmail || !projectId) {
    console.warn('[firebase-admin] Missing env vars: FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID');
    throw new Error('Missing Firebase Admin SDK environment variables');
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
  
  isInitialized = true;
  return admin;
}

export default initializeAdmin;
