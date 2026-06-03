
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  
  useEffect(() => {
    // Check for theme in localStorage or use system preference
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize the look and feel of the interface</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <span>Theme</span>
          <Button onClick={toggleTheme} variant="outline" className="flex items-center gap-2">
            {theme === "light" ? (
              <>
                <Sun className="h-4 w-4" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span>Dark</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeSwitcher;
