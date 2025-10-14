import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Home from "./pages/Home";
import SimpleHome from "./pages/SimpleHome";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import CadastroEmpresa from "./pages/CadastroEmpresa";
import DashboardOperador from "./pages/DashboardOperador";
import PerfilOperador from "./pages/PerfilOperador";
import MetasPessoais from "./pages/MetasPessoais";
import PainelGestor from "./pages/PainelGestor";
import MonitorOperadores from "./pages/MonitorOperadores";
import GerenciarRecompensas from "./pages/GerenciarRecompensas";
import GerenciarUsuarios from "./pages/GerenciarUsuarios";
import GerenciarGestores from "./pages/GerenciarGestores";
import LojaRecompensas from "./pages/LojaRecompensas";
import GaleriaConquistas from "./pages/GaleriaConquistas";
import DashboardEmpresa from "./pages/DashboardEmpresa";
import RelatoriosEmpresa from "./pages/RelatoriosEmpresa";
import GerenciarGestoresEmpresa from "./pages/GerenciarGestoresEmpresa";
import ConfiguracoesEmpresa from "./pages/ConfiguracoesEmpresa";
import GerenciarMetas from "./pages/GerenciarMetas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/home" element={<SimpleHome />} />
            <Route path="/index" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro-empresa" element={<CadastroEmpresa />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requiredRole="operador">
                  <DashboardOperador />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/perfil" 
              element={
                <ProtectedRoute requiredRole="operador">
                  <PerfilOperador />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/metas" 
              element={
                <ProtectedRoute requiredRole="operador">
                  <MetasPessoais />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gestor" 
              element={
                <ProtectedRoute requiredRole="gestor">
                  <PainelGestor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gestor/operadores" 
              element={
                <ProtectedRoute requiredRole="gestor">
                  <MonitorOperadores />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gestor/recompensas" 
              element={
                <ProtectedRoute requiredRole="gestor">
                  <GerenciarRecompensas />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gestor/metas" 
              element={
                <ProtectedRoute requiredRole="gestor">
                  <GerenciarMetas />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gestor/relatorios" 
              element={
                <ProtectedRoute requiredRole="gestor">
                  <NotFound />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/usuarios" 
              element={
                <ProtectedRoute requiredRole="gestor">
                  <GerenciarUsuarios />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gestores" 
              element={
                <ProtectedRoute requiredRole="gestor">
                  <GerenciarGestores />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/loja" 
              element={
                <ProtectedRoute>
                  <LojaRecompensas />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/conquistas" 
              element={
                <ProtectedRoute>
                  <GaleriaConquistas />
                </ProtectedRoute>
              } 
            />
            {/* Rotas da Empresa */}
            <Route 
              path="/dashboard-empresa" 
              element={
                <ProtectedRoute requiredRole="empresa">
                  <DashboardEmpresa />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/relatorios-empresa" 
              element={
                <ProtectedRoute requiredRole="empresa">
                  <RelatoriosEmpresa />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gestores-empresa" 
              element={
                <ProtectedRoute requiredRole="empresa">
                  <GerenciarGestoresEmpresa />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/configuracoes-empresa" 
              element={
                <ProtectedRoute requiredRole="empresa">
                  <ConfiguracoesEmpresa />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
