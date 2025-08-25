import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StudentLayout from "@/components/studentLayout";
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Circle, 
  Clock, 
  BookOpen, 
  ArrowLeft,
  Volume2,
  Settings,
  Maximize,
  SkipBack,
  SkipForward,
  User,
  Star,
  Download,
  MessageSquare
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  videoUrl: string;
  description: string;
  resources?: string[];
}

interface Course {
  id: string;
  title: string;
  instructor: string;
  instructorAvatar: string;
  totalLessons: number;
  completedLessons: number;
  totalDuration: string;
  category: string;
  lessons: Lesson[];
}

const mockCourses: { [key: string]: Course } = {
  "1": {
    id: "1",
    title: "مقدمة في البرمجة",
    instructor: "د. محمد أحمد",
    instructorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    totalLessons: 12,
    completedLessons: 8,
    totalDuration: "42 ساعة",
    category: "برمجة",
    lessons: [
      {
        id: "1",
        title: "مقدمة في البرمجة",
        duration: "12:34",
        isCompleted: true,
        videoUrl: "https://youtu.be/GhTu53CRtJc?si=iDQN6rWAt0ElzP_X",
        description: "تعلم أساسيات البرمجة ولماذا هي مهمة",
        resources: ["العروض التقديمية.pdf", "أمثلة الكود.zip"]
      },
      {
        id: "2",
        title: "إعداد بيئة التطوير",
        duration: "18:22",
        isCompleted: true,
        videoUrl: "https://youtu.be/GhTu53CRtJc?si=iDQN6rWAt0ElzP_X",
        description: "كيفية إعداد الأدوات اللازمة للبرمجة",
        resources: ["دليل الإعداد.pdf"]
      },
      {
        id: "3",
        title: "المتغيرات وأنواع البيانات",
        duration: "25:16",
        isCompleted: true,
        videoUrl: "https://youtu.be/GhTu53CRtJc?si=iDQN6rWAt0ElzP_X",
        description: "فهم المتغيرات وأنواع البيانات المختلفة",
        resources: ["ملخص المتغيرات.pdf"]
      },
      {
        id: "4",
        title: "الدوال والعمليات",
        duration: "32:45",
        isCompleted: true,
        videoUrl: "https://youtu.be/GhTu53CRtJc?si=iDQN6rWAt0ElzP_X",
        description: "تعلم كيفية إنشاء واستخدام الدوال"
      },
      {
        id: "5",
        title: "التحكم في التدفق",
        duration: "28:33",
        isCompleted: true,
        videoUrl: "https://youtu.be/GhTu53CRtJc?si=iDQN6rWAt0ElzP_X",
        description: "استخدام الشروط والحلقات في البرمجة"
      },
      {
        id: "6",
        title: "المصفوفات والكائنات",
        duration: "35:12",
        isCompleted: true,
        videoUrl: "https://youtu.be/GhTu53CRtJc?si=iDQN6rWAt0ElzP_X",
        description: "العمل مع هياكل البيانات المعقدة"
      },
      {
        id: "7",
        title: "معالجة الأخطاء",
        duration: "29:48",
        isCompleted: true,
        videoUrl: "https://youtu.be/GhTu53CRtJc?si=iDQN6rWAt0ElzP_X",
        description: "كيفية التعامل مع الأخطاء في البرمجة"
      },
      {
        id: "8",
        title: "البرمجة الكائنية",
        duration: "24:56",
        isCompleted: true,
        videoUrl: "https://youtu.be/GhTu53CRtJc?si=iDQN6rWAt0ElzP_X",
        description: "مفاهيم البرمجة الموجهة للكائنات"
      },
      {
        id: "9",
        title: "التعامل مع الملفات",
        duration: "31:22",
        isCompleted: false,
        videoUrl: "https://youtu.be/GhTu53CRtJc?si=iDQN6rWAt0ElzP_X",
        description: "قراءة وكتابة الملفات في البرمجة"
      },
      {
        id: "10",
        title: "قواعد البيانات الأساسية",
        duration: "26:18",
        isCompleted: false,
        videoUrl: "https://youtu.be/GhTu53CRtJc?si=iDQN6rWAt0ElzP_X",
        description: "مقدمة لقواعد البيانات وSQL"
      },
      {
        id: "11",
        title: "تحسين الأداء",
        duration: "38:42",
        isCompleted: false,
        videoUrl: "https://youtu.be/GhTu53CRtJc?si=iDQN6rWAt0ElzP_X",
        description: "تحسين أداء البرامج والخوارزميات"
      },
      {
        id: "12",
        title: "مشروع التخرج",
        duration: "22:15",
        isCompleted: false,
        videoUrl: "https://youtu.be/GhTu53CRtJc?si=iDQN6rWAt0ElzP_X",
        description: "بناء مشروع شامل لتطبيق ما تعلمته"
      }
    ]
  },
  "2": {
    id: "2",
    title: "تطوير تطبيقات الويب",
    instructor: "أ. سارة خالد",
    instructorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b1c5?w=100&h=100&fit=crop&crop=face",
    totalLessons: 15,
    completedLessons: 15,
    totalDuration: "35 ساعة",
    category: "تطوير الويب",
    lessons: [
      {
        id: "1",
        title: "HTML الأساسي",
        duration: "20:15",
        isCompleted: true,
        videoUrl: "https://youtu.be/GhTu53CRtJc?si=iDQN6rWAt0ElzP_X",
        description: "تعلم أساسيات HTML لبناء صفحات الويب"
      },
      {
        id: "2",
        title: "CSS للتصميم",
        duration: "25:30",
        isCompleted: true,
        videoUrl: "https://youtu.be/GhTu53CRtJc?si=iDQN6rWAt0ElzP_X",
        description: "استخدام CSS لتنسيق وتصميم المواقع"
      },
      {
        id: "3",
        title: "JavaScript التفاعلي",
        duration: "30:45",
        isCompleted: true,
        videoUrl: "https://youtu.be/GhTu53CRtJc?si=iDQN6rWAt0ElzP_X",
        description: "إضافة التفاعل للمواقع باستخدام JavaScript"
      }
      // Add more lessons as needed
    ]
  },
  "3": {
    id: "3",
    title: "قواعد البيانات",
    instructor: "د. أحمد علي",
    instructorAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
    totalLessons: 10,
    completedLessons: 4,
    totalDuration: "28 ساعة",
    category: "قواعد البيانات",
    lessons: [
      {
        id: "1",
        title: "مقدمة في قواعد البيانات",
        duration: "18:20",
        isCompleted: true,
        videoUrl: "https://youtu.be/GhTu53CRtJc?si=iDQN6rWAt0ElzP_X",
        description: "أساسيات قواعد البيانات ومفاهيمها"
      },
      {
        id: "2",
        title: "SQL الأساسي",
        duration: "22:45",
        isCompleted: true,
        videoUrl: "https://youtu.be/GhTu53CRtJc?si=iDQN6rWAt0ElzP_X",
        description: "تعلم لغة SQL للتعامل مع قواعد البيانات"
      }
      // Add more lessons as needed
    ]
  },
  "4": {
    id: "4",
    title: "أمن المعلومات",
    instructor: "د. فاطمة محمد",
    instructorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
    totalLessons: 8,
    completedLessons: 0,
    totalDuration: "24 ساعة",
    category: "الأمن السيبراني",
    lessons: [
      {
        id: "1",
        title: "مقدمة في أمن المعلومات",
        duration: "15:30",
        isCompleted: false,
        videoUrl: "https://youtu.be/GhTu53CRtJc?si=iDQN6rWAt0ElzP_X",
        description: "أساسيات أمن المعلومات والمخاطر السيبرانية"
      }
      // Add more lessons as needed
    ]
  },
  "5": {
    id: "5",
    title: "تعلم الآلة",
    instructor: "د. عمر حسن",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    totalLessons: 12,
    completedLessons: 9,
    totalDuration: "45 ساعة",
    category: "الذكاء الاصطناعي",
    lessons: [
      {
        id: "1",
        title: "مقدمة في تعلم الآلة",
        duration: "20:15",
        isCompleted: true,
        videoUrl: "https://youtu.be/GhTu53CRtJc?si=iDQN6rWAt0ElzP_X",
        description: "أساسيات الذكاء الاصطناعي وتعلم الآلة"
      }
      // Add more lessons as needed
    ]
  }
};

