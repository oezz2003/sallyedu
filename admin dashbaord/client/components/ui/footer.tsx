import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BookOpen, Edit, Calendar, Award, Plus, Trash2, Save, Upload, Users, Star } from 'lucide-react';

const Footer = () => {
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: "React Fundamentals",
      description: "Learn the basics of React development",
      videos: [
        { id: 1, title: "Introduction to React", duration: "10:30", description: "Basic React concepts", url: "#" },
        { id: 2, title: "JSX and Components", duration: "15:45", description: "Understanding JSX syntax", url: "#" }
      ]
    },
    {
      id: 2,
      title: "JavaScript Advanced",
      description: "Advanced JavaScript concepts and ES6+",
      videos: [
        { id: 3, title: "Async/Await", duration: "12:20", description: "Asynchronous programming", url: "#" }
      ]
    }
  ]);

  const [scheduledEvents, setScheduledEvents] = useState([
    { id: 1, title: "React Workshop", date: "2024-09-15", time: "14:00", description: "Hands-on React workshop", courseId: "1" }
  ]);
  
  const [certificates, setCertificates] = useState([
    { id: 1, student: "Ahmed Mohamed", courseId: "1", date: "2024-08-20" }
  ]);
  
  const [uploadVideos, setUploadVideos] = useState([{ title: '', duration: '', description: '', url: '', uploadProgress: 0 }]);

  const [isAddCourseDialogOpen, setIsAddCourseDialogOpen] = useState(false);
  const [isScheduleEventDialogOpen, setIsScheduleEventDialogOpen] = useState(false);
  const [isIssueCertificateDialogOpen, setIsIssueCertificateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [editingCourse, setEditingCourse] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', description: '', videos: [] });

  const [newCourseForm, setNewCourseForm] = useState({ title: '', description: '' });
  const [eventForm, setEventForm] = useState({ title: '', date: '', time: '', description: '', courseId: '' });
  const [certificateForm, setCertificateForm] = useState({ student: '', courseId: '', date: '' });

  // Add new course
  const handleAddCourse = () => {
    if (newCourseForm.title) {
      const newCourse = {
        id: Date.now(),
        title: newCourseForm.title,
        description: newCourseForm.description,
        videos: []
      };
      setCourses([...courses, newCourse]);
      setNewCourseForm({ title: '', description: '' });
      setIsAddCourseDialogOpen(false);
    }
  };

  // Edit course functions
  const startEditingCourse = (course) => {
    setEditingCourse(course);
    setEditFormData({
      title: course.title,
      description: course.description,
      videos: [...course.videos]
    });
    setIsEditDialogOpen(true);
  };

  const addUploadDialogVideo = () => {
    setUploadVideos([...uploadVideos, { title: '', duration: '', description: '', url: '', uploadProgress: 0 }]);
  };

  const removeUploadDialogVideo = (index) => {
    if (uploadVideos.length > 1) {
      const updated = uploadVideos.filter((_, i) => i !== index);
      setUploadVideos(updated);
    }
  };

  const handleUploadDialogVideoFileChange = (file, index) => {
    const updated = [...uploadVideos];
    updated[index].uploadProgress = 50;
    setUploadVideos(updated);

    setTimeout(() => {
      updated[index].uploadProgress = 100;
      updated[index].url = URL.createObjectURL(file);
      setUploadVideos([...updated]);
    }, 2000);
  };

  const handleUploadVideosToCourse = () => {
    const course = courses.find(c => c.id.toString() === selectedCourseId);
    if (course) {
      const validVideos = uploadVideos.filter(v => v.url && v.title);
      const videosWithIds = validVideos.map(v => ({ ...v, id: Date.now() + Math.random() }));

      const updatedCourse = {
        ...course,
        videos: [...course.videos, ...videosWithIds]
      };
      setCourses(courses.map(c => c.id.toString() === selectedCourseId ? updatedCourse : c));
    }
    setUploadVideos([{ title: '', duration: '', description: '', url: '', uploadProgress: 0 }]);
    setSelectedCourseId('');
  };

  const addVideoToEditCourse = () => {
    const newVideo = {
      id: Date.now() + Math.random(),
      title: '',
      duration: '',
      description: '',
      url: '',
      uploadProgress: 0
    };
    setEditFormData({
      ...editFormData,
      videos: [...editFormData.videos, newVideo]
    });
  };

  const removeVideoFromEditCourse = (videoId) => {
    setEditFormData({
      ...editFormData,
      videos: editFormData.videos.filter(v => v.id !== videoId)
    });
  };

  const handleEditVideoFileChange = (file, index) => {
    const updatedVideos = [...editFormData.videos];
    updatedVideos[index].uploadProgress = 50;
    setEditFormData({ ...editFormData, videos: updatedVideos });

    setTimeout(() => {
      updatedVideos[index].uploadProgress = 100;
      updatedVideos[index].url = URL.createObjectURL(file);
      setEditFormData({ ...editFormData, videos: updatedVideos });
    }, 2000);
  };

  const handleSaveCourse = () => {
    setCourses(courses.map(c =>
      c.id === editingCourse.id ? { ...c, ...editFormData } : c
    ));
    setIsEditDialogOpen(false);
    setEditingCourse(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Button
                variant="outline"
                className="h-24 flex-col hover:bg-blue-50 hover:border-blue-200 transition-all"
                onClick={() => setIsAddCourseDialogOpen(true)}
              >
                <BookOpen className="w-8 h-8 mb-2 text-blue-600" />
                <span className="font-medium">Add New Course</span>
                <span className="text-xs text-gray-500">Create educational content</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex-col hover:bg-purple-50 hover:border-purple-200 transition-all"
                onClick={() => setIsScheduleEventDialogOpen(true)}
              >
                <Calendar className="w-8 h-8 mb-2 text-purple-600" />
                <span className="font-medium">Schedule Event</span>
                <span className="text-xs text-gray-500">Plan activities</span>
              </Button>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <Button
                variant="outline"
                className="w-full h-16 hover:bg-yellow-50 hover:border-yellow-200 transition-all"
                onClick={() => setIsIssueCertificateDialogOpen(true)}
              >
                <Award className="w-6 h-6 mr-3 text-yellow-600" />
                <span className="font-medium">Issue Certificate</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Course Dialog */}
      <Dialog open={isAddCourseDialogOpen} onOpenChange={setIsAddCourseDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>Create a new course for your platform</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course-title">Course Title</Label>
              <Input
                id="course-title"
                value={newCourseForm.title}
                onChange={e => setNewCourseForm({ ...newCourseForm, title: e.target.value })}
                placeholder="Enter course title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-description">Description</Label>
              <Textarea
                id="course-description"
                value={newCourseForm.description}
                onChange={e => setNewCourseForm({ ...newCourseForm, description: e.target.value })}
                placeholder="Course description"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddCourseDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCourse} disabled={!newCourseForm.title}>
                Create Course
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Event Dialog */}
      <Dialog open={isScheduleEventDialogOpen} onOpenChange={setIsScheduleEventDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule New Event</DialogTitle>
            <DialogDescription>Create and schedule an event for a course.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Event Title</Label>
              <Input
                id="event-title"
                value={eventForm.title}
                onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="Enter event title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-date">Date</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={eventForm.date}
                  onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-time">Time</Label>
                <Input
                  id="event-time"
                  type="time"
                  value={eventForm.time}
                  onChange={e => setEventForm({ ...eventForm, time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-course">Related Course</Label>
              <select
                id="event-course"
                className="w-full border rounded-md px-3 py-2 bg-white"
                value={eventForm.courseId}
                onChange={e => setEventForm({ ...eventForm, courseId: e.target.value })}
              >
                <option value="">-- Select a course (optional) --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                value={eventForm.description}
                onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Event description"
                rows={2}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsScheduleEventDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setScheduledEvents([...scheduledEvents, { ...eventForm, id: Date.now() }]);
                  setIsScheduleEventDialogOpen(false);
                  setEventForm({ title: '', date: '', time: '', description: '', courseId: '' });
                }}
                disabled={!eventForm.title || !eventForm.date || !eventForm.time}
              >
                Schedule Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Issue Certificate Dialog */}
      <Dialog open={isIssueCertificateDialogOpen} onOpenChange={setIsIssueCertificateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Issue Certificate</DialogTitle>
            <DialogDescription>Select a course and enter student details to issue a certificate.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cert-student">Student Name or Email</Label>
              <Input
                id="cert-student"
                value={certificateForm.student}
                onChange={e => setCertificateForm({ ...certificateForm, student: e.target.value })}
                placeholder="Enter student name or email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cert-course">Course</Label>
              <select
                id="cert-course"
                className="w-full border rounded-md px-3 py-2 bg-white"
                value={certificateForm.courseId}
                onChange={e => setCertificateForm({ ...certificateForm, courseId: e.target.value })}
              >
                <option value="">-- Select a course --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cert-date">Completion Date</Label>
              <Input
                id="cert-date"
                type="date"
                value={certificateForm.date}
                onChange={e => setCertificateForm({ ...certificateForm, date: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsIssueCertificateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setCertificates([...certificates, { ...certificateForm, id: Date.now() }]);
                  setIsIssueCertificateDialogOpen(false);
                  setCertificateForm({ student: '', courseId: '', date: '' });
                }}
                disabled={!certificateForm.student || !certificateForm.courseId || !certificateForm.date}
              >
                Issue Certificate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course Content</DialogTitle>
            <DialogDescription>Update course information and video content</DialogDescription>
          </DialogHeader>
          {editingCourse && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Course Title</Label>
                <Input
                  id="edit-title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Course Videos</Label>
                  <Button type="button" size="sm" onClick={addVideoToEditCourse}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Video
                  </Button>
                </div>

                {editFormData.videos.map((video, index) => (
                  <div key={video.id} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Video {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVideoFromEditCourse(video.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Video Title</Label>
                        <Input
                          value={video.title}
                          onChange={(e) => {
                            const updatedVideos = editFormData.videos.map(v =>
                              v.id === video.id ? { ...v, title: e.target.value } : v
                            );
                            setEditFormData({ ...editFormData, videos: updatedVideos });
                          }}
                          placeholder="Video title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Input
                          value={video.duration}
                          onChange={(e) => {
                            const updatedVideos = editFormData.videos.map(v =>
                              v.id === video.id ? { ...v, duration: e.target.value } : v
                            );
                            setEditFormData({ ...editFormData, videos: updatedVideos });
                          }}
                          placeholder="e.g. 25:30"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Video Description</Label>
                      <Textarea
                        value={video.description}
                        onChange={(e) => {
                          const updatedVideos = editFormData.videos.map(v =>
                            v.id === video.id ? { ...v, description: e.target.value } : v
                          );
                          setEditFormData({ ...editFormData, videos: updatedVideos });
                        }}
                        placeholder="Video description"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Upload Video File</Label>
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            handleEditVideoFileChange(file, index);
                          }
                        }}
                      />
                      {video.uploadProgress > 0 && video.uploadProgress < 100 && (
                        <div className="space-y-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${video.uploadProgress}%` }}></div>
                          </div>
                          <div className="text-xs text-blue-600">Uploading: {video.uploadProgress}%</div>
                        </div>
                      )}
                      {video.url && (
                        <div className="text-xs text-green-600 font-medium">✓ Uploaded successfully!</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveCourse}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              © 2024 EduPlatform. All rights reserved.
            </p>
            <div className="flex space-x-4 text-sm text-gray-500">
              <span>Events: {scheduledEvents.length}</span>
              <span>Certificates: {certificates.length}</span>
              <span>Courses: {courses.length}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;