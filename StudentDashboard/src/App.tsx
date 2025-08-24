import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import GeolocationPopup from "./components/features/geolocationPushUp";
import { LoginPage } from "./pages/LogIn";
import { SignUpPage } from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ScrollToTop from "./components/ScrollToTop";

import Rewards from "./pages/Rewards";
import Store from "./pages/Store";
import StudentDashboard from "./pages/studetDashboard";
import EditProfile from "./pages/EditProfile";

// Auth imports
import { AuthProvider } from "@/lib/useAuth";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="smart-learning-theme">
        <I18nProvider>
          <BrowserRouter>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <ScrollToTop />
              <AuthProvider>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/course/:id" element={<CourseDetails />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/LogIn" element={<LoginPage />} />
                  <Route path="/SignUp" element={<SignUpPage />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  
                                       {/* Dashboard Routes - No Protection Needed */}
                     <Route path="/student-dashboard" element={<StudentDashboard />} />
                     <Route path="/profile" element={<EditProfile />} />
                     <Route path="/Store" element={<Store />} />
                  
                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthProvider>
              <GeolocationPopup />
            </TooltipProvider>
          </BrowserRouter>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}