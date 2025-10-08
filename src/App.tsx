import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Package185 from "./pages/Package185";
import Package245 from "./pages/Package245";
import DynamicCheckout from "./pages/DynamicCheckout";
import Cancel from "./pages/Cancel";
import Dashboard from "./pages/Dashboard";
import AddMore from "./pages/AddMore";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/€185" element={<Package185 />} />
          <Route path="/€245" element={<Package245 />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-more" element={<AddMore />} />
          <Route path="/:slug" element={<DynamicCheckout />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
