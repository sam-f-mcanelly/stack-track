"use client";
import { Sidebar } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import type React from "react"; // Added import for React

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  // To re-enable login requirement, uncomment the following useEffect hook:
  // useEffect(() => {
  //   if (!user) {
  //     router.push("/login")
  //   }
  // }, [user, router])

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // To re-enable login requirement, uncomment the following check:
  // if (!user) {
  //   return null // or a loading spinner
  // }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex h-screen overflow-hidden">
        <Sidebar onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </ThemeProvider>
  );
}
