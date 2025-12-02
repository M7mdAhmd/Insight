import Login from "./pages/Login";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import PaperDetail from "./pages/PaperDetail";
import AIAssistant from "./pages/AIAssistant";
import Fields from "./pages/Fields";
import Authors from "./pages/Authors";
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
          <Route path="/explore" element={<Explore />} />
          <Route path="/paper/:id" element={<PaperDetail />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/fields" element={<Fields />} />
          <Route path="/authors" element={<Authors />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<NotFound />} />
          <Route path="/my-downloads" element={<NotFound />} />
          <Route path="/my-reviews" element={<NotFound />} />
          <Route path="/my-interests" element={<NotFound />} />
          <Route path="/settings" element={<NotFound />} />
          <Route path="/admin" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
