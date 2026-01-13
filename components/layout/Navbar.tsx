"use client";

import { Bell, Search, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        <Search size={18} className="text-gray-400" />
        <input
          placeholder="Search students..."
          className="w-64 rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative rounded-full p-2 hover:bg-gray-100">
          <Bell size={18} />
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
            {user?.name?.[0] || "U"}
          </div>
          <div className="text-sm">
            <p className="font-medium leading-none">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
