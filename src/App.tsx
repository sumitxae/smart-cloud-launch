import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import Dashboard from "./pages/Dashboard";
import Connect from "./pages/Connect";
import Deploy from "./pages/Deploy";
import Redeploy from "./pages/Redeploy";
import Logs from "./pages/Logs";
import Result from "./pages/Result";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import { useUser } from "./hooks/useApi";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const AppContent = () => {
  const { data: user, isLoading } = useUser();
  const isAuthenticated = !!user?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/connect" element={<Connect />} />
            <Route path="/deploy" element={<Deploy />} />
            <Route path="/redeploy/:projectId" element={<Redeploy />} />
            <Route path="/logs/:id" element={<Logs />} />
            <Route path="/result/:id" element={<Result />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
