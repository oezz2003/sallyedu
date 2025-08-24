import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Sample data for revenue and active students organized by year
const revenueData = {
  2022: {
    quarter: [
      { period: 'Q1', value: 15200 },
      { period: 'Q2', value: 16800 },
      { period: 'Q3', value: 17200 },
      { period: 'Q4', value: 18300 }
    ],
    month: [
      { period: 'Jan', value: 4800 },
      { period: 'Feb', value: 5100 },
      { period: 'Mar', value: 5300 },
      { period: 'Apr', value: 5400 },
      { period: 'May', value: 5600 },
      { period: 'Jun', value: 5800 },
      { period: 'Jul', value: 5700 },
      { period: 'Aug', value: 5800 },
      { period: 'Sep', value: 5700 },
      { period: 'Oct', value: 6000 },
      { period: 'Nov', value: 6100 },
      { period: 'Dec', value: 6200 }
    ]
  },
  2023: {
    quarter: [
      { period: 'Q1', value: 18200 },
      { period: 'Q2', value: 22500 },
      { period: 'Q3', value: 24800 },
      { period: 'Q4', value: 23700 }
    ],
    month: [
      { period: 'Jan', value: 5800 },
      { period: 'Feb', value: 6100 },
      { period: 'Mar', value: 6300 },
      { period: 'Apr', value: 7200 },
      { period: 'May', value: 7500 },
      { period: 'Jun', value: 7800 },
      { period: 'Jul', value: 8100 },
      { period: 'Aug', value: 8300 },
      { period: 'Sep', value: 8400 },
      { period: 'Oct', value: 7800 },
      { period: 'Nov', value: 7900 },
      { period: 'Dec', value: 8000 }
    ]
  },
  2024: {
    quarter: [
      { period: 'Q1', value: 28900 },
      { period: 'Q2', value: 32100 },
      { period: 'Q3', value: 34200 },
      { period: 'Q4', value: 29300 }
    ],
    month: [
      { period: 'Jan', value: 8900 },
      { period: 'Feb', value: 9800 },
      { period: 'Mar', value: 10200 },
      { period: 'Apr', value: 10800 },
      { period: 'May', value: 10500 },
      { period: 'Jun', value: 10800 },
      { period: 'Jul', value: 11400 },
      { period: 'Aug', value: 11200 },
      { period: 'Sep', value: 11600 },
      { period: 'Oct', value: 10100 },
      { period: 'Nov', value: 9800 },
      { period: 'Dec', value: 9400 }
    ]
  }
};

const activeStudentsData = {
  2022: {
    quarter: [
      { period: 'Q1', value: 520 },
      { period: 'Q2', value: 580 },
      { period: 'Q3', value: 620 },
      { period: 'Q4', value: 675 }
    ],
    month: [
      { period: 'Jan', value: 480 },
      { period: 'Feb', value: 495 },
      { period: 'Mar', value: 520 },
      { period: 'Apr', value: 540 },
      { period: 'May', value: 560 },
      { period: 'Jun', value: 580 },
      { period: 'Jul', value: 600 },
      { period: 'Aug', value: 610 },
      { period: 'Sep', value: 620 },
      { period: 'Oct', value: 640 },
      { period: 'Nov', value: 660 },
      { period: 'Dec', value: 675 }
    ]
  },
  2023: {
    quarter: [
      { period: 'Q1', value: 720 },
      { period: 'Q2', value: 785 },
      { period: 'Q3', value: 850 },
      { period: 'Q4', value: 892 }
    ],
    month: [
      { period: 'Jan', value: 685 },
      { period: 'Feb', value: 705 },
      { period: 'Mar', value: 720 },
      { period: 'Apr', value: 750 },
      { period: 'May', value: 770 },
      { period: 'Jun', value: 785 },
      { period: 'Jul', value: 820 },
      { period: 'Aug', value: 835 },
      { period: 'Sep', value: 850 },
      { period: 'Oct', value: 870 },
      { period: 'Nov', value: 880 },
      { period: 'Dec', value: 892 }
    ]
  },
  2024: {
    quarter: [
      { period: 'Q1', value: 950 },
      { period: 'Q2', value: 1080 },
      { period: 'Q3', value: 1180 },
      { period: 'Q4', value: 1247 }
    ],
    month: [
      { period: 'Jan', value: 950 },
      { period: 'Feb', value: 975 },
      { period: 'Mar', value: 995 },
      { period: 'Apr', value: 1020 },
      { period: 'May', value: 1045 },
      { period: 'Jun', value: 1080 },
      { period: 'Jul', value: 1125 },
      { period: 'Aug', value: 1150 },
      { period: 'Sep', value: 1180 },
      { period: 'Oct', value: 1205 },
      { period: 'Nov', value: 1225 },
      { period: 'Dec', value: 1247 }
    ]
  }
};

