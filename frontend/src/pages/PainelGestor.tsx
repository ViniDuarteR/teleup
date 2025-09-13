import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import MetricasGeraisEquipe from "@/components/gestor/MetricasGeraisEquipe";
import RankingOperadores from "@/components/gestor/RankingOperadores";
import FerramentaDeGamificacao from "@/components/gestor/FerramentaDeGamificacao";
import TabelaDesempenhoDetalhada from "@/components/gestor/TabelaDesempenhoDetalhada";
import { toast } from "sonner";

interface MetricasEquipe {
  totalOperadores: number;
  operadoresOnline: number;
  chamadasAndamento: number;
  chamadasHoje: number;
  satisfacaoMedia: number;
  metaDiaria: number;
  metaAtingida: number;
}

interface OperadorDesempenho {
  id: number;
  nome: string;
  chamadasHoje: number;
  satisfacaoMedia: number;
  tempoOnline: number;
  pontos: number;
  nivel: number;
  status: string;
}

const PainelGestor = () => {
  const { user, token } = useAuth();
  const [dados, setDados] = useState<MetricasEquipe | null>(null);
  const [operadores, setOperadores] = useState<OperadorDesempenho[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:3001/api';

  // Buscar dados do painel gestor
  const buscarDadosGestor = async () => {
    if (!token) return;

    try {
      setIsLoading(true);

      // Buscar métricas da equipe
      const metricasResponse = await fetch(`${API_BASE_URL}/gestor/metricas-equipe`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const metricasData = await metricasResponse.json();
      if (metricasData.success) {
        setDados(metricasData.data);
      }

      // Buscar operadores
      const operadoresResponse = await fetch(`${API_BASE_URL}/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const operadoresData = await operadoresResponse.json();
      if (operadoresData.success) {
        setOperadores(operadoresData.data);
      }

    } catch (error) {
      console.error('Erro ao buscar dados do painel gestor:', error);
      toast.error('Erro ao carregar dados do painel gestor');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    buscarDadosGestor();
  }, [token]);

  // Remover simulação de dados - agora usamos dados reais da API

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando painel gestor...</p>
        </div>
      </div>
    );
  }

  if (!user || !dados) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Dados não encontrados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header operador={user} />
      
      <div className="pt-24 p-6">
        <div className="container mx-auto max-w-7xl">
          {/* Cabeçalho da Página */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary text-glow mb-2">
              Painel do Gestor
            </h1>
            <p className="text-muted-foreground">
              Dashboard executivo para monitoramento e gestão da equipe
            </p>
          </div>

          {/* Métricas Principais */}
          <MetricasGeraisEquipe metricas={dados} />

          {/* Rankings e Gamificação */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <RankingOperadores operadores={operadores} />
            <FerramentaDeGamificacao 
              operadores={operadores.map(op => ({ id: op.id, nome: op.nome }))}
              missoesAtivas={[]}
            />
          </div>

          {/* Tabela Detalhada */}
          <TabelaDesempenhoDetalhada operadores={operadores} />
        </div>
      </div>
    </div>
  );
};

export default PainelGestor;