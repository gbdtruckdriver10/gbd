"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GBDLogo } from "@/components/GBDLogo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription,} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle } from "lucide-react";

type ParentSignupForm = {
  inviteCode: string;
  parentName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const initialForm: ParentSignupForm = {
  inviteCode: "",
  parentName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function ParentSignupPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ParentSignupForm>(initialForm);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.inviteCode.trim()) {
      newErrors.inviteCode = "Invitation code is required";
    } else if (formData.inviteCode.trim().length < 6) {
      newErrors.inviteCode = "Invalid invitation code";
    }

    if (!formData.parentName.trim()) {
      newErrors.parentName = "Parent name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (
      formData.phone &&
      !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.phone)
    ) {
      newErrors.phone = "Invalid phone number format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ParentSignupForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSignup = async () => {
    if (loading) return;

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);

      // TODO: Replace this mock logic with Supabase-backed invite validation.
      // Future flow for alex and alexis
      // 1. Validate invite code against parent_invites table
      // 2. Ensure email matches invite
      // 3. Create auth user
      // 4. Create profile row
      // 5. Mark invite as used

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const validInviteCodes = ["TOUR2026", "ENROLL24", "WELCOME123"];
      const normalizedCode = formData.inviteCode.trim().toUpperCase();

      if (!validInviteCodes.includes(normalizedCode)) {
        setErrors({ inviteCode: "Invalid invitation code. Please contact admin." });
        toast.error("Invalid invitation code");
        return;
      }

      toast.success("Account created successfully!");

      // Mock auto-login after successful signup
      await login(formData.email, formData.password, "parent");

      toast.success("Welcome to GBD Parent Portal!");
      router.push("/parent");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white py-12 px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <GBDLogo size="lg" className="justify-center mb-4" />
          <h1 className="text-3xl font-bold text-[#002040] mb-2">
            Create Your Parent Account
          </h1>
          <p className="text-gray-600">Welcome to Gifted &amp; Beyond Daycare</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Parent Portal Registration</CardTitle>
            <CardDescription>
              Complete the form below to set up your parent portal access. You
              should have received an invitation code from our admin team.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="border-[#2888B8] bg-blue-50">
              <AlertCircle className="h-4 w-4 text-[#2888B8]" />
              <AlertDescription className="text-sm text-gray-700">
                This registration is only for parents who have completed a tour
                and received enrollment approval from our admin team.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="inviteCode">
                Invitation Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="inviteCode"
                type="text"
                placeholder="Enter your invitation code"
                value={formData.inviteCode}
                onChange={(e) =>
                  handleInputChange("inviteCode", e.target.value.toUpperCase())
                }
                disabled={loading}
                className={errors.inviteCode ? "border-red-500" : ""}
              />
              {errors.inviteCode && (
                <p className="text-sm text-red-500">{errors.inviteCode}</p>
              )}
              <p className="text-xs text-gray-500">
                Demo codes: TOUR2026, ENROLL24, WELCOME123
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentName">
                Parent/Guardian Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="parentName"
                type="text"
                placeholder="John Smith"
                value={formData.parentName}
                onChange={(e) => handleInputChange("parentName", e.target.value)}
                disabled={loading}
                className={errors.parentName ? "border-red-500" : ""}
              />
              {errors.parentName && (
                <p className="text-sm text-red-500">{errors.parentName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="parent@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={loading}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={loading}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={loading}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
              <p className="text-xs text-gray-500">
                Must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                disabled={loading}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              className="w-full bg-[#2888B8] hover:bg-[#1078A8]"
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Parent Account"}
            </Button>

            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm text-gray-700">
                After creating your account, you&apos;ll be automatically logged
                in and can access your parent portal.
              </AlertDescription>
            </Alert>

            <div className="pt-4 text-center text-sm text-gray-600 space-y-2 border-t">
              <p>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#2888B8] hover:underline font-medium"
                >
                  Sign in here
                </Link>
              </p>
              <p className="text-xs text-gray-500">
                Don&apos;t have an invitation code?{" "}
                <Link
                  href="/contact"
                  className="text-[#2888B8] hover:underline"
                >
                  Contact us to schedule a tour
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
