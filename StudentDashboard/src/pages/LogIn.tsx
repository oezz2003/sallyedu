import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { Lock, Mail } from "lucide-react";
import { Navigation } from "@/components/Navigation";


export function LoginPage() {
  const { t, language } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // استدعاء API الباك إند
      const response = await fetch("https://ela-ee0o.onrender.com/user/logIn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        setIsSubmitting(false);
        return;
      }

      // احفظ التوكن + بيانات اليوزر
       localStorage.setItem("token", data.token.role);
      localStorage.setItem("refreshToken", data.ref_token);
        localStorage.setItem("role", data.role); 
      localStorage.setItem("isAuthenticated", "true");
      console.log("Role:", data.token.role, data.role);

       if (data.token.role === "Admin" || data.role === "Admin") {
        window.location.href = "http://localhost:8081/"; // Admin dashboard route
      } else {
  window.location.href = "http://localhost:8080/student-dashboard"; // Student dashboard route
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong, please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto p-8 rounded-xl border border-border bg-card shadow-lg">
          <div className="flex flex-col space-y-6">
            {/* Academy Logo */}
            <div className="text-center">
              <img
                src="https://smartonlinelearningedu.com/static/media/WhatsApp%20Image%202025-05-26%20at%2000.38.02_5277dbf4.f388d82bb2a41fa81dbf.jpg"
                alt={t("nav.academy")}
                className="h-20 w-20 object-cover rounded-full mx-auto mb-4 shadow-md"
              />
              <h2 className="text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-4">
                {t("nav.academy")}
              </h2>
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {language === "ar" ? "تسجيل الدخول" : "Login to your account"}
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                {language === "ar" 
                  ? "أي بيانات ستقوم بإدخالها ستؤدي إلى الدخول" 
                  : "Any credentials you enter will allow you to login"
                }
              </p>
            </div>

            <form className="space-y-4" onSubmit={login}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  {language === "ar" ? "البريد الإلكتروني" : "Email"}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={language === "ar" ? "student@example.com" : "student@example.com"}
                    className="pl-10 border-border bg-background text-foreground placeholder:text-muted-foreground"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  {language === "ar" ? "كلمة المرور" : "Password"}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 border-border bg-background text-foreground placeholder:text-muted-foreground"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting 
                  ? (language === "ar" ? "جاري الدخول..." : "Signing in...") 
                  : (language === "ar" ? "دخول" : "Sign in")
                }
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {language === "ar" 
                  ? "يمكنك إدخال أي بيانات للدخول إلى الداشبورد" 
                  : "You can enter any credentials to access the dashboard"
                }
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}