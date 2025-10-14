import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/useAuth";
import HeaderGestor from "../components/HeaderGestor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { API_BASE_URL } from "../lib/api";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckCircle2 } from "lucide-react";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [novoOperadorNome, setNovoOperadorNome] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    nivel: 1,
    pa: '',
    carteira: ''
  });


  // Buscar operadores e métricas
  const buscarDados = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);

      // Buscar operadores
      const operadoresResponse = await fetch(`${API_BASE_URL}/api/gestor/operadores`, {
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
      const metricasResponse = await fetch(`${API_BASE_URL}/api/gestor/metricas-equipe`, {
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
  }, [token]);

  // Alterar status do operador
  const alterarStatusOperador = async (operadorId: number, novoStatus: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/gestor/operador/${operadorId}/status`, {
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

  // Criar novo operador
  const criarOperador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/gestor/operadores`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        // Salvar o nome do operador criado para mostrar no popup
        setNovoOperadorNome(formData.nome);
        
        // Fechar o dialog de criação
        setIsDialogOpen(false);
        
        // Limpar o formulário
        setFormData({ nome: '', email: '', senha: '', nivel: 1, pa: '', carteira: '' });
        
        // Atualizar a lista de operadores
        buscarDados();
        
        // Mostrar o popup de sucesso
        setIsSuccessDialogOpen(true);
      } else {
        toast.error(data.message || 'Erro ao criar operador');
      }
    } catch (error) {
      console.error('Erro ao criar operador:', error);
      toast.error('Erro ao conectar com o servidor');
    }
  };

  useEffect(() => {
    buscarDados();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(buscarDados, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Depender apenas do token, não da função

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
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-gaming">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Operador
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Operador</DialogTitle>
                    <DialogDescription>
                      Adicione um novo operador à sua equipe
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={criarOperador} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="senha">Senha</Label>
                      <Input
                        id="senha"
                        type="password"
                        value={formData.senha}
                        onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nivel">Nível Inicial</Label>
                      <Select 
                        value={formData.nivel.toString()} 
                        onValueChange={(value) => setFormData({ ...formData, nivel: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Nível 1 - Iniciante</SelectItem>
                          <SelectItem value="2">Nível 2 - Intermediário</SelectItem>
                          <SelectItem value="3">Nível 3 - Avançado</SelectItem>
                          <SelectItem value="4">Nível 4 - Especialista</SelectItem>
                          <SelectItem value="5">Nível 5 - Master</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pa">PA (Opcional)</Label>
                      <Input
                        id="pa"
                        value={formData.pa}
                        onChange={(e) => setFormData({ ...formData, pa: e.target.value })}
                        placeholder="Código PA do operador"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="carteira">Carteira (Opcional)</Label>
                      <Input
                        id="carteira"
                        value={formData.carteira}
                        onChange={(e) => setFormData({ ...formData, carteira: e.target.value })}
                        placeholder="Número da carteira"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="btn-gaming">
                        Criar Operador
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              
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
                    {metricas?.satisfacao_media_geral ? Number(metricas.satisfacao_media_geral).toFixed(1) : '0.0'}
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
                        <span className="font-semibold">{operador.satisfacao_media ? Number(operador.satisfacao_media).toFixed(1) : '0.0'} ⭐</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Pontos:</span>
                        <span className="font-semibold text-primary">{operador.pontos_totais?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="text-xs text-muted-foreground mb-2">
                        Última atividade: {operador.ultima_atividade ? new Date(operador.ultima_atividade).toLocaleString() : 'Nunca'}
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

      {/* Popup de Sucesso */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col items-center text-center space-y-4 py-6">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            
            <div className="space-y-2">
              <DialogTitle className="text-xl font-semibold text-foreground">
                Operador Criado com Sucesso!
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                O operador <span className="font-semibold text-foreground">{novoOperadorNome}</span> foi adicionado à sua equipe com sucesso.
              </DialogDescription>
            </div>
            
            <div className="flex flex-col space-y-2 w-full">
              <Button 
                onClick={() => setIsSuccessDialogOpen(false)}
                className="btn-gaming w-full"
              >
                Continuar Gerenciando Operadores
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsSuccessDialogOpen(false);
                  setIsDialogOpen(true);
                }}
                className="w-full"
              >
                Criar Outro Operador
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MonitorOperadores;
