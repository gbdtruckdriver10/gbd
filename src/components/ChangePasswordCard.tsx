"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function ChangePasswordCard() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user?.email, currentPassword, newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Password updated successfully");
      reset();
    } else {
      toast.error(data.error ?? "Failed to update password");
    }
    setSaving(false);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-3 text-left"
        >
          <div className="rounded-lg bg-gray-100 p-2">
            <KeyRound size={18} className="text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-[#002040]">Change Password</p>
            <p className="text-sm text-gray-500">Update your account password</p>
          </div>
          <span className="text-xs text-[#2888B8]">{open ? "Cancel" : "Change"}</span>
        </button>

        {open && (
          <div className="mt-5 space-y-4 border-t pt-5">
            <div>
              <Label>Email</Label>
              <Input className="mt-1 bg-gray-50" value={user?.email ?? ""} readOnly />
            </div>
            <div>
              <Label>Current Password</Label>
              <Input
                className="mt-1"
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                className="mt-1"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                className="mt-1"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={reset}>Cancel</Button>
              <Button
                className="bg-[#2888B8] hover:bg-[#1078A8]"
                onClick={handleSubmit}
                disabled={saving || !currentPassword || !newPassword || !confirmPassword}
              >
                {saving ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
