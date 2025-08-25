import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  LogOut,
  HeadphonesIcon,
  ChevronDown,
  Settings,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { useI18n } from "@/lib/i18n";

interface ProfileDropdownProps {
  onCustomerServiceClick: () => void;
  onLogout: () => void;
}

export default function ProfileDropdown({
  onCustomerServiceClick,
  onLogout,
}: ProfileDropdownProps) {
  const { user } = useAuth();
  const { t, language } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<{ firstName: string; lastName: string; email: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load profile from localStorage when user is available
  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || (language === "ar" ? "أحمد" : "Ahmed"),
        lastName: user.lastName || (language === "ar" ? "محمد" : "Mohammed"),
        email: user.email || "student@example.com",
      });
    }
  }, [user, language]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = profile
    ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`
    : (language === "ar" ? "أم" : "AM");

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-200 group"
      >
        <span className="text-white text-sm font-medium">{initials}</span>
      </button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-64 shadow-xl border border-border z-50 bg-card">
          <CardContent className="p-0">
            {/* Header */}
            <div className="p-4 border-b border-border bg-muted/50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">{initials}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {profile?.firstName} {profile?.lastName}
                  </h4>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                </div>
              </div>
            </div>

            {/* Menu */}
            <div className="py-2">
              <Link
                to="/edit-profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-3 text-foreground hover:bg-accent transition-colors"
              >
                <User className="w-5 h-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-medium">{t("profile.editProfile")}</p>
                  <p className="text-xs text-muted-foreground">{t("profile.editProfileDesc")}</p>
                </div>
              </Link>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onCustomerServiceClick();
                }}
                className="w-full flex items-center px-4 py-3 text-foreground hover:bg-accent transition-colors"
              >
                <HeadphonesIcon className="w-5 h-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-medium">{t("profile.customerService")}</p>
                  <p className="text-xs text-muted-foreground">{t("profile.customerServiceDesc")}</p>
                </div>
              </button>

              <div className="border-t border-border mt-2 pt-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center px-4 py-3 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <div>
                    <p className="font-medium">{t("profile.logout")}</p>
                    <p className="text-xs text-destructive/70">{t("profile.logoutDesc")}</p>
                  </div>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}