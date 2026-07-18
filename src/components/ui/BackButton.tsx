"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface BackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function BackButton({ children, onClick, ...props }: BackButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    }
    router.back();
  };

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
}
