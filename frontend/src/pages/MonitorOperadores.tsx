import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import HeaderGestor from "../components/HeaderGestor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Phone, 
  Clock, 
  Star, 
  TrendingUp, 
  Activity,
  Pause,
  LogOut,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";

interface OperadorMonitor {
  id: number;
  nome: string;
  email: string;
  status: 'Online' | 'Em Chamada' | 'Em Pausa' | 'Offline';
  nivel: number;
  pontos_totais: number;
  chamadas_hoje: number;
  tempo_online_minutos: number;
  satisfacao_media: number;
  ultima_atividade: string;
  avatar?: string;
}

interface MetricasGerais {
  total_operadores: number;
  operadores_online: number;
  operadores_em_chamada: number;
  operadores_em_pausa: number;
  operadores_offline: number;
  chamadas_ativas: number;
  chamadas_hoje: number;
  satisfacao_media_geral: number;
}

const MonitorOperadores = () => {
  const { user, token } = useAuth();
  const [operadores, setOperadores] = useState<OperadorMonitor[]>([]);
  const [metricas, setMetricas] = useState<MetricasGerais | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  const API_BASE_URL = 'http://localhost:3001/api';

  // Buscar operadores e métricas
  const buscarDados = async () => {
    if (!token) return;

    try {
      setIsLoading(true);

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

      // Buscar métricas gerais
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

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados dos operadores');
    } finally {
      setIsLoading(false);
    }
  };

  // Alterar status do operador
  const alterarStatusOperador = async (operadorId: number, novoStatus: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/gestor/operador/${operadorId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: novoStatus })
      });
      
      const data = await response.json();

      if (data.success) {
        toast.success(`Status do operador alterado para ${novoStatus}`);
        buscarDados();
      } else {
        toast.error(data.message || 'Erro ao alterar status');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao conectar com o servidor');
    }
  };

  useEffect(() => {
    buscarDados();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(buscarDados, 30000);
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

  const operadoresFiltrados = operadores.filter(operador => 
    filtroStatus === 'todos' || operador.status === filtroStatus
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando operadores...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Usuário não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderGestor gestor={user} />
      
      <div className="p-6 pt-24">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                Monitor de Operadores
              </h1>
              <p className="text-muted-foreground">Acompanhe o status e performance dos operadores em tempo real</p>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="todos">Todos os Status</option>
                <option value="Online">Online</option>
                <option value="Em Chamada">Em Chamada</option>
                <option value="Em Pausa">Em Pausa</option>
                <option value="Offline">Offline</option>
              </select>
              
              <Button onClick={buscarDados} variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Métricas Gerais */}
          {metricas && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          {/* Lista de Operadores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {operadoresFiltrados.length === 0 ? (
              <div className="col-span-full">
                <Card className="gaming-card">
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum operador encontrado</h3>
                    <p className="text-muted-foreground">
                      Não há operadores com o status selecionado.
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              operadoresFiltrados.map((operador) => (
                <Card key={operador.id} className="gaming-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={`${getCorStatus(operador.status)} flex items-center gap-1`}>
                        {getIconeStatus(operador.status)}
                        {operador.status}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        Nv. {operador.nivel}
                      </div>
                    </div>
                    
                    <CardTitle className="text-lg">{operador.nome}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Chamadas hoje:</span>
                        <span className="font-semibold">{operador.chamadas_hoje}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Tempo online:</span>
                        <span className="font-semibold">{Math.floor(operador.tempo_online_minutos / 60)}h {operador.tempo_online_minutos % 60}m</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Satisfação:</span>
                        <span className="font-semibold">{operador.satisfacao_media.toFixed(1)} ⭐</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Pontos:</span>
                        <span className="font-semibold text-primary">{operador.pontos_totais.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="text-xs text-muted-foreground mb-2">
                        Última atividade: {new Date(operador.ultima_atividade).toLocaleString()}
                      </div>
                      
                      <div className="flex gap-2">
                        {operador.status !== 'Online' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alterarStatusOperador(operador.id, 'Online')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Online
                          </Button>
                        )}
                        
                        {operador.status !== 'Em Pausa' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alterarStatusOperador(operador.id, 'Em Pausa')}
                          >
                            <Pause className="w-4 h-4 mr-1" />
                            Pausa
                          </Button>
                        )}
                        
                        {operador.status !== 'Offline' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alterarStatusOperador(operador.id, 'Offline')}
                          >
                            <LogOut className="w-4 h-4 mr-1" />
                            Offline
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitorOperadores;
