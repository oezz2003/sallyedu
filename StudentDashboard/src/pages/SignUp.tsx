import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navigation } from "@/components/Navigation";
import { CountryCodeSelector } from "@/components/CountryCodeSelector";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { UserProfile } from "@/hooks/useUserProfile";



export function SignUpPage() {
  const [ageGroup, setAgeGroup] = useState<"over16" | "under16" | null>(null);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { language } = useI18n();

  // form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",                  // will map to dateOfBirth
    country: "",              // for UserProfile.country
    guardianFirstName: "",    // only for under16, we'll ignore if over16
    guardianLastName: "",     // "
    guardianCountryCode: "+20", // for guardian phone
    guardianPhone: "",        // guardian phone number
    countryCode: "+20",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: language === "ar" ? "كلمة المرور غير متطابقة" : "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate age
    const userAge = parseInt(formData.age);
    if (!userAge || userAge < 1 || userAge > 100) {
      toast({
        title: "Error",
        description: language === "ar" ? "يرجى إدخال عمر صحيح" : "Please enter a valid age",
        variant: "destructive",
      });
      return;
    }
    
    // Validate guardian information for under-16 users
    if (ageGroup === "under16" && (!formData.guardianFirstName || !formData.guardianLastName)) {
      toast({
        title: "Error",
        description: language === "ar" ? "يرجى إدخال بيانات ولي الأمر" : "Please enter guardian information",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Create comprehensive user profile in Firestore
      const currentDate = new Date().toISOString();
      const userAge = parseInt(formData.age) || 0;
      
      const userProfile: UserProfile = {
        // Basic Information
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: `${formData.countryCode}${formData.phoneNumber}`,
        age: userAge,
        country: formData.country,
        address: "", // Will be filled later in profile settings
        
        // Guardian Information (for under-16 users)
        guardianFirstName: ageGroup === "under16" ? formData.guardianFirstName : "",
        guardianLastName: ageGroup === "under16" ? formData.guardianLastName : "",
        guardianEmail: "", // Can be added later
        guardianPhone: ageGroup === "under16" && formData.guardianPhone ? `${formData.guardianCountryCode}${formData.guardianPhone}` : "", // Guardian phone with country code
        
        // Profile Information
        bio: "", // Will be filled later in profile settings
        avatar: "", // Will be uploaded later
        
        // Course Enrollments - Initialize as empty
        enrollments: [],
        
        // Payment History - Initialize as empty
        payments: [],
        
        // Account Settings
        emailNotifications: true,
        courseNotifications: true,
        marketingEmails: false,
        
        // Account Status
        accountType: userAge >= 16 ? 'adult' : 'student',
        role: 'user', // Default role for all student-side registrations
        isActive: true,
        isEmailVerified: false, // Will be updated when email is verified
        
        // Timestamps
        createdAt: currentDate,
        updatedAt: currentDate,
        lastLoginAt: currentDate
      };

      // Log the user data object for debugging
      console.log('Creating user profile:', {
        uid: user.uid,
        profileData: userProfile
      });

      // Try to write to Firestore with enhanced error handling
      let firestoreSuccess = false;
      try {
        console.log('Attempting to write to Firestore...');
        await setDoc(doc(db, "users", user.uid), userProfile);
        console.log('Firestore write successful!');
        firestoreSuccess = true;
      } catch (firestoreError) {
        console.error('Firestore write failed:', firestoreError);
        // Even if Firestore fails, don't fail the entire registration
        toast({
          title: language === "ar" ? "تحذير" : "Warning",
          description: language === "ar" 
            ? "تم إنشاء الحساب ولكن فشل في حفظ البيانات الإضافية. يمكنك تحديث الملف الشخصي لاحقاً."
            : "Account created but failed to save additional data. You can update your profile later.",
          variant: "destructive",
        });
      }

      // Show success message based on Firestore result
      toast({
        title: language === "ar" ? "تم إنشاء الحساب" : "Account Created",
        description: firestoreSuccess 
          ? (language === "ar" 
              ? "تم إنشاء حسابك بنجاح وحفظ بياناتك في قاعدة البيانات"
              : "Your account has been created successfully and your profile data has been saved")
          : (language === "ar" 
              ? "تم إنشاء حسابك بنجاح. يرجى تحديث بياناتك الشخصية لاحقاً."
              : "Your account has been created successfully. Please update your profile information later."),
      });

      // Always navigate to login page after successful account creation
      navigate("/LogIn", { replace: true });
    } catch (error: any) {
      console.error("Sign up error:", error);
      
      let errorMessage = "Failed to create account";
      if (language === "ar") {
        errorMessage = "فشل في إنشاء الحساب";
      }
      
      // Handle specific Firebase errors
      if (error.code === "auth/email-already-in-use") {
        errorMessage = language === "ar" ? "البريد الإلكتروني مستخدم بالفعل" : "Email already in use";
      } else if (error.code === "auth/weak-password") {
        errorMessage = language === "ar" ? "كلمة المرور ضعيفة جداً" : "Password is too weak";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = language === "ar" ? "البريد الإلكتروني غير صالح" : "Invalid email address";
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage = language === "ar" ? "تسجيل الحسابات معطل حالياً" : "Account registration is currently disabled";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = language === "ar" ? "عدد كبير من المحاولات. حاول مرة أخرى لاحقاً" : "Too many attempts. Try again later";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto p-8 rounded-xl border bg-background shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              {language === "ar" ? "إنشاء حساب جديد" : "Create Your Account"}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {language === "ar" 
                ? "انضم إلى منصة التعلم وابدأ رحلتك التعليمية" 
                : "Join our learning platform and start your educational journey"
              }
            </p>
          </div>

          {ageGroup === null ? (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-center">
                {language === "ar" ? "هل عمرك 16 عاماً أو أكثر؟" : "Are you 16 years or older?"}
              </h2>
              <div className="flex justify-center gap-4">
                <Button onClick={() => setAgeGroup("over16")} variant="outline">
                  {language === "ar" ? "نعم، 16+ عاماً" : "Yes, I'm 16+"}
                </Button>
                <Button onClick={() => setAgeGroup("under16")} variant="outline">
                  {language === "ar" ? "تحت 16 عاماً" : "Under 16"}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-medium text-center mb-4">
                {ageGroup === "under16"
                  ? (language === "ar" ? "بيانات الطالب وولي الأمر" : "Student & Guardian Information")
                  : (language === "ar" ? "إنشاء حسابك" : "Create Your Account")
                }
              </h2>

              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{language === "ar" ? "الاسم الأول" : "First Name"}</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{language === "ar" ? "الاسم الأخير" : "Last Name"}</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{language === "ar" ? "البريد الإلكتروني" : "Email"}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">{language === "ar" ? "البلد" : "Country"}</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>

              {/* Age - Required for all users */}
              <div className="space-y-2">
                <Label htmlFor="age">{language === "ar" ? "العمر" : "Age"}</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  placeholder={language === "ar" ? "أدخل عمرك" : "Enter your age"}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">{language === "ar" ? "رقم الواتساب" : "WhatsApp Number"}</Label>
                <div className="flex gap-2">
                  <CountryCodeSelector
                    value={formData.countryCode}
                    onValueChange={v =>
                      setFormData(f => ({ ...f, countryCode: v }))
                    }
                  />
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder={language === "ar" ? "رقم الهاتف" : "Phone number"}
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Under-16 only */}
              {ageGroup === "under16" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="age">{language === "ar" ? "العمر" : "Age"}</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min="1"
                      max="15"
                      value={formData.age}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guardianFirstName">
                        {language === "ar" ? "اسم ولي الأمر الأول" : "Guardian First Name"}
                      </Label>
                      <Input
                        id="guardianFirstName"
                        name="guardianFirstName"
                        value={formData.guardianFirstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guardianLastName">
                        {language === "ar" ? "اسم ولي الأمر الأخير" : "Guardian Last Name"}
                      </Label>
                      <Input
                        id="guardianLastName"
                        name="guardianLastName"
                        value={formData.guardianLastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Guardian Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="guardianPhone">{language === "ar" ? "رقم هاتف ولي الأمر" : "Guardian Phone Number"}</Label>
                    <div className="flex gap-2">
                      <CountryCodeSelector
                        value={formData.guardianCountryCode}
                        onValueChange={v =>
                          setFormData(f => ({ ...f, guardianCountryCode: v }))
                        }
                      />
                      <Input
                        id="guardianPhone"
                        name="guardianPhone"
                        type="tel"
                        placeholder={language === "ar" ? "رقم هاتف ولي الأمر" : "Guardian phone number"}
                        value={formData.guardianPhone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">{language === "ar" ? "كلمة المرور" : "Password"}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting 
                  ? (language === "ar" ? "جاري إنشاء الحساب..." : "Signing Up…") 
                  : (language === "ar" ? "إنشاء الحساب" : "Create Account")
                }
              </Button>
            </form>
          )}

          <div className="text-center border-t border-border pt-4 mt-6">
            <p className="text-sm text-muted-foreground">
              {language === "ar" ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
              <Link 
                to="/LogIn" 
                className="font-medium text-primary hover:text-primary/80 underline underline-offset-4"
              >
                {language === "ar" ? "تسجيل الدخول" : "Log in"}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}