const availableYears = [2022, 2023, 2024];

// Dashboard statistics cards data
const stats = [
  {
    title: "Total Courses",
    value: "24",
    change: "+12%",
    changeType: "increase" as const,
    icon: BookOpen,
    color: "bg-blue-500"
  },
  {
    title: "Active Students",
    value: "1,247",
    change: "+8%",
    changeType: "increase" as const,
    icon: Users,
    color: "bg-green-500"
  },
  
  {
    title: "Revenue",
    value: "$12,450",
    change: "+15%",
    changeType: "increase" as const,
    icon: TrendingUp,
    color: "bg-green-600"
  }
];
const topCoursesData = {
  2022: {
    quarter: [
      { period: 'Q1', 'React Basics': 120, 'Python Intro': 95, 'JavaScript': 85, 'HTML/CSS': 75, 'Node.js': 60 },
      { period: 'Q2', 'React Basics': 140, 'Python Intro': 110, 'JavaScript': 95, 'HTML/CSS': 85, 'Node.js': 70 },
      { period: 'Q3', 'React Basics': 160, 'Python Intro': 125, 'JavaScript': 105, 'HTML/CSS': 90, 'Node.js': 80 },
      { period: 'Q4', 'React Basics': 180, 'Python Intro': 135, 'JavaScript': 115, 'HTML/CSS': 95, 'Node.js': 85 }
    ],
    month: [
      { period: 'Jan', 'React Basics': 35, 'Python Intro': 30, 'JavaScript': 25, 'HTML/CSS': 20, 'Node.js': 15 },
      { period: 'Feb', 'React Basics': 40, 'Python Intro': 32, 'JavaScript': 28, 'HTML/CSS': 22, 'Node.js': 18 },
      { period: 'Mar', 'React Basics': 45, 'Python Intro': 35, 'JavaScript': 32, 'HTML/CSS': 25, 'Node.js': 20 },
      { period: 'Apr', 'React Basics': 48, 'Python Intro': 38, 'JavaScript': 35, 'HTML/CSS': 28, 'Node.js': 22 },
      { period: 'May', 'React Basics': 50, 'Python Intro': 40, 'JavaScript': 38, 'HTML/CSS': 30, 'Node.js': 25 },
      { period: 'Jun', 'React Basics': 52, 'Python Intro': 42, 'JavaScript': 40, 'HTML/CSS': 32, 'Node.js': 28 },
      { period: 'Jul', 'React Basics': 55, 'Python Intro': 45, 'JavaScript': 42, 'HTML/CSS': 35, 'Node.js': 30 },
      { period: 'Aug', 'React Basics': 58, 'Python Intro': 48, 'JavaScript': 45, 'HTML/CSS': 38, 'Node.js': 32 },
      { period: 'Sep', 'React Basics': 60, 'Python Intro': 50, 'JavaScript': 48, 'HTML/CSS': 40, 'Node.js': 35 },
      { period: 'Oct', 'React Basics': 62, 'Python Intro': 52, 'JavaScript': 50, 'HTML/CSS': 42, 'Node.js': 38 },
      { period: 'Nov', 'React Basics': 65, 'Python Intro': 55, 'JavaScript': 52, 'HTML/CSS': 45, 'Node.js': 40 },
      { period: 'Dec', 'React Basics': 68, 'Python Intro': 58, 'JavaScript': 55, 'HTML/CSS': 48, 'Node.js': 42 }
    ]
  },
  2023: {
    quarter: [
      { period: 'Q1', 'React Basics': 200, 'Python Intro': 165, 'JavaScript': 145, 'HTML/CSS': 125, 'Node.js': 105 },
      { period: 'Q2', 'React Basics': 220, 'Python Intro': 180, 'JavaScript': 160, 'HTML/CSS': 140, 'Node.js': 120 },
      { period: 'Q3', 'React Basics': 240, 'Python Intro': 195, 'JavaScript': 175, 'HTML/CSS': 155, 'Node.js': 135 },
      { period: 'Q4', 'React Basics': 260, 'Python Intro': 210, 'JavaScript': 190, 'HTML/CSS': 170, 'Node.js': 150 }
    ],
    month: [
      { period: 'Jan', 'React Basics': 65, 'Python Intro': 55, 'JavaScript': 48, 'HTML/CSS': 40, 'Node.js': 32 },
      { period: 'Feb', 'React Basics': 68, 'Python Intro': 58, 'JavaScript': 50, 'HTML/CSS': 42, 'Node.js': 35 },
      { period: 'Mar', 'React Basics': 72, 'Python Intro': 62, 'JavaScript': 55, 'HTML/CSS': 45, 'Node.js': 38 },
      { period: 'Apr', 'React Basics': 75, 'Python Intro': 65, 'JavaScript': 58, 'HTML/CSS': 48, 'Node.js': 40 },
      { period: 'May', 'React Basics': 78, 'Python Intro': 68, 'JavaScript': 62, 'HTML/CSS': 52, 'Node.js': 42 },
      { period: 'Jun', 'React Basics': 82, 'Python Intro': 72, 'JavaScript': 65, 'HTML/CSS': 55, 'Node.js': 45 },
      { period: 'Jul', 'React Basics': 85, 'Python Intro': 75, 'JavaScript': 68, 'HTML/CSS': 58, 'Node.js': 48 },
      { period: 'Aug', 'React Basics': 88, 'Python Intro': 78, 'JavaScript': 72, 'HTML/CSS': 62, 'Node.js': 52 },
      { period: 'Sep', 'React Basics': 92, 'Python Intro': 82, 'JavaScript': 75, 'HTML/CSS': 65, 'Node.js': 55 },
      { period: 'Oct', 'React Basics': 95, 'Python Intro': 85, 'JavaScript': 78, 'HTML/CSS': 68, 'Node.js': 58 },
      { period: 'Nov', 'React Basics': 98, 'Python Intro': 88, 'JavaScript': 82, 'HTML/CSS': 72, 'Node.js': 62 },
      { period: 'Dec', 'React Basics': 102, 'Python Intro': 92, 'JavaScript': 85, 'HTML/CSS': 75, 'Node.js': 65 }
    ]
  },
  2024: {
    quarter: [
      { period: 'Q1', 'React Basics': 280, 'Python Intro': 245, 'JavaScript': 220, 'HTML/CSS': 195, 'Node.js': 170 },
      { period: 'Q2', 'React Basics': 320, 'Python Intro': 280, 'JavaScript': 255, 'HTML/CSS': 225, 'Node.js': 195 },
      { period: 'Q3', 'React Basics': 350, 'Python Intro': 310, 'JavaScript': 285, 'HTML/CSS': 250, 'Node.js': 220 },
      { period: 'Q4', 'React Basics': 290, 'Python Intro': 260, 'JavaScript': 235, 'HTML/CSS': 210, 'Node.js': 185 }
    ],
    month: [
      { period: 'Jan', 'React Basics': 92, 'Python Intro': 82, 'JavaScript': 75, 'HTML/CSS': 65, 'Node.js': 55 },
      { period: 'Feb', 'React Basics': 95, 'Python Intro': 85, 'JavaScript': 78, 'HTML/CSS': 68, 'Node.js': 58 },
      { period: 'Mar', 'React Basics': 98, 'Python Intro': 88, 'JavaScript': 82, 'HTML/CSS': 72, 'Node.js': 62 },
      { period: 'Apr', 'React Basics': 105, 'Python Intro': 95, 'JavaScript': 88, 'HTML/CSS': 78, 'Node.js': 68 },
      { period: 'May', 'React Basics': 108, 'Python Intro': 98, 'JavaScript': 92, 'HTML/CSS': 82, 'Node.js': 72 },
      { period: 'Jun', 'React Basics': 112, 'Python Intro': 102, 'JavaScript': 95, 'HTML/CSS': 85, 'Node.js': 75 },
      { period: 'Jul', 'React Basics': 118, 'Python Intro': 108, 'JavaScript': 102, 'HTML/CSS': 92, 'Node.js': 82 },
      { period: 'Aug', 'React Basics': 122, 'Python Intro': 112, 'JavaScript': 105, 'HTML/CSS': 95, 'Node.js': 85 },
      { period: 'Sep', 'React Basics': 125, 'Python Intro': 115, 'JavaScript': 108, 'HTML/CSS': 98, 'Node.js': 88 },
      { period: 'Oct', 'React Basics': 102, 'Python Intro': 92, 'JavaScript': 85, 'HTML/CSS': 75, 'Node.js': 65 },
      { period: 'Nov', 'React Basics': 98, 'Python Intro': 88, 'JavaScript': 82, 'HTML/CSS': 72, 'Node.js': 62 },
      { period: 'Dec', 'React Basics': 95, 'Python Intro': 85, 'JavaScript': 78, 'HTML/CSS': 68, 'Node.js': 58 }
    ]
  }
};