export default function Learning() {
  const { courseId } = useParams();
  
  // Get the course data based on courseId, fallback to course "1" if not found
  const currentCourse = mockCourses[courseId || "1"] || mockCourses["1"];
  
  const [currentLesson, setCurrentLesson] = useState<Lesson>(currentCourse.lessons[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");

  // Update current lesson when course changes
  useEffect(() => {
    setCurrentLesson(currentCourse.lessons[0]);
  }, [courseId, currentCourse]);


  const handleLessonClick = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setIsPlaying(false);
  };

  const markAsCompleted = (lessonId: string) => {
    // In a real app, this would update the backend
    const lesson = currentCourse.lessons.find(l => l.id === lessonId);
    if (lesson) {
      lesson.isCompleted = true;
      currentCourse.completedLessons += 1;
    }
  };

  const goToNextLesson = () => {
    const currentIndex = currentCourse.lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex < currentCourse.lessons.length - 1) {
      setCurrentLesson(currentCourse.lessons[currentIndex + 1]);
      setIsPlaying(false);
    }
  };

  const goToPreviousLesson = () => {
    const currentIndex = currentCourse.lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex > 0) {
      setCurrentLesson(currentCourse.lessons[currentIndex - 1]);
      setIsPlaying(false);
    }
  };

  return (
    <StudentLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background">
          <div className="flex items-center space-x-4">
            <Link to="/student-dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                العودة للوحة التحكم
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">{currentCourse.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{currentCourse.instructor}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{currentCourse.completedLessons}/{currentCourse.totalLessons} دروس</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{currentCourse.totalDuration}</span>
                </div>
              </div>
            </div>
          </div>
          

        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Lessons Sidebar */}
          <div className="lg:col-span-1 border-r border-border bg-muted/30">
            <div className="p-4 border-b border-border bg-background">
              <h2 className="font-semibold text-foreground">محتوى الدورة</h2>
              <p className="text-sm text-muted-foreground">{currentCourse.totalLessons} دروس • {currentCourse.totalDuration}</p>
            </div>
            
            <div className="overflow-y-auto h-full">
              <div className="space-y-1 p-2">
                {currentCourse.lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      currentLesson.id === lesson.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-accent hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {lesson.isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">
                            {index + 1}. {lesson.title}
                          </span>
                          {currentLesson.id === lesson.id && (
                            <Play className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                          {lesson.isCompleted && (
                            <Badge variant="secondary" className="text-xs">
                              مكتمل
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className="lg:col-span-2 flex flex-col bg-black">
            <div className="flex-1 flex items-center justify-center relative">
              <video
                className="w-full h-full object-contain"
                controls
                poster="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop"
                src={currentLesson.videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            
            {/* Video Controls & Info */}
            <div className="bg-background border-t border-border">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{currentLesson.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{currentLesson.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousLesson}
                      disabled={currentCourse.lessons[0].id === currentLesson.id}
                    >
                      <SkipBack className="w-4 h-4" />
                    </Button>
                    
                    {!currentLesson.isCompleted && (
                      <Button
                        onClick={() => markAsCompleted(currentLesson.id)}
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        تمييز كمكتمل
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextLesson}
                      disabled={currentCourse.lessons[currentCourse.lessons.length - 1].id === currentLesson.id}
                    >
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Lesson Resources */}
                {currentLesson.resources && currentLesson.resources.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <h4 className="font-medium text-foreground mb-2">موارد الدرس</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentLesson.resources.map((resource, index) => (
                        <Button key={index} variant="outline" size="sm">
                          <Download className="w-3 h-3 mr-2" />
                          {resource}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Quick Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      أسئلة وأجوبة
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Star className="w-4 h-4 mr-2" />
                      تقييم الدرس
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    الدرس {currentCourse.lessons.findIndex(l => l.id === currentLesson.id) + 1} من {currentCourse.totalLessons}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
