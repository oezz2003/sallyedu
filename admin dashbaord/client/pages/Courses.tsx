import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Eye, Play, Users, DollarSign, Clock, Search, Filter, PlusCircle, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Course, VideoContent } from '@/lib/firebaseService';
import initializeAdmin from '@/lib/firebaseAdmin';

interface CourseFormData {
  title: string;
  description: string;
  instructors: string[];
  category: string;
  price: number;
  duration: string;
  thumbnail: string;
  status: 'draft' | 'published' | 'archived';
  videos: VideoContent[];
}

const initialFormData: CourseFormData = {
  title: '',
  description: '',
  instructors: [],
  category: '',
  price: 0,
  duration: '',
  thumbnail: '',
  status: 'draft',
  videos: []
};

const categories = [
  'Programming', 'Data Science', 'Design', 'Business', 'Marketing', 
  'Language', 'Music', 'Photography', 'Fitness', 'Cooking'
];

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>(initialFormData);
  const [instructorInput, setInstructorInput] = useState('');
  const [videoInput, setVideoInput] = useState({ title: '', description: '', url: '', duration: '' });
  const { toast } = useToast();

  // Fetch courses directly using Client SDK wrapper
  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // Initialize Client SDK wrapper
      const admin = initializeAdmin();
      
      // Fetch courses from Firestore using Client SDK
      const coursesSnapshot = await admin.queryWithOrder('courses', 'createdAt', 'desc');
      
      const fetchedCourses: Course[] = [];
      coursesSnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedCourses.push({
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          instructors: data.instructors || [],
          category: data.category || '',
          price: data.price || 0,
          duration: data.duration || '',
          thumbnail: data.thumbnail || '',
          status: data.status || 'draft',
          students: data.students || 0,
          rating: data.rating || 0,
          progress: data.progress || 0,
          videos: data.videos || [],
          prerequisites: data.prerequisites || [],
          learningObjectives: data.learningObjectives || [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          createdBy: data.createdBy || ''
        });
      });
      
      setCourses(fetchedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch courses from database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async () => {
    try {
      setOperationLoading('create');
      
      // Initialize Client SDK wrapper
      const admin = initializeAdmin();
      
      // Create course data
      const courseData = {
        ...formData,
        students: 0,
        rating: 0,
        progress: 0,
        prerequisites: [],
        learningObjectives: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin' // You can get this from auth context
      };
      
      // Add course to Firestore
      await admin.addDocument('courses', courseData);
      
      toast({
        title: "Success",
        description: "Course created successfully"
      });
      
      setDialogOpen(false);
      setFormData(initialFormData);
      fetchCourses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive"
      });
    } finally {
      setOperationLoading(null);
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse?.id) return;
    
    try {
      setOperationLoading('update');
      
      // Initialize Client SDK wrapper
      const admin = initializeAdmin();
      
      // Update course data
      const updateData = {
        ...formData,
        updatedAt: new Date().toISOString()
      };
      
      // Update course in Firestore
      await admin.updateDocument('courses', editingCourse.id, updateData);
      
      toast({
        title: "Success",
        description: "Course updated successfully"
      });
      
      setDialogOpen(false);
      setEditingCourse(null);
      setFormData(initialFormData);
      fetchCourses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive"
      });
    } finally {
      setOperationLoading(null);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      setOperationLoading(`delete-${courseId}`);
      
      // Initialize Client SDK wrapper
      const admin = initializeAdmin();
      
      // Delete course from Firestore
      await admin.deleteDocument('courses', courseId);
      
      toast({
        title: "Success",
        description: "Course deleted successfully"
      });
      
      fetchCourses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive"
      });
    } finally {
      setOperationLoading(null);
    }
  };

  const handleStatusChange = async (courseId: string, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      setOperationLoading(`status-${courseId}`);
      
      // Initialize Client SDK wrapper
      const admin = initializeAdmin();
      
      // Update course status in Firestore
      await admin.updateDocument('courses', courseId, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      toast({
        title: "Success",
        description: "Course status updated successfully"
      });
      
      fetchCourses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update course status",
        variant: "destructive"
      });
    } finally {
      setOperationLoading(null);
    }
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    
    // Handle price conversion from object to number if needed
    let coursePrice = 0;
    if (course.price && typeof course.price === 'object' && 'amount' in (course.price as any)) {
      coursePrice = ((course.price as any).amount ?? 0) / 100;
    } else {
      coursePrice = course.price ?? 0;
    }
    
    setFormData({
      title: course.title,
      description: course.description,
      instructors: course.instructors,
      category: course.category,
      price: coursePrice,
      duration: course.duration,
      thumbnail: course.thumbnail,
      status: course.status,
      videos: course.videos
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingCourse(null);
    setFormData(initialFormData);
    setDialogOpen(true);
  };

  const addInstructor = () => {
    if (instructorInput.trim() && !formData.instructors.includes(instructorInput.trim())) {
      setFormData(prev => ({
        ...prev,
        instructors: [...prev.instructors, instructorInput.trim()]
      }));
      setInstructorInput('');
    }
  };

  const removeInstructor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructors: prev.instructors.filter((_, i) => i !== index)
    }));
  };

  const addVideo = () => {
    if (videoInput.title && videoInput.url) {
      const newVideo: VideoContent = {
        id: formData.videos.length + 1,
        title: videoInput.title,
        description: videoInput.description,
        url: videoInput.url,
        duration: videoInput.duration || '0m',
        order: formData.videos.length + 1
      };
      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, newVideo]
      }));
      setVideoInput({ title: '', description: '', url: '', duration: '' });
    }
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses Management</h1>
          <p className="text-gray-600 mt-2">Manage all courses, content, and student enrollments</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={fetchCourses}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <div className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </div>
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
          <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add New Course
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.filter(c => c.status === 'published').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.reduce((sum, c) => sum + c.students, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${courses.reduce((sum, c) => {
             let coursePrice = 0;
             if (c.price && typeof c.price === 'object' && 'amount' in (c.price as any)) {
               coursePrice = ((c.price as any).amount ?? 0) / 100;
             } else {
               coursePrice = c.price ?? 0;
             }
             return sum + (coursePrice * c.students);
           }, 0).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Courses ({filteredCourses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-500 mb-4">
                {courses.length === 0 
                  ? "Get started by creating your first course" 
                  : "Try adjusting your search or filters"
                }
              </p>
              {courses.length === 0 && (
                <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Course
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Instructors</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            {course.thumbnail ? (
                              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <Play className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{course.title}</div>
                            <div className="text-sm text-gray-500">{course.description.substring(0, 50)}...</div>
                            <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{course.duration}</span>
                              <span>•</span>
                              <span>{course.videos.length} videos</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{course.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {course.instructors.map((instructor, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {instructor}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {(() => {
                            if (course.price && typeof course.price === 'object' && 'amount' in (course.price as any)) {
                              const priceObj = course.price as { amount: number; currency?: string };
                              return `$${((priceObj.amount ?? 0) / 100).toFixed(2)} ${priceObj.currency ?? 'USD'}`;
                            }
                            return `$${course.price ?? 0}`;
                          })()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{course.students}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(course.status)}>
                          {course.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Select 
                            value={course.status} 
                            onValueChange={(value: 'draft' | 'published' | 'archived') => handleStatusChange(course.id!, value)}
                            disabled={!!operationLoading}
                          >
                            <SelectTrigger className="w-32">
                              {operationLoading === `status-${course.id}` ? (
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                  <span className="text-xs">Updating...</span>
                                </div>
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(course)}
                            disabled={!!operationLoading}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={!!operationLoading}
                              >
                                {operationLoading === `delete-${course.id}` ? (
                                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Course</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{course.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCourse(course.id!)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </DialogTitle>
            <DialogDescription>
              {editingCourse ? 'Update course information and content' : 'Add a new course to your platform'}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter course title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter course description"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 12h 30m"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'draft' | 'published' | 'archived') => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4">
              <div className="space-y-2">
                <Label>Instructors *</Label>
                <div className="flex space-x-2">
                  <Input
                    value={instructorInput}
                    onChange={(e) => setInstructorInput(e.target.value)}
                    placeholder="Enter instructor name"
                    onKeyPress={(e) => e.key === 'Enter' && addInstructor()}
                  />
                  <Button type="button" onClick={addInstructor} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.instructors.map((instructor, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{instructor}</span>
                      <button
                        type="button"
                        onClick={() => removeInstructor(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="videos" className="space-y-4">
              <div className="space-y-2">
                <Label>Add Video</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={videoInput.title}
                    onChange={(e) => setVideoInput(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Video title"
                  />
                  <Input
                    value={videoInput.url}
                    onChange={(e) => setVideoInput(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="Video URL"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Textarea
                    value={videoInput.description}
                    onChange={(e) => setVideoInput(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Video description"
                    rows={2}
                  />
                  <Input
                    value={videoInput.duration}
                    onChange={(e) => setVideoInput(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="Duration (e.g., 25:30)"
                  />
                </div>
                <Button type="button" onClick={addVideo} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Video
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>Course Videos ({formData.videos.length})</Label>
                <div className="space-y-2">
                  {formData.videos.map((video, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{video.title}</div>
                        <div className="text-sm text-gray-500">{video.description}</div>
                        <div className="text-xs text-gray-400">{video.duration}</div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeVideo(index)}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={editingCourse ? handleUpdateCourse : handleCreateCourse}
              disabled={!formData.title || !formData.description || !formData.instructors.length || !formData.category || formData.price === undefined || !!operationLoading}
            >
              {operationLoading === 'create' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : operationLoading === 'update' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                editingCourse ? 'Update Course' : 'Create Course'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
