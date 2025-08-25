import { useState } from "react";
import { Form, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navigation } from "@/components/Navigation";
import { CountryCodeSelector } from "@/components/CountryCodeSelector";


export function SignUpPage() {
  const [ageGroup, setAgeGroup] = useState<"over16" | "under16" | null>(null);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    country: "",
    guardianFirstName: "",
    guardianLastName: "",
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
    if (formData.password !== formData.confirmPassword) {
      return window.alert("Passwords do not match.");
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("https://ela-ee0o.onrender.com/user/signUp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          guardianFirstName: formData.guardianFirstName,
          guardianLastName: formData.guardianLastName,
          email: formData.email,
          phone: `${formData.countryCode} ${formData.phoneNumber}`,
          dateOfBirth: formData.age,
          country: formData.country,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        window.alert(data.message || "Sign up failed");
        return;
      }

      // خزني التوكين
      localStorage.setItem("token", data.token);

      // روح للداشبورد
      navigate("/student-dashboard", { replace: true });
    } catch (err: any) {
      window.alert("Sign up failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto p-8 rounded-xl border bg-background shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6">
            Create Your Account
          </h1>

          {ageGroup === null ? (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-center">
                Are you 16 years or older?
              </h2>
              <div className="flex justify-center gap-4">
                <Button onClick={() => setAgeGroup("over16")} variant="outline">
                  Yes, I'm 16+
                </Button>
                <Button onClick={() => setAgeGroup("under16")} variant="outline">
                  Under 16
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-medium text-center mb-4">
                {ageGroup === "under16"
                  ? "Student & Guardian Information"
                  : "Create Your Account"}
              </h2>

              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
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
                <Label htmlFor="email">Email</Label>
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
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">WhatsApp Number</Label>
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
                    placeholder="Phone number"
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
                    <Label htmlFor="age">Age</Label>
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
                        Guardian First Name
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
                        Guardian Last Name
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
                </>
              )}

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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
                <Label htmlFor="confirmPassword">Confirm Password</Label>
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
                {isSubmitting ? "Signing Up…" : "Create Account"}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link to="/LogIn" className="underline hover:text-primary">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}