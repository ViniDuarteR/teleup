import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HeaderEmpresa from '@/components/HeaderEmpresa';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { API_BASE_URL } from '../lib/api';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Phone, 
  Clock, 
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface EmpresaData {
  id: number;
  nome: string;
  email: string;
  status: string;
}

interface DashboardMetrics {
  totalGestores: number;
  totalOperadores: number;
  operadoresOnline: number;
  chamadasHoje: number;
  metaDiaria: number;
  satisfacaoMedia: number;
  tempoMedioAtendimento: number;
  taxaResolucao: number;
}

const DashboardEmpresa: React.FC = () => {
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState<EmpresaData | null>(null);
  const [metricas, setMetricas] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('teleup_user');
    if (userData) {
      const user = JSON.parse(userData);
      setEmpresa(user);
    }
    fetchMetricas();
  }, []);

  const fetchMetricas = async () => {
    try {
      const token = localStorage.getItem('teleup_token');
      const response = await fetch(`${API_BASE_URL}/empresas/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMetricas(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <HeaderEmpresa empresa={empresa} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="gaming-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total de Gestores</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metricas?.totalGestores || 0}
              </div>
              <p className="text-xs text-gray-400">Gestores ativos</p>
            </CardContent>
          </Card>

          <Card className="gaming-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total de Operadores</CardTitle>
              <Users className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metricas?.totalOperadores || 0}
              </div>
              <p className="text-xs text-gray-400">Operadores cadastrados</p>
            </CardContent>
          </Card>

          <Card className="gaming-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Operadores Online</CardTitle>
              <Activity className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metricas?.operadoresOnline || 0}
              </div>
              <p className="text-xs text-gray-400">Ativos agora</p>
            </CardContent>
          </Card>

          <Card className="gaming-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Chamadas Hoje</CardTitle>
              <Phone className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metricas?.chamadasHoje || 0}
              </div>
              <p className="text-xs text-gray-400">Meta: {metricas?.metaDiaria || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Métricas Secundárias */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                Satisfação Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                {metricas?.satisfacaoMedia?.toFixed(1) || '0.0'}%
              </div>
              <p className="text-sm text-gray-400">Avaliação geral dos clientes</p>
            </CardContent>
          </Card>

          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-400" />
                Tempo Médio de Atendimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">
                {metricas?.tempoMedioAtendimento || 0}min
              </div>
              <p className="text-sm text-gray-400">Duração média das chamadas</p>
            </CardContent>
          </Card>

          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-purple-400" />
                Taxa de Resolução
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">
                {metricas?.taxaResolucao || 0}%
              </div>
              <p className="text-sm text-gray-400">Problemas resolvidos na primeira chamada</p>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-yellow-400" />
                Relatórios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Acesse relatórios detalhados de performance, métricas e análises.
              </p>
              <Button className="w-full gaming-button" onClick={() => navigate('/relatorios-empresa')}>
                Ver Relatórios
              </Button>
            </CardContent>
          </Card>

          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-400" />
                Gerenciar Gestores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Gerencie seus gestores, adicione novos e configure permissões.
              </p>
              <Button className="w-full gaming-button" onClick={() => navigate('/gestores-empresa')}>
                Gerenciar Gestores
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardEmpresa;
