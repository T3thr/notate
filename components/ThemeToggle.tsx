// components/ThemeToggle.tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/Theme";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-lg bg-accent p-2 transition-colors hover:bg-accent/80"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <>
          <Moon className="h-5 w-5 text-foreground" />
          <span className="text-sm text-foreground">Dark Mode</span>
        </>
      ) : (
        <>
          <Sun className="h-5 w-5 text-foreground" />
          <span className="text-sm text-foreground">Light Mode</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;