import 'dotenv/config';
import admin from 'firebase-admin';

// Initialize Admin SDK
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.FIREBASE_PROJECT_ID;

if (!privateKey || !clientEmail || !projectId) {
  console.error('Missing environment variables. Check your .env file.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  }),
});

async function setupAdmin() {
  try {
    const email = process.argv[2];
    if (!email) {
      console.error('Usage: node scripts/setup-admin.js <admin-email>');
      process.exit(1);
    }

    console.log(`Setting up admin for: ${email}`);
    
    // Find user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`Found user: ${userRecord.uid}`);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'admin' });
    console.log('✅ Admin role set successfully');
    
    // Update Firestore document
    const db = admin.firestore();
    await db.collection('users').doc(userRecord.uid).update({
      role: 'admin',
      updatedAt: new Date().toISOString()
    });
    console.log('✅ Firestore document updated');
    
    console.log(`\n🎉 User ${email} is now an admin!`);
    console.log('You can now access the admin dashboard.');
    
  } catch (error) {
    console.error('Error setting up admin:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

setupAdmin();
