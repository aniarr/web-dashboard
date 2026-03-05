import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import MemberOverview from "@/pages/dashboard/Overview";
import CreateReport from "@/pages/dashboard/CreateReport";
import History from "@/pages/dashboard/History";
import Settings from "@/pages/dashboard/Settings";
import AdminOverview from "@/pages/admin/Overview";
import Members from "@/pages/admin/Members";
import AdminReports from "@/pages/admin/Reports";
import { useAuth } from "@/hooks/use-auth";

function ProtectedRoute({ component: Component, adminOnly = false }: { component: any, adminOnly?: boolean }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) return <Redirect to="/login" />;
  if (adminOnly && !isAdmin) return <Redirect to="/dashboard" />;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />

      {/* Member Dashboard */}
      <Route path="/dashboard">
        <ProtectedRoute component={MemberOverview} />
      </Route>
      <Route path="/dashboard/create">
        <ProtectedRoute component={CreateReport} />
      </Route>
      <Route path="/dashboard/history">
        <ProtectedRoute component={History} />
      </Route>
      <Route path="/dashboard/settings">
        <ProtectedRoute component={Settings} />
      </Route>

      {/* Admin Dashboard */}
      <Route path="/admin">
        <ProtectedRoute component={AdminOverview} adminOnly />
      </Route>
      <Route path="/admin/create">
        <ProtectedRoute component={CreateReport} adminOnly />
      </Route>
      <Route path="/admin/members">
        <ProtectedRoute component={Members} adminOnly />
      </Route>
      <Route path="/admin/reports">
        <ProtectedRoute component={AdminReports} adminOnly />
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute component={Settings} adminOnly />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
