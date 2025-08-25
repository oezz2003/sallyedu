// src/pages/Index.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, CheckCircle, Users, Star } from "lucide-react";
import StudentLayout from "@/components/studentLayout";
import { useAuth } from "@/lib/useAuth";
import { useI18n } from "@/lib/i18n";

interface Course {
  id: string;
  title: string;
  image: string;
  isCompleted: boolean;
  instructor: string;
  totalLessons: number;
  completedLessons: number;
  category: string;
  rating: number;
  students: number;
}

export default function Index() {
  const { user } = useAuth();
  const { t, language } = useI18n();
  const [activeTab, setActiveTab] = useState<"all" | "completed">("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string>(language === "ar" ? "أحمد" : "Ahmed");

  // Default courses data
  const defaultCourses: Course[] = [
    {
      id: "1",
      title: language === "ar" ? "مقدمة في البرمجة" : "Introduction to Programming",
      image: "/src/data/1.png",
      isCompleted: false,
      instructor: language === "ar" ? "د. محمد أحمد" : "Dr. Mohammed Ahmed",
      totalLessons: 20,
      completedLessons: 15,
      category: language === "ar" ? "برمجة" : "Programming",
      rating: 4.8,
      students: 1250
    },
    {
      id: "2",
      title: language === "ar" ? "تطوير تطبيقات الويب" : "Web Application Development",
      image: "/src/data/2.png",
      isCompleted: true,
      instructor: language === "ar" ? "أ. سارة خالد" : "Prof. Sarah Khaled",
      totalLessons: 25,
      completedLessons: 25,
      category: language === "ar" ? "تطوير الويب" : "Web Development",
      rating: 4.9,
      students: 2100
    },
    {
      id: "3",
      title: language === "ar" ? "قواعد البيانات" : "Database Management",
      image: "/src/data/3.png",
      isCompleted: false,
      instructor: language === "ar" ? "د. أحمد علي" : "Dr. Ahmed Ali",
      totalLessons: 18,
      completedLessons: 8,
      category: language === "ar" ? "قواعد البيانات" : "Databases",
      rating: 4.7,
      students: 980
    },
    {
      id: "4",
      title: language === "ar" ? "أمن المعلومات" : "Information Security",
      image: "/src/data/4.png",
      isCompleted: false,
      instructor: language === "ar" ? "د. فاطمة محمد" : "Dr. Fatima Mohammed",
      totalLessons: 15,
      completedLessons: 0,
      category: language === "ar" ? "الأمن السيبراني" : "Cybersecurity",
      rating: 4.6,
      students: 750
    },
    {
      id: "5",
      title: language === "ar" ? "تعلم الآلة" : "Machine Learning",
      image: "/src/data/5.png",
      isCompleted: false,
      instructor: language === "ar" ? "د. عمر حسن" : "Dr. Omar Hassan",
      totalLessons: 30,
      completedLessons: 27,
      category: language === "ar" ? "الذكاء الاصطناعي" : "Artificial Intelligence",
      rating: 4.9,
      students: 1800
    }
  ];

  useEffect(() => {
    // Set display name from user data
    if (user) {
      setDisplayName(user.firstName || (language === "ar" ? "أحمد" : "Ahmed"));
    } else {
      setDisplayName(language === "ar" ? "أحمد" : "Ahmed");
    }

    // Simulate loading
    setTimeout(() => {
      setCourses(defaultCourses);
      setLoading(false);
    }, 1000);
  }, [user, language, defaultCourses]);

  const completedCourses = courses.filter((course) => course.isCompleted);

  const getDisplayCourses = () => {
    switch (activeTab) {
      case "completed":
        return completedCourses;
      default:
        return courses;
    }
  };



  return (
    <StudentLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {language === "ar" ? `مرحباً بعودتك، ${displayName}!` : `Welcome back, ${displayName}!`}
        </h2>
        <p className="text-muted-foreground">
          {language === "ar" ? "استمر في رحلة التعلم وحقق أهدافك." : "Continue your learning journey and achieve your goals."}
        </p>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="py-6 text-center text-muted-foreground">
          {language === "ar" ? "جاري تحميل الدورات..." : "Loading courses..."}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === "ar" ? "إجمالي الدورات" : "Total Courses"}
                </p>
                <p className="text-2xl font-bold text-foreground">{courses.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === "ar" ? "مكتملة" : "Completed"}
                </p>
                <p className="text-2xl font-bold text-foreground">{completedCourses.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>


      </div>

      {/* Course Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={activeTab === "all" ? "default" : "outline"}
          onClick={() => setActiveTab("all")}
          className="rounded-full"
        >
          {language === "ar" ? `جميع الدورات (${courses.length})` : `All Courses (${courses.length})`}
        </Button>

        <Button
          variant={activeTab === "completed" ? "default" : "outline"}
          onClick={() => setActiveTab("completed")}
          className="rounded-full"
        >
          {language === "ar" ? `مكتملة (${completedCourses.length})` : `Completed (${completedCourses.length})`}
        </Button>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getDisplayCourses().map((course) => (
          <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden bg-card border-border">
            <div className="relative">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {course.isCompleted && (
                <div className="absolute top-3 right-3 bg-success text-success-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>{language === "ar" ? "مكتملة" : "Completed"}</span>
                </div>
              )}
              <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-foreground border border-border">
                {course.category}
              </div>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors text-foreground">
                {course.title}
              </CardTitle>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-warning text-warning" />
                  <span>{course.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>
                    {(course.students / 1000).toFixed(1)}k {language === "ar" ? "طالب" : "students"}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === "ar" ? `بواسطة ${course.instructor}` : `By ${course.instructor}`}
              </p>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">
                    {course.completedLessons}/{course.totalLessons} {language === "ar" ? "درس" : "lessons"}
                  </span>
                </div>

                <Link to={`/learn/${course.id}`} className="w-full">
                  <Button
                    className="w-full mt-2"
                    variant={course.isCompleted ? "outline" : "default"}
                  >
                    {course.isCompleted 
                      ? (language === "ar" ? "مراجعة الدورة" : "Review Course")
                      : (language === "ar" ? "استمر في التعلم" : "Continue Learning")
                    }
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {getDisplayCourses().length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {language === "ar" ? "لم يتم العثور على دورات" : "No courses found"}
          </h3>
          <p className="text-muted-foreground">
            {activeTab === "completed"
              ? (language === "ar" ? "لم تكمل أي دورات بعد." : "No completed courses yet.")
              : (language === "ar" ? "لم يتم العثور على دورات." : "No courses found.")}
          </p>
        </div>
      )}
    </StudentLayout>
  );
}