
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Games from "./pages/Games";
import Matchmaking from "./pages/Matchmaking";
import Teams from "./pages/Teams";
import Profile from "./pages/Profile";
import Certificates from "./pages/Certificates";
import Analytics from "./pages/Analytics";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminTeams from "./pages/admin/AdminTeams";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminMatches from "./pages/admin/AdminMatches";
import AdminCertificates from "./pages/admin/AdminCertificates";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import NotFound from "./pages/NotFound";
import EventDetail from "./pages/EventDetail";
import TeamDetail from "./pages/TeamDetail";
import CreateTeam from "./pages/CreateTeam";
import MatchDetail from "./pages/MatchDetail";
import CreateMatch from "./pages/CreateMatch";
import CertificateDetail from "./pages/CertificateDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/:id" element={<EventDetail />} />
            <Route path="/matchmaking" element={<Matchmaking />} />
            <Route path="/matchmaking/create" element={
              <RequireAuth>
                <CreateMatch />
              </RequireAuth>
            } />
            <Route path="/matchmaking/:id" element={<MatchDetail />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/create" element={
              <RequireAuth>
                <CreateTeam />
              </RequireAuth>
            } />
            <Route path="/teams/:id" element={<TeamDetail />} />
            <Route path="/profile" element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            } />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/certificates/:id" element={<CertificateDetail />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            } />
            <Route path="/admin/events" element={
              <RequireAdmin>
                <AdminEvents />
              </RequireAdmin>
            } />
            <Route path="/admin/teams" element={
              <RequireAdmin>
                <AdminTeams />
              </RequireAdmin>
            } />
            <Route path="/admin/users" element={
              <RequireAdmin>
                <AdminUsers />
              </RequireAdmin>
            } />
            <Route path="/admin/matches" element={
              <RequireAdmin>
                <AdminMatches />
              </RequireAdmin>
            } />
            <Route path="/admin/certificates" element={
              <RequireAdmin>
                <AdminCertificates />
              </RequireAdmin>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
