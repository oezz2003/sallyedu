// Firebase Connection Test Component for Courses
// This component helps diagnose issues with course data loading

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const FirebaseCourseTest = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [courses, setCourses] = useState<any[]>([]);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing connection...');
    
    try {
      // Test 1: Basic connection
      setTestResult('Testing basic connection...');
      const testQuery = query(collection(db, 'courses'), limit(1));
      await getDocs(testQuery);
      setTestResult('✅ Basic connection successful!');
      
      // Test 2: Load actual courses
      setTestResult('Loading courses...');
      const coursesQuery = query(collection(db, 'courses'));
      const snapshot = await getDocs(coursesQuery);
      
      const courseData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCourses(courseData);
      setTestResult(`✅ Connection successful! Found ${courseData.length} courses.`);
    } catch (error: any) {
      console.error('Connection test failed:', error);
      let errorMessage = '❌ Connection failed: ';
      
      if (error.message.includes('permission-denied')) {
        errorMessage += 'Permission denied. Please check Firestore security rules for lmssally-a0957.';
      } else if (error.message.includes('unavailable')) {
        errorMessage += 'Service unavailable. Check internet connection.';
      } else {
        errorMessage += error.message;
      }
      
      setTestResult(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Firebase Course Connection Test</h3>
      <p className="mb-2">{testResult}</p>
      <button 
        onClick={testConnection}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Retest Connection'}
      </button>
      
      {courses.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Courses Found:</h4>
          <ul className="list-disc pl-5">
            {courses.map((course, index) => (
              <li key={index}>{course.title || `Course ${index + 1}`}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FirebaseCourseTest;