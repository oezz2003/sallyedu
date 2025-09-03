// Test Courses Page
// This page helps verify that course CRUD operations are working correctly

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService, Course } from '@/lib/firebaseService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const TestCoursesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [testCourseId, setTestCourseId] = useState<string | null>(null);

  // Load courses
  const loadCourses = async () => {
    try {
      setLoading(true);
      const result = await courseService.getAll([], 'createdAt', 'desc');
      setCourses(result.data);
      console.log('Courses loaded:', result.data);
    } catch (error: any) {
      console.error('Error loading courses:', error);
      toast({
        title: "Error",
        description: `Failed to load courses: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create test course
  const createTestCourse = async () => {
    try {
      const testCourse = {
        title: "Test Course",
        description: "This is a test course for verification",
        instructors: ["Test Instructor"],
        category: "Programming",
        price: 0,
        duration: "1 hour",
        thumbnail: "/placeholder.svg",
        status: "draft" as const,
        students: 0,
        rating: 0,
        progress: 0,
        videos: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const id = await courseService.create(testCourse);
      setTestCourseId(id);
      
      toast({
        title: "Success",
        description: "Test course created successfully!",
      });
      
      // Reload courses
      await loadCourses();
    } catch (error: any) {
      console.error('Error creating test course:', error);
      toast({
        title: "Error",
        description: `Failed to create test course: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Update test course
  const updateTestCourse = async () => {
    if (!testCourseId) {
      toast({
        title: "Error",
        description: "No test course to update",
        variant: "destructive",
      });
      return;
    }

    try {
      await courseService.update(testCourseId, {
        title: "Updated Test Course",
        description: "This test course has been updated"
      });
      
      toast({
        title: "Success",
        description: "Test course updated successfully!",
      });
      
      // Reload courses
      await loadCourses();
    } catch (error: any) {
      console.error('Error updating test course:', error);
      toast({
        title: "Error",
        description: `Failed to update test course: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Delete test course
  const deleteTestCourse = async () => {
    if (!testCourseId) {
      toast({
        title: "Error",
        description: "No test course to delete",
        variant: "destructive",
      });
      return;
    }

    try {
      await courseService.delete(testCourseId);
      setTestCourseId(null);
      
      toast({
        title: "Success",
        description: "Test course deleted successfully!",
      });
      
      // Reload courses
      await loadCourses();
    } catch (error: any) {
      console.error('Error deleting test course:', error);
      toast({
        title: "Error",
        description: `Failed to delete test course: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Test connection
  const testConnection = async () => {
    try {
      await loadCourses();
      toast({
        title: "Connection Test",
        description: "Connection successful!",
      });
    } catch (error: any) {
      toast({
        title: "Connection Test",
        description: `Connection failed: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Course CRUD Test Page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <Button onClick={testConnection} disabled={loading}>
              {loading ? "Testing..." : "Test Connection"}
            </Button>
            <Button onClick={createTestCourse} variant="secondary">
              Create Test Course
            </Button>
            <Button onClick={updateTestCourse} variant="secondary" disabled={!testCourseId}>
              Update Test Course
            </Button>
            <Button onClick={deleteTestCourse} variant="destructive" disabled={!testCourseId}>
              Delete Test Course
            </Button>
            <Button onClick={loadCourses} variant="outline">
              Refresh Courses
            </Button>
          </div>

          {loading ? (
            <p>Loading courses...</p>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-2">Courses ({courses.length})</h3>
              {courses.length === 0 ? (
                <p>No courses found.</p>
              ) : (
                <ul className="space-y-2">
                  {courses.map((course) => (
                    <li key={course.id} className="border p-2 rounded">
                      <strong>{course.title}</strong> - {course.status}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {testCourseId && (
            <div className="mt-4 p-3 bg-green-100 rounded">
              <p>Test course ID: {testCourseId}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestCoursesPage;