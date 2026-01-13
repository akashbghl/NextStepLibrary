"use client";

import React, { useEffect } from "react";
import clsx from "clsx";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  // Close on ESC
  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={clsx(
          "relative z-10 w-full rounded-xl bg-white p-5 shadow-lg animate-in fade-in zoom-in-95",
          sizes[size]
        )}
      >
        {/* Header */}
        {(title) && (
          <div className="mb-4 flex items-center justify-between">
            {title && (
              <h2 className="text-lg font-semibold">{title}</h2>
            )}
            <button
              onClick={onClose}
              className="rounded p-1 hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Body */}
        <div>{children}</div>
      </div>
    </div>
  );
}