import React, { useState } from 'react';
import { CourseWithVideos, VideoContent, coursesWithContent } from '@/lib/coursesData';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AddCourseDialog from '../components/AddCourseDialog';
import {
  BookOpen,
  Users,
  UserCheck,
  TrendingUp,
  Star,
  Calendar,
  Clock,
  Award,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Edit,
  Video,
  Trash2,
  Save
} from 'lucide-react';
import Footer from '@/components/ui/footer';

export default function Dashboard() {
  const [courses, setCourses] = useState<CourseWithVideos[]>(coursesWithContent);
  const [revenueYear, setRevenueYear] = useState(2024);
  const [revenuePeriod, setRevenuePeriod] = useState<'quarter' | 'month'>('month');
  const [studentsYear, setStudentsYear] = useState(2024);
  const [studentsPeriod, setStudentsPeriod] = useState<'quarter' | 'month'>('month');
  const [editingCourse, setEditingCourse] = useState<CourseWithVideos | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddCourseDialogOpen, setIsAddCourseDialogOpen] = useState(false);
  const categories = ["Programming", "Data Science", "AI/ML", "Design", "Business", "Marketing"];
  const [isUploadVideoDialogOpen, setIsUploadVideoDialogOpen] = useState(false);
  const [isScheduleEventDialogOpen, setIsScheduleEventDialogOpen] = useState(false);
  const [scheduledEvents, setScheduledEvents] = useState([]);
  const [eventForm, setEventForm] = useState({ title: '', date: '', time: '', description: '', courseId: '' });
  const [isIssueCertificateDialogOpen, setIsIssueCertificateDialogOpen] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [certificateForm, setCertificateForm] = useState({ student: '', courseId: '', date: '' });
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [uploadVideos, setUploadVideos] = useState([{ title: "", description: "", duration: "", file: null, uploadProgress: 0, url: "" }]);
  // Handle video file upload for upload dialog
  const handleUploadDialogVideoFileChange = (file, index) => {
    if (!file) return;
    const videoName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `videos/${videoName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        const updatedVideos = [...uploadVideos];
        updatedVideos[index].uploadProgress = progress;
        setUploadVideos(updatedVideos);
      },
      (error) => {
        alert('Video upload failed: ' + error.message);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          const updatedVideos = [...uploadVideos];
          updatedVideos[index].url = downloadURL;
          updatedVideos[index].uploadProgress = 100;
          setUploadVideos(updatedVideos);
        });
      }
    );
  };

  const addUploadDialogVideo = () => {
    setUploadVideos([...uploadVideos, { title: "", description: "", duration: "", file: null, uploadProgress: 0, url: "" }]);
  };

  const removeUploadDialogVideo = (index) => {
    setUploadVideos(uploadVideos.filter((_, i) => i !== index));
  };

  const handleUploadVideosToCourse = () => {
    if (!selectedCourseId) return;
    setCourses(courses.map(course => {
      if (course.id.toString() === selectedCourseId) {
        const nextOrder = course.videos.length + 1;
        const newVideos = uploadVideos.filter(v => v.url).map((v, i) => ({
          id: Date.now() + i,
          title: v.title,
          description: v.description,
          url: v.url,
          duration: v.duration,
          order: nextOrder + i
        }));
        return { ...course, videos: [...course.videos, ...newVideos] };
      }
      return course;
    }));
    setIsUploadVideoDialogOpen(false);
    setSelectedCourseId("");
    setUploadVideos([{ title: "", description: "", duration: "", file: null, uploadProgress: 0, url: "" }]);
  };

  // New course form state
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    instructor: "",
    videos: [{ title: "", description: "", url: "", duration: "", file: null, uploadProgress: 0 }]
  });

  // Edit course form state
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    videos: [] as (VideoContent & { file?: any; uploadProgress?: number })[]
  });

  // Handle video file upload for edit dialog
  const handleEditVideoFileChange = (file, index) => {
    if (!file) return;
    const videoName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `videos/${videoName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        const updatedVideos = [...editFormData.videos];
        updatedVideos[index].uploadProgress = progress;
        setEditFormData({ ...editFormData, videos: updatedVideos });
      },
      (error) => {
        alert('Video upload failed: ' + error.message);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          const updatedVideos = [...editFormData.videos];
          updatedVideos[index].url = downloadURL;
          updatedVideos[index].uploadProgress = 100;
          setEditFormData({ ...editFormData, videos: updatedVideos });
        });
      }
    );
  };

  const openEditDialog = (course: CourseWithVideos) => {
    setEditingCourse(course);
    setEditFormData({
      title: course.title,
      description: course.description,
      videos: [...course.videos]
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveCourse = () => {
    if (!editingCourse) return;

    const updatedCourses = courses.map(course =>
      course.id === editingCourse.id
        ? {
          ...course,
          title: editFormData.title,
          description: editFormData.description,
          videos: editFormData.videos
        }
        : course
    );

    setCourses(updatedCourses);
    setIsEditDialogOpen(false);
    setEditingCourse(null);
  };

  const handleAddCourse = () => {
    const newCourseData: CourseWithVideos = {
      id: Date.now(),
      title: newCourse.title,
      description: newCourse.description,
      instructor: newCourse.instructor,
      students: 0,
      rating: 0,
      status: "draft",
      progress: 0,
      category: "General", // Default or get from form if you have it
      price: 0, // Default or get from form if you have it
      duration: "0h 0m", // Default or calculate from videos if you want
      thumbnail: "", // Default or get from form/file upload if you have it
      videos: newCourse.videos.map((video, index) => ({
        id: Date.now() + index,
        title: video.title,
        description: video.description,
        url: video.url,
        duration: video.duration,
        order: index + 1
      }))
    };

    setCourses([...courses, newCourseData]);
    setIsAddCourseDialogOpen(false);
    setNewCourse({
      title: "",
      description: "",
      instructor: "",
      videos: [{ title: "", description: "", url: "", duration: "", file: null, uploadProgress: 0 }]
    });
  };

  const addVideoToNewCourse = () => {
    setNewCourse({
      ...newCourse,
      videos: [...newCourse.videos, { title: "", description: "", url: "", duration: "", file: null, uploadProgress: 0 }]
    });
  };

  // Handle video file upload
  const handleVideoFileChange = (file, index) => {
    if (!file) return;
    const videoName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `videos/${videoName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        const updatedVideos = [...newCourse.videos];
        updatedVideos[index].uploadProgress = progress;
        setNewCourse({ ...newCourse, videos: updatedVideos });
      },
      (error) => {
        alert('Video upload failed: ' + error.message);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          const updatedVideos = [...newCourse.videos];
          updatedVideos[index].url = downloadURL;
          updatedVideos[index].uploadProgress = 100;
          setNewCourse({ ...newCourse, videos: updatedVideos });
        });
      }
    );
  };

  const addVideoToEditCourse = () => {
    setEditFormData({
      ...editFormData,
      videos: [...editFormData.videos, {
        id: Date.now(),
        title: "",
        description: "",
        url: "",
        duration: "",
        order: editFormData.videos.length + 1
      }]
    });
  };

  const removeVideoFromEditCourse = (videoId: number) => {
    setEditFormData({
      ...editFormData,
      videos: editFormData.videos.filter(video => video.id !== videoId)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Manage your course content and platform.</p>
        </div>
        <AddCourseDialog
          open={isAddCourseDialogOpen}
          setOpen={setIsAddCourseDialogOpen}
          categories={categories}
          onAddCourse={(newCourse) => {
            setCourses([
              ...courses,
              {
                ...newCourse,
                id: Date.now().toString(),
                instructors: newCourse.instructors.filter((i) => i.trim() !== ""),
                videos: newCourse.videos.map((v, idx) => ({ ...v, order: idx + 1, id: v.id || Date.now() + idx })),
                students: 0,
                rating: 0,
                status: newCourse.status,
                progress: 0,
                thumbnail: newCourse.thumbnail,
              },
            ]);
          }}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {stat.changeType === "increase" ? (
                    <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-1 text-red-500" />
                  )}
                  <span className={stat.changeType === "increase" ? "text-green-500" : "text-red-500"}>
                    {stat.change}
                  </span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Track revenue performance over time</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={revenueYear.toString()} onValueChange={(value) => setRevenueYear(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={revenuePeriod} onValueChange={(value: 'quarter' | 'month') => setRevenuePeriod(value)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData[revenueYear]?.[revenuePeriod] || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="period"
                    className="text-muted-foreground"
                    fontSize={12}
                  />
                  <YAxis
                    className="text-muted-foreground"
                    fontSize={12}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Active Students Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Students</CardTitle>
                <CardDescription>Monitor student engagement trends</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={studentsYear.toString()} onValueChange={(value) => setStudentsYear(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={studentsPeriod} onValueChange={(value: 'quarter' | 'month') => setStudentsPeriod(value)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activeStudentsData[studentsYear]?.[studentsPeriod] || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="period"
                    className="text-muted-foreground"
                    fontSize={12}
                  />
                  <YAxis
                    className="text-muted-foreground"
                    fontSize={12}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), 'Active Students']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--accent-foreground))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--accent-foreground))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--accent-foreground))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* top  Courses */}

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 gap-6 w-full">
  <Card className="w-full">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>Top Courses Analytics</CardTitle>
          <CardDescription>Track revenue performance over time</CardDescription>
        </div>
        <div className="flex gap-2">
          <Select value={revenueYear.toString()} onValueChange={(value) => setRevenueYear(parseInt(value))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={revenuePeriod} onValueChange={(value: 'quarter' | 'month') => setRevenuePeriod(value)}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border">
          <thead>
            <tr>
              <th>Period</th>
              <th>React Basics</th>
              <th>Python Intro</th>
              <th>JavaScript</th>
              <th>HTML/CSS</th>
              <th>Node.js</th>
            </tr>
          </thead>
          <tbody>
            {topCoursesData[revenueYear][revenuePeriod].map((data) => (
              <tr key={data.period}>
                <td>{data.period}</td>
                <td>{data['React Basics']}</td>
                <td>{data['Python Intro']}</td>
                <td>{data['JavaScript']}</td>
                <td>{data['HTML/CSS']}</td>
                <td>{data['Node.js']}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>


        </div>
        
      </div>
<Footer/>
</div>
  );
}
