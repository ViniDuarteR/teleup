import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HeaderEmpresa from '@/components/HeaderEmpresa';
import { 
  Building2, 
  BarChart3, 
  TrendingUp, 
  Download,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';

interface RelatorioData {
  periodo: string;
  totalChamadas: number;
  chamadasResolvidas: number;
  satisfacaoMedia: number;
  tempoMedioAtendimento: number;
  operadoresAtivos: number;
  gestoresAtivos: number;
}

const RelatoriosEmpresa: React.FC = () => {
  const [empresa, setEmpresa] = useState<EmpresaData | null>(null);
  const [relatorios, setRelatorios] = useState<RelatorioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('30');

  useEffect(() => {
    const fetchEmpresaData = async () => {
      try {
        const userData = localStorage.getItem('teleup_user');
        if (userData) {
          const user = JSON.parse(userData);
          setEmpresa(user);
        }
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
      }
    };

    fetchEmpresaData();
    fetchRelatorios();
  }, [periodo]);

  const fetchRelatorios = async () => {
    try {
      setLoading(true);
      // Simular dados de relatórios
      const dadosSimulados: RelatorioData[] = [
        {
          periodo: 'Últimos 7 dias',
          totalChamadas: 1250,
          chamadasResolvidas: 1100,
          satisfacaoMedia: 4.2,
          tempoMedioAtendimento: 8.5,
          operadoresAtivos: 15,
          gestoresAtivos: 3
        },
        {
          periodo: 'Últimos 30 dias',
          totalChamadas: 5200,
          chamadasResolvidas: 4800,
          satisfacaoMedia: 4.1,
          tempoMedioAtendimento: 9.2,
          operadoresAtivos: 18,
          gestoresAtivos: 4
        }
      ];
      
      setRelatorios(dadosSimulados);
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = (formato: string) => {
    console.log(`Exportando relatório em formato ${formato}`);
    // Implementar exportação
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando relatórios...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <HeaderEmpresa empresa={empresa} />

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="gaming-card mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select 
                  value={periodo} 
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="bg-slate-800 text-white rounded-md px-3 py-2 border border-gray-600"
                >
                  <option value="7">Últimos 7 dias</option>
                  <option value="30">Últimos 30 dias</option>
                  <option value="90">Últimos 90 dias</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Relatórios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {relatorios.map((relatorio, index) => (
            <Card key={index} className="gaming-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>{relatorio.periodo}</span>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    Ativo
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Total de Chamadas</p>
                    <p className="text-2xl font-bold text-white">{relatorio.totalChamadas.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Chamadas Resolvidas</p>
                    <p className="text-2xl font-bold text-green-400">{relatorio.chamadasResolvidas.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Satisfação Média</p>
                    <p className="text-2xl font-bold text-yellow-400">{relatorio.satisfacaoMedia}/5.0</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tempo Médio</p>
                    <p className="text-2xl font-bold text-blue-400">{relatorio.tempoMedioAtendimento}min</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Operadores Ativos</p>
                    <p className="text-lg font-semibold text-white">{relatorio.operadoresAtivos}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Gestores Ativos</p>
                    <p className="text-lg font-semibold text-white">{relatorio.gestoresAtivos}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gaming-button"
                    onClick={() => handleExportar('PDF')}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gaming-button"
                    onClick={() => handleExportar('Excel')}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráficos */}
        <div className="mt-8">
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Análise de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Gráficos de performance serão implementados aqui</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RelatoriosEmpresa;
