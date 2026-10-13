"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "./ThemeProvider";

interface BrandLogoProps {
  className?: string;
  width?: number;
  height?: number;
  variant?: "auto" | "white" | "blue";
  priority?: boolean;
}

export function BrandLogo({
  className = "h-9 w-auto",
  width = 140,
  height = 60,
  variant = "auto",
  priority = false,
}: BrandLogoProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = variant === "blue" || (variant === "auto" && mounted && theme === "light");

  return (
    <div className={`relative inline-flex items-center justify-center select-none overflow-hidden shrink-0 ${className}`}>
      {/* Light mode logo (Electric Blue) */}
      <Image
        src="/assets/logo_blue.png"
        alt="CEES AREA Official Logo (Blue)"
        width={width}
        height={height}
        priority={priority}
        className={`h-full w-auto max-h-full max-w-full object-contain transition-opacity duration-200 ${
          isLight ? "block" : "hidden"
        }`}
      />
      {/* Dark mode logo (White) */}
      <Image
        src="/assets/logo_white.png"
        alt="CEES AREA Official Logo (White)"
        width={width}
        height={height}
        priority={priority}
        className={`h-full w-auto max-h-full max-w-full object-contain transition-opacity duration-200 ${
          !isLight ? "block" : "hidden"
        }`}
      />
    </div>
  );
}
