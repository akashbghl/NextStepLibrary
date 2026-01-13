"use client";

import { Bell, Search, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
}

export default function Navbar() {
  const { user, logout } = useAuth();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  /* ============================
      Fetch Notifications
  ============================ */

  useEffect(() => {
    fetch("/api/notifications", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNotifications(data.notifications);
        }
      })
      .catch(() => {});
  }, []);

  /* ============================
      Outside Click Handler
  ============================ */

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(
          e.target as Node
        )
      ) {
        setNotifOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(
          e.target as Node
        )
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () =>
      document.removeEventListener("mousedown", handler);
  }, []);

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
        {/* 🔔 Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            className="relative rounded-full p-2 hover:bg-gray-100"
          >
            <Bell size={18} />

            {notifications.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-white shadow-lg">
              <div className="border-b px-4 py-2 text-sm font-semibold">
                Notifications
              </div>

              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">
                  No notifications
                </p>
              ) : (
                <ul className="max-h-80 overflow-auto">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className="border-b px-4 py-3 text-sm last:border-none hover:bg-gray-50"
                    >
                      <p className="font-medium">
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {n.message}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* 👤 Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 rounded-md p-1 hover:bg-gray-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
              {user?.name?.[0] || "U"}
            </div>

            <div className="text-left text-sm hidden sm:block">
              <p className="font-medium leading-none">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500">
                {user?.role}
              </p>
            </div>
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-white shadow-lg">
              <button
                onClick={() =>
                  (window.location.href =
                    "/dashboard/settings")
                }
                className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
              >
                <User size={16} />
                Profile Settings
              </button>

              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
