// Firebase Connection Test
// Run this in browser console to test Firebase connection

import { auth, db } from './lib/firebase.tsx';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

console.log('🔍 Testing Firebase Connection to lmssally-a0957...');

// Test 1: Check Firebase config
console.log('📋 Firebase Config:', {
  projectId: db.app.options.projectId,
  authDomain: db.app.options.authDomain,
});

// Test 2: Check authentication state
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('✅ User authenticated:', {
      uid: user.uid,
      email: user.email,
    });
    
    // Test 3: Try to read from Firestore
    console.log('🔍 Testing Firestore access...');
    
    getDocs(collection(db, 'users'))
      .then((snapshot) => {
        console.log('✅ Firestore access successful!');
        console.log('📊 Users collection size:', snapshot.size);
        snapshot.forEach((doc) => {
          console.log('👤 User:', doc.id, doc.data());
        });
      })
      .catch((error) => {
        console.error('❌ Firestore access failed:', {
          code: error.code,
          message: error.message,
        });
        
        if (error.code === 'permission-denied') {
          console.log('🚨 SOLUTION: Deploy development rules to lmssally-a0957');
          console.log('📋 Go to Firebase Console → lmssally-a0957 → Firestore → Rules');
        }
      });
  } else {
    console.log('❌ User not authenticated');
    console.log('🔍 Redirect to login page or check authentication');
  }
});

export { };