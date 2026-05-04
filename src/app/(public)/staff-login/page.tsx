"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GBDLogo } from "@/components/GBDLogo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Link from "next/link";

type LoginFormData = {
  email: string;
  password: string;
};

type InternalRole = "staff" | "admin" | "cfo";

const emptyForm: LoginFormData = {
  email: "",
  password: "",
};

const portalRoutes: Record<InternalRole, string> = {
  staff: "/staff",
  admin: "/admin",
  cfo: "/finance",
};

export default function StaffLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState<InternalRole>("staff");
  const [loadingRole, setLoadingRole] = useState<InternalRole | null>(null);

  const [staffForm, setStaffForm] = useState<LoginFormData>(emptyForm);
  const [adminForm, setAdminForm] = useState<LoginFormData>(emptyForm);
  const [cfoForm, setCfoForm] = useState<LoginFormData>(emptyForm);

  const handleLogin = async (
    role: InternalRole,
    form: LoginFormData,
    clearPassword: () => void
  ) => {
    if (loadingRole) return;

    if (!form.email || !form.password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoadingRole(role);
    const result = await login(form.email, form.password, role);
    setLoadingRole(null);

    if ("error" in result) {
      toast.error(result.error);
      clearPassword();
      return;
    }

    toast.success("Login successful!");
    router.push(portalRoutes[role] ?? "/");
  };

  const renderLoginFields = (
    role: InternalRole,
    form: LoginFormData,
    setForm: React.Dispatch<React.SetStateAction<LoginFormData>>,
    buttonClassName: string,
    buttonLabel: string
  ) => {
    const isLoading = loadingRole === role;

    return (
      <div className="space-y-4 mt-6">
        <div className="space-y-2">
          <Label htmlFor={`${role}-email`}>Email</Label>
          <Input
            id={`${role}-email`}
            type="email"
            placeholder={`${role}@example.com`}
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
            disabled={!!loadingRole}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${role}-password`}>Password</Label>
          <Input
            id={`${role}-password`}
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, password: e.target.value }))
            }
            disabled={!!loadingRole}
          />
        </div>

        <Button
          className={`w-full ${buttonClassName}`}
          onClick={() =>
            handleLogin(role, form, () =>
              setForm((prev) => ({ ...prev, password: "" }))
            )
          }
          disabled={!!loadingRole}
        >
          {isLoading ? "Signing in..." : buttonLabel}
        </Button>

      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white py-12 px-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <GBDLogo size="lg" className="justify-center mb-4" />
          <h1 className="text-3xl font-bold text-[#002040] mb-2">Internal Access</h1>
          <p className="text-gray-600">Staff, Admin, and Finance Portal Login</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Internal Login</CardTitle>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as InternalRole)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="staff">Staff</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="cfo">CFO</TabsTrigger>
              </TabsList>

              <TabsContent value="staff">
                {renderLoginFields(
                  "staff",
                  staffForm,
                  setStaffForm,
                  "bg-[#2888B8] hover:bg-[#1078A8]",
                  "Sign In as Staff"
                )}
              </TabsContent>

              <TabsContent value="admin">
                {renderLoginFields(
                  "admin",
                  adminForm,
                  setAdminForm,
                  "bg-[#489858] hover:bg-[#3a7846]",
                  "Sign In as Admin"
                )}
              </TabsContent>

              <TabsContent value="cfo">
                {renderLoginFields(
                  "cfo",
                  cfoForm,
                  setCfoForm,
                  "bg-[#E8A018] hover:bg-[#c78814]",
                  "Sign In as CFO"
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                Looking for the parent portal?{" "}
                <Link href="/login" className="text-[#2888B8] hover:underline font-medium">
                  Go to Parent Login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}