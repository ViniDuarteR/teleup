import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import HeaderGestor from "@/components/HeaderGestor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { 
  BarChart3, 
  Users, 
  Phone, 
  Clock, 
  Star, 
  TrendingUp, 
  Activity,
  Target,
  Gift,
  Settings,
  CheckCircle,
  AlertCircle,
  XCircle,
  Pause,
  Eye,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface MetricasGestor {
  total_operadores: number;
  operadores_online: number;
  operadores_em_chamada: number;
  operadores_em_pausa: number;
  operadores_offline: number;
  chamadas_ativas: number;
  chamadas_hoje: number;
  satisfacao_media_geral: number;
  meta_diaria_chamadas: number;
  meta_atingida: number;
  tempo_medio_atendimento: number;
  taxa_resolucao: number;
}

interface OperadorResumo {
  id: number;
  nome: string;
  status: string;
  chamadas_hoje: number;
  satisfacao_media: number;
  pontos_totais: number;
  nivel: number;
  tempo_online_minutos: number;
}

const PainelGestor = () => {
  const { user, token } = useAuth();
  const [metricas, setMetricas] = useState<MetricasGestor | null>(null);
  const [operadores, setOperadores] = useState<OperadorResumo[]>([]);
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
        setMetricas(metricasData.data);
      }

      // Buscar operadores
      const operadoresResponse = await fetch(`${API_BASE_URL}/gestor/operadores`, {
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
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados do painel');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    buscarDadosGestor();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(buscarDadosGestor, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const getIconeStatus = (status: string) => {
    switch (status) {
      case 'Online':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'Em Chamada':
        return <Phone className="w-4 h-4 text-primary" />;
      case 'Em Pausa':
        return <Pause className="w-4 h-4 text-warning" />;
      case 'Offline':
        return <XCircle className="w-4 h-4 text-muted-foreground" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getCorStatus = (status: string) => {
    switch (status) {
      case 'Online':
        return 'bg-success text-white';
      case 'Em Chamada':
        return 'bg-primary text-white';
      case 'Em Pausa':
        return 'bg-warning text-white';
      case 'Offline':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
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
      <HeaderGestor gestor={user} />
      
      <div className="pt-24 p-6">
        <div className="container mx-auto max-w-7xl">
          {/* Cabeçalho da Página */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary text-glow mb-2 flex items-center gap-3">
              <BarChart3 className="w-8 h-8" />
              Dashboard Executivo
            </h1>
            <p className="text-muted-foreground">
              Visão geral da operação e monitoramento em tempo real
            </p>
          </div>

          {/* Navegação Rápida */}
          <Card className="gaming-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Ferramentas de Gestão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link to="/gestor/operadores">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                    <Users className="w-6 h-6 text-primary" />
                    <span>Monitor Operadores</span>
                  </Button>
                </Link>
                
                <Link to="/gestor/recompensas">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                    <Gift className="w-6 h-6 text-primary" />
                    <span>Gerenciar Recompensas</span>
                  </Button>
                </Link>
                
                <Link to="/usuarios">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                    <Users className="w-6 h-6 text-primary" />
                    <span>Gerenciar Usuários</span>
                  </Button>
                </Link>
                
                <Link to="/gestores">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                    <Settings className="w-6 h-6 text-primary" />
                    <span>Gerenciar Gestores</span>
                  </Button>
                </Link>
                
                <Link to="/gestor/relatorios">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    <span>Relatórios</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Métricas Principais */}
          {metricas && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="gaming-card">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {metricas.total_operadores}
                  </div>
                  <div className="text-sm text-muted-foreground">Total de Operadores</div>
                </CardContent>
              </Card>

              <Card className="gaming-card">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-success mx-auto mb-3" />
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {metricas.operadores_online}
                  </div>
                  <div className="text-sm text-muted-foreground">Online</div>
                </CardContent>
              </Card>

              <Card className="gaming-card">
                <CardContent className="p-6 text-center">
                  <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {metricas.chamadas_ativas}
                  </div>
                  <div className="text-sm text-muted-foreground">Chamadas Ativas</div>
                </CardContent>
              </Card>

              <Card className="gaming-card">
                <CardContent className="p-6 text-center">
                  <Star className="w-8 h-8 text-warning mx-auto mb-3" />
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {metricas.satisfacao_media_geral.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Satisfação Média</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Status dos Operadores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Status dos Operadores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metricas && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span>Online</span>
                        </div>
                        <Badge className="bg-success text-white">
                          {metricas.operadores_online}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary" />
                          <span>Em Chamada</span>
                        </div>
                        <Badge className="bg-primary text-white">
                          {metricas.operadores_em_chamada}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Pause className="w-4 h-4 text-warning" />
                          <span>Em Pausa</span>
                        </div>
                        <Badge className="bg-warning text-white">
                          {metricas.operadores_em_pausa}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-muted-foreground" />
                          <span>Offline</span>
                        </div>
                        <Badge className="bg-muted text-muted-foreground">
                          {metricas.operadores_offline}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Metas do Dia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metricas && (
                    <>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Chamadas do Dia</span>
                          <span>{metricas.chamadas_hoje} / {metricas.meta_diaria_chamadas}</span>
                        </div>
                        <Progress 
                          value={(metricas.chamadas_hoje / metricas.meta_diaria_chamadas) * 100} 
                          className="h-3" 
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-foreground">
                            {metricas.tempo_medio_atendimento}min
                          </div>
                          <div className="text-sm text-muted-foreground">Tempo Médio</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-foreground">
                            {metricas.taxa_resolucao}%
                          </div>
                          <div className="text-sm text-muted-foreground">Taxa Resolução</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Operadores */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Top Operadores (Hoje)
                </div>
                <Button variant="outline" size="sm" onClick={buscarDadosGestor}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {operadores.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum operador encontrado</p>
                  </div>
                ) : (
                  operadores.slice(0, 5).map((operador, index) => (
                    <div key={operador.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{operador.nome}</div>
                          <div className="text-sm text-muted-foreground">
                            Nv. {operador.nivel} • {operador.pontos_totais?.toLocaleString() || '0'} pontos
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge className={`${getCorStatus(operador.status)} flex items-center gap-1`}>
                          {getIconeStatus(operador.status)}
                          {operador.status}
                        </Badge>
                        
                        <div className="text-right">
                          <div className="font-semibold">{operador.chamadas_hoje} chamadas</div>
                          <div className="text-sm text-muted-foreground">
                            {operador.satisfacao_media.toFixed(1)} ⭐
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PainelGestor;