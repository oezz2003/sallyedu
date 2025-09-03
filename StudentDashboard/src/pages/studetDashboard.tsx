// src/pages/Index.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, CheckCircle, Users, Star, User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import StudentLayout from "@/components/studentLayout";
import { useAuth } from "@/lib/useAuth";
import { useI18n } from "@/lib/i18n";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEnrollments } from "@/hooks/useEnrollments";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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

// Mock courses data - this will be replaced with enrolled courses
const allCoursesData: Course[] = [
  {
    id: "1",
    title: "German Course",
    image: "/api/placeholder/300/200",
    isCompleted: false,
    instructor: "Jonas Schmedtmann",
    totalLessons: 156,
    completedLessons: 23,
    category: "Languages",
    rating: 4.8,
    students: 85000,
  },
  {
    id: "2",
    title: "Python for Data Science",
    image: "/api/placeholder/300/200",
    isCompleted: true,
    instructor: "Dr. Sarah Chen",
    totalLessons: 128,
    completedLessons: 128,
    category: "Development",
    rating: 4.7,
    students: 45000,
  },
  {
    id: "3",
    title: "Full Stack Web Development",
    image: "/api/placeholder/300/200",
    isCompleted: false,
    instructor: "Michael Rodriguez",
    totalLessons: 220,
    completedLessons: 85,
    category: "Development",
    rating: 4.9,
    students: 95000,
  },
  {
    id: "4",
    title: "Advanced CSS and Sass Masterclass",
    image: "/api/placeholder/300/200",
    isCompleted: false,
    instructor: "Emma Williams",
    totalLessons: 95,
    completedLessons: 32,
    category: "Development",
    rating: 4.6,
    students: 28000,
  },
];

export default function Index() {
  const { user } = useAuth();
  const { userProfile, loading, error, getDisplayName } = useUserProfile();
  const { enrollments } = useEnrollments();
  const { t, language } = useI18n();
  const [activeTab, setActiveTab] = useState<"all" | "completed">("all");
  
  // Transform enrollments to course data with progress info
  const enrolledCourses: Course[] = enrollments.map(enrollment => {
    // Find course data from our mock data (in real app, this would come from API)
    const courseData = allCoursesData.find(course => course.id === enrollment.courseId);
    
    if (!courseData) {
      // Fallback course data if not found
      return {
        id: enrollment.courseId,
        title: `Course ${enrollment.courseId}`,
        image: "/api/placeholder/300/200",
        isCompleted: enrollment.status === 'completed',
        instructor: "Unknown Instructor",
        totalLessons: enrollment.totalLessons,
        completedLessons: enrollment.completedLessons,
        category: "General",
        rating: 4.5,
        students: 1000,
      };
    }
    
    return {
      ...courseData,
      isCompleted: enrollment.status === 'completed',
      totalLessons: enrollment.totalLessons,
      completedLessons: enrollment.completedLessons,
    };
  });
  
  const completedCourses = enrolledCourses.filter((course) => course.isCompleted);

  const getDisplayCourses = () => {
    switch (activeTab) {
      case "completed":
        return completedCourses;
      default:
        return enrolledCourses;
    }
  };

  // If no enrollments, show empty state
  if (!loading && enrollments.length === 0) {
    return (
      <StudentLayout>
        {/* User Profile Header */}
        {userProfile && (
          <Card className="mb-6 bg-gradient-to-r from-primary/10 to-blue-600/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="w-20 h-20 border-4 border-primary/20">
                  <AvatarImage src={userProfile.avatar} alt={getDisplayName()} />
                  <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                    {userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {language === "ar" ? `مرحباً بعودتك، ${getDisplayName()}!` : `Welcome back, ${getDisplayName()}!`}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      {language === "ar" ? "ابدأ رحلة التعلم وحقق أهدافك" : "Start your learning journey and achieve your goals"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {language === "ar" ? "لا توجد دورات مسجلة" : "No Courses Enrolled"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === "ar" 
                ? "لم تسجل في أي دورة بعد. استكشف متجر الدورات للعثور على الدورة المثالية لك."
                : "You haven't enrolled in any courses yet. Explore our course store to find the perfect course for you."
              }
            </p>
            <Link to="/store">
              <Button>
                {language === "ar" ? "استكشف الدورات" : "Explore Courses"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </StudentLayout>
    );
  }

  // Show loading state while fetching user profile
  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              {language === "ar" ? "جاري تحميل البيانات..." : "Loading profile..."}
            </p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      {/* User Profile Header */}
      {userProfile && (
        <Card className="mb-6 bg-gradient-to-r from-primary/10 to-blue-600/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-20 h-20 border-4 border-primary/20">
                <AvatarImage src={userProfile.avatar} alt={getDisplayName()} />
                <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                  {userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {language === "ar" ? `مرحباً بعودتك، ${getDisplayName()}!` : `Welcome back, ${getDisplayName()}!`}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {language === "ar" ? "استمر في رحلة التعلم وحقق أهدافك" : "Continue your learning journey and achieve your goals"}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{userProfile.email}</span>
                  </div>
                  {userProfile.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{userProfile.phone}</span>
                    </div>
                  )}
                  {userProfile.country && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{userProfile.country}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {language === "ar" 
                      ? (userProfile.accountType === 'student' ? 'طالب' : 'بالغ')
                      : (userProfile.accountType === 'student' ? 'Student' : 'Adult')
                    }
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {language === "ar" ? `العمر: ${userProfile.age}` : `Age: ${userProfile.age}`}
                  </Badge>
                  {userProfile.isEmailVerified && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {language === "ar" ? "تم التحقق" : "Verified"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Original Welcome Section - Show if no profile data */}
      {!userProfile && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {language === "ar" ? `مرحباً بعودتك، ${user?.displayName || 'الطالب'}!` : `Welcome back, ${user?.displayName || 'Student'}!`}
          </h2>
          <p className="text-muted-foreground">
            {language === "ar" ? "استمر في رحلة التعلم وحقق أهدافك." : "Continue your learning journey and achieve your goals."}
          </p>
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
                <p className="text-2xl font-bold text-foreground">{enrolledCourses.length}</p>
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
                <p className="text-2xl font-bold text-foreground">{enrolledCourses.length}</p>
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

      {getDisplayCourses().length === 0 && (
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