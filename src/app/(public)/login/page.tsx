"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GBDLogo } from "@/components/GBDLogo";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleParentLogin = async () => {
    if (loading) return;

    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);

    const result = await login(email, password);

    if ("error" in result) {
      toast.error(result.error || "Login failed. Please check your credentials.");
      setPassword("");
      setLoading(false);
      return;
    }

    toast.success("Login successful!");
    setLoading(false);
    const roleRoutes: Record<string, string> = {
      parent: "/parent",
      admin: "/admin",
      staff: "/staff",
      cfo: "/finance",
    };
    router.push(roleRoutes[result.user.role] ?? "/parent");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <GBDLogo size="lg" className="justify-center mb-4" />
          <h1 className="text-3xl font-bold text-[#002040] mb-2">Welcome Back</h1>
          <p className="text-gray-600">Parent Portal Login</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Parent Login</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parent-email">Email</Label>
              <Input
                id="parent-email"
                type="email"
                placeholder="parent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent-password">Password</Label>
              <Input
                id="parent-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button
              className="w-full bg-[#2888B8] hover:bg-[#1078A8]"
              onClick={handleParentLogin}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In as Parent"}
            </Button>

            <div className="pt-4 text-center text-sm text-gray-600 space-y-2">
              <p>
                Don&apos;t have an account?{" "}
                <Link href="/apply" className="text-[#2888B8] hover:underline font-medium">
                  Apply for enrollment
                </Link>
              </p>

              <p className="text-xs text-gray-500">
                Staff or administrative team?{" "}
                <Link href="/staff-login" className="text-[#2888B8] hover:underline font-medium">
                  Internal access
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}