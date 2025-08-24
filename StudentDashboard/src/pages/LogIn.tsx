import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { Lock, Mail } from "lucide-react";
import { Navigation } from "@/components/Navigation";

export function LoginPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  function login(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate loading
    setTimeout(() => {
      // Set default user data in localStorage
      const defaultUser = {
        uid: "default-user-123",
        email: email || "student@example.com",
        displayName: "أحمد محمد",
        firstName: "أحمد",
        lastName: "محمد",
        isDefaultUser: true
      };
      
      localStorage.setItem("defaultUser", JSON.stringify(defaultUser));
      localStorage.setItem("isLoggedIn", "true");
      
      setIsSubmitting(false);
      navigate("/student-dashboard", { replace: true });
    }, 1000);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto p-8 rounded-xl border border-border bg-card shadow-lg">
          <div className="flex flex-col space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("Login to your account")}
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                أي بيانات ستقوم بإدخالها ستؤدي إلى الدخول
              </p>
            </div>

            <form className="space-y-4" onSubmit={login}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">{t("email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("student@example.com")}
                    className="pl-10 border-border bg-background text-foreground placeholder:text-muted-foreground"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">{t("password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("password")}
                    className="pl-10 border-border bg-background text-foreground placeholder:text-muted-foreground"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "جاري الدخول..." : "دخول"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                يمكنك إدخال أي بيانات للدخول إلى الداشبورد
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}