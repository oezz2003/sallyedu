import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore';

// Firebase Client SDK wrapper for admin-like operations
// This provides similar functionality to Admin SDK but uses the client SDK
export class FirebaseClientAdmin {
  private static instance: FirebaseClientAdmin;

  private constructor() {}

  static getInstance(): FirebaseClientAdmin {
    if (!FirebaseClientAdmin.instance) {
      FirebaseClientAdmin.instance = new FirebaseClientAdmin();
    }
    return FirebaseClientAdmin.instance;
  }

  // Get Firestore instance
  getFirestore() {
    return db;
  }

  // Collection reference
  collection(collectionName: string) {
    return collection(db, collectionName);
  }

  // Document reference
  doc(collectionName: string, docId: string) {
    return doc(db, collectionName, docId);
  }

  // Query with ordering
  async queryWithOrder(collectionName: string, orderByField: string, direction: 'asc' | 'desc' = 'desc') {
    const q = query(collection(db, collectionName), orderBy(orderByField, direction));
    return getDocs(q);
  }

  // Add document
  async addDocument(collectionName: string, data: any) {
    return addDoc(collection(db, collectionName), data);
  }

  // Update document
  async updateDocument(collectionName: string, docId: string, data: any) {
    const docRef = doc(db, collectionName, docId);
    return updateDoc(docRef, data);
  }

  // Delete document
  async deleteDocument(collectionName: string, docId: string) {
    const docRef = doc(db, collectionName, docId);
    return deleteDoc(docRef);
  }
}

// Export a function that returns the singleton instance
export default function initializeAdmin() {
  return FirebaseClientAdmin.getInstance();
}
