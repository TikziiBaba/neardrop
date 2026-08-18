"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const isLight = document.documentElement.classList.contains("light");
    setTheme(isLight ? "light" : "dark");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
    >
      {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-sky-400" />}
    </button>
  );
};
