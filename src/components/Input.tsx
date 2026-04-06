// src/components/Input.tsx
import React from "react";

export default function Input(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      className={`
        w-full
        bg-[#0f0f2e] 
        border border-gray-700 
        rounded px-4 py-2 
        focus:outline-none focus:ring focus:ring-yellow-500
        ${props.className || ""}
      `}
    />
  );
}
    