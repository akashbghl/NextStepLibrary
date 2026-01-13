"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [savingProfile, setSavingProfile] =
    useState(false);
  const [savingPassword, setSavingPassword] =
    useState(false);

  /* ============================
      Update Profile (mock)
  ============================ */

  const handleProfileSave = async () => {
    setSavingProfile(true);

    try {
      // TODO: API integration later
      alert("Profile updated (mock)");
    } finally {
      setSavingProfile(false);
    }
  };

  /* ============================
      Change Password (mock)
  ============================ */

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword) {
      return alert("Fill all password fields");
    }

    setSavingPassword(true);

    try {
      // TODO: API integration later
      alert("Password updated (mock)");
      setOldPassword("");
      setNewPassword("");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-2xl space-y-6">
        <h1 className="text-lg font-semibold">
          Settings
        </h1>

        {/* Profile */}
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold">
            Profile
          </h2>

          <Input
            label="Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <Input
            label="Email"
            value={email}
            disabled
          />

          <Button
            onClick={handleProfileSave}
            loading={savingProfile}
          >
            Save Profile
          </Button>
        </div>

        {/* Password */}
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold">
            Change Password
          </h2>

          <Input
            label="Current Password"
            type="password"
            value={oldPassword}
            onChange={(e) =>
              setOldPassword(e.target.value)
            }
          />

          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
          />

          <Button
            onClick={handlePasswordChange}
            loading={savingPassword}
          >
            Update Password
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-red-700">
            Danger Zone
          </h2>

          <p className="text-xs text-red-600">
            Logging out will remove your session from
            this device.
          </p>

          <Button variant="danger" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
