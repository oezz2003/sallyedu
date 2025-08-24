// src/pages/Index.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, CheckCircle, Users, Star } from "lucide-react";
import StudentLayout from "@/components/studentLayout";
import { useAuth } from "@/lib/useAuth";

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
  const [activeTab, setActiveTab] = useState<"all" | "completed">("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string>("أحمد");

  // Default courses data
  const defaultCourses: Course[] = [
    {
      id: "1",
      title: "مقدمة في البرمجة",
      image: "/src/data/1.png",
      isCompleted: false,
      instructor: "د. محمد أحمد",
      totalLessons: 20,
      completedLessons: 15,
      category: "برمجة",
      rating: 4.8,
      students: 1250
    },
    {
      id: "2",
      title: "تطوير تطبيقات الويب",
      image: "/src/data/2.png",
      isCompleted: true,
      instructor: "أ. سارة خالد",
      totalLessons: 25,
      completedLessons: 25,
      category: "تطوير الويب",
      rating: 4.9,
      students: 2100
    },
    {
      id: "3",
      title: "قواعد البيانات",
      image: "/src/data/3.png",
      isCompleted: false,
      instructor: "د. أحمد علي",
      totalLessons: 18,
      completedLessons: 8,
      category: "قواعد البيانات",
      rating: 4.7,
      students: 980
    },
    {
      id: "4",
      title: "أمن المعلومات",
      image: "/src/data/4.png",
      isCompleted: false,
      instructor: "د. فاطمة محمد",
      totalLessons: 15,
      completedLessons: 0,
      category: "الأمن السيبراني",
      rating: 4.6,
      students: 750
    },
    {
      id: "5",
      title: "تعلم الآلة",
      image: "/src/data/5.png",
      isCompleted: false,
      instructor: "د. عمر حسن",
      totalLessons: 30,
      completedLessons: 27,
      category: "الذكاء الاصطناعي",
      rating: 4.9,
      students: 1800
    }
  ];

  useEffect(() => {
    // Set display name from user data
    if (user) {
      setDisplayName(user.firstName || "أحمد");
    }

    // Simulate loading
    setTimeout(() => {
      setCourses(defaultCourses);
      setLoading(false);
    }, 1000);
  }, [user]);

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
          مرحباً بعودتك، {displayName}!
        </h2>
        <p className="text-muted-foreground">استمر في رحلة التعلم وحقق أهدافك.</p>
      </div>

      {/* Loading / Error */}
      {loading && <div className="py-6 text-center text-muted-foreground">جاري تحميل الدورات...</div>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الدورات</p>
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
                <p className="text-sm font-medium text-muted-foreground">مكتملة</p>
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
          جميع الدورات ({courses.length})
        </Button>

        <Button
          variant={activeTab === "completed" ? "default" : "outline"}
          onClick={() => setActiveTab("completed")}
          className="rounded-full"
        >
          مكتملة ({completedCourses.length})
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
                  <span>مكتملة</span>
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
                  <span>{(course.students / 1000).toFixed(1)}k طالب</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">بواسطة {course.instructor}</p>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">
                    {course.completedLessons}/{course.totalLessons} درس
                  </span>
                </div>

                <Link to="/Learn" className="w-full">
                  <Button
                    className="w-full mt-2"
                    variant={course.isCompleted ? "outline" : "default"}
                  >
                    {course.isCompleted ? "مراجعة الدورة" : "استمر في التعلم"}
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
          <h3 className="text-lg font-medium text-foreground mb-2">لم يتم العثور على دورات</h3>
          <p className="text-muted-foreground">
            {activeTab === "completed"
              ? "لم تكمل أي دورات بعد."
              : "لم يتم العثور على دورات."}
          </p>
        </div>
      )}
    </StudentLayout>
  );
}