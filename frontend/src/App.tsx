import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { primeCsrf } from "@/hooks/useAuth";
import DashboardPage from "@/pages/DashboardPage";
import CertificationsPage from "@/pages/CertificationsPage";
import SubmissionsPage from "@/pages/SubmissionsPage";
import SettingsPage from "@/pages/SettingsPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => { primeCsrf(); }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<RequireAuth><AppLayout><DashboardPage /></AppLayout></RequireAuth>} />
            <Route path="/certifications" element={<RequireAuth><AppLayout><CertificationsPage /></AppLayout></RequireAuth>} />
            <Route path="/submissions" element={<RequireAuth><AppLayout><SubmissionsPage /></AppLayout></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><AppLayout><SettingsPage /></AppLayout></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
