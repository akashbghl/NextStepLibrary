"use client";

import React, { useId } from "react";
import clsx from "clsx";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className,
  id,
  ...props
}: InputProps) {
  const reactId = useId();               // ✅ stable id
  const inputId = id || reactId;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={clsx(
          "w-full rounded-lg border px-3 py-2 text-sm outline-none transition",
          "focus:ring-2 focus:ring-black",
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300",
          className
        )}
        {...props}
      />

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
