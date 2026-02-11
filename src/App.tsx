import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ClairAgent from "@/components/ClairAgent";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NewDecision from "./pages/NewDecision";
import DecisionFlow from "./pages/DecisionFlow";
import PaymentSuccess from "./pages/PaymentSuccess";
import Profile from "./pages/Profile";
import Compare from "./pages/Compare";
import Reflect from "./pages/Reflect";
import Pricing from "./pages/Pricing";
import Admin from "./pages/Admin";
import Onboarding from "./pages/Onboarding";
import Upgrade from "./pages/Upgrade";
import EarlyAdopterPricing from "./pages/EarlyAdopterPricing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/decision/new" element={<NewDecision />} />
            <Route path="/decision/:id" element={<DecisionFlow />} />
            <Route path="/reflect/:id" element={<Reflect />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/early-adopter" element={<EarlyAdopterPricing />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ClairAgent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
