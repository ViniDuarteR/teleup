import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/useAuth";
import HeaderGestor from "../components/HeaderGestor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { API_BASE_URL } from "../lib/api";
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Meta {
  id: number;
  operador_id: number;
  operador_nome: string;
  operador_email: string;
  tipo_meta: 'Chamadas Atendidas' | 'Tempo de Conversa' | 'Resolucoes' | 'Satisfacao Cliente';
  valor_atual: number;
  valor_meta: number;
  periodo: 'Diario' | 'Semanal' | 'Mensal';
  data_inicio: string;
  data_fim: string;
  ativa: boolean;
  pontos_recompensa: number;
  data_criacao: string;
  data_atualizacao: string;
}

interface Operador {
  id: number;
  nome: string;
  email: string;
}

const GerenciarMetas = () => {
  const { user, token } = useAuth();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMeta, setSelectedMeta] = useState<Meta | null>(null);
  const [formData, setFormData] = useState({
    operador_id: '',
    tipo_meta: '' as Meta['tipo_meta'] | '',
    valor_meta: '',
    periodo: '' as Meta['periodo'] | '',
    data_inicio: '',
    data_fim: '',
    pontos_recompensa: '100'
  });

  // Buscar dados
  const buscarDados = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);

      // Buscar metas
      const metasResponse = await fetch(`${API_BASE_URL}/api/metas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const metasData = await metasResponse.json();

      if (metasData.success) {
        setMetas(metasData.data);
      }

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

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Criar meta
  const criarMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/metas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operador_id: parseInt(formData.operador_id),
          tipo_meta: formData.tipo_meta,
          valor_meta: parseInt(formData.valor_meta),
          periodo: formData.periodo,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim,
          pontos_recompensa: parseInt(formData.pontos_recompensa)
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Meta criada com sucesso!');
        setIsDialogOpen(false);
        setFormData({
          operador_id: '',
          tipo_meta: '',
          valor_meta: '',
          periodo: '',
          data_inicio: '',
          data_fim: '',
          pontos_recompensa: '100'
        });
        buscarDados();
      } else {
        toast.error(data.message || 'Erro ao criar meta');
      }
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      toast.error('Erro ao conectar com o servidor');
    }
  };

  // Atualizar meta
  const atualizarMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeta || !token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/metas/${selectedMeta.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tipo_meta: formData.tipo_meta,
          valor_meta: parseInt(formData.valor_meta),
          periodo: formData.periodo,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim,
          pontos_recompensa: parseInt(formData.pontos_recompensa)
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Meta atualizada com sucesso!');
        setIsEditDialogOpen(false);
        setSelectedMeta(null);
        buscarDados();
      } else {
        toast.error(data.message || 'Erro ao atualizar meta');
      }
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      toast.error('Erro ao conectar com o servidor');
    }
  };

  // Excluir meta
  const excluirMeta = async (id: number) => {
    if (!token) return;

    if (!confirm('Tem certeza que deseja excluir esta meta?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/metas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Meta excluída com sucesso!');
        buscarDados();
      } else {
        toast.error(data.message || 'Erro ao excluir meta');
      }
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      toast.error('Erro ao conectar com o servidor');
    }
  };

  // Abrir dialog de edição
  const abrirEdicao = (meta: Meta) => {
    setSelectedMeta(meta);
    setFormData({
      operador_id: meta.operador_id.toString(),
      tipo_meta: meta.tipo_meta,
      valor_meta: meta.valor_meta.toString(),
      periodo: meta.periodo,
      data_inicio: meta.data_inicio,
      data_fim: meta.data_fim,
      pontos_recompensa: meta.pontos_recompensa.toString()
    });
    setIsEditDialogOpen(true);
  };

  const getIconeTipoMeta = (tipo: string) => {
    switch (tipo) {
      case 'Chamadas Atendidas':
        return <Users className="w-4 h-4" />;
      case 'Tempo de Conversa':
        return <Clock className="w-4 h-4" />;
      case 'Resolucoes':
        return <CheckCircle className="w-4 h-4" />;
      case 'Satisfacao Cliente':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getCorTipoMeta = (tipo: string) => {
    switch (tipo) {
      case 'Chamadas Atendidas':
        return 'bg-primary text-white';
      case 'Tempo de Conversa':
        return 'bg-secondary text-white';
      case 'Resolucoes':
        return 'bg-success text-white';
      case 'Satisfacao Cliente':
        return 'bg-warning text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const calcularProgresso = (atual: number, meta: number) => {
    if (meta <= 0) return 0;
    return Math.min((atual / meta) * 100, 100);
  };

  useEffect(() => {
    buscarDados();
  }, [buscarDados]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando metas...</p>
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
                <Target className="w-8 h-8 text-primary" />
                Gerenciar Metas
              </h1>
              <p className="text-muted-foreground">Defina e acompanhe as metas dos seus operadores</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-gaming">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Meta
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Criar Nova Meta</DialogTitle>
                  <DialogDescription>
                    Defina uma nova meta para um operador
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={criarMeta} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="operador_id">Operador</Label>
                    <Select 
                      value={formData.operador_id} 
                      onValueChange={(value) => setFormData({ ...formData, operador_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o operador" />
                      </SelectTrigger>
                      <SelectContent>
                        {operadores.map((operador) => (
                          <SelectItem key={operador.id} value={operador.id.toString()}>
                            {operador.nome} ({operador.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tipo_meta">Tipo de Meta</Label>
                    <Select 
                      value={formData.tipo_meta} 
                      onValueChange={(value) => setFormData({ ...formData, tipo_meta: value as Meta['tipo_meta'] })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Chamadas Atendidas">Chamadas Atendidas</SelectItem>
                        <SelectItem value="Tempo de Conversa">Tempo de Conversa</SelectItem>
                        <SelectItem value="Resolucoes">Resoluções</SelectItem>
                        <SelectItem value="Satisfacao Cliente">Satisfação Cliente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="valor_meta">Valor da Meta</Label>
                    <Input
                      id="valor_meta"
                      type="number"
                      value={formData.valor_meta}
                      onChange={(e) => setFormData({ ...formData, valor_meta: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="periodo">Período</Label>
                    <Select 
                      value={formData.periodo} 
                      onValueChange={(value) => setFormData({ ...formData, periodo: value as Meta['periodo'] })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Diario">Diário</SelectItem>
                        <SelectItem value="Semanal">Semanal</SelectItem>
                        <SelectItem value="Mensal">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="data_inicio">Data de Início</Label>
                      <Input
                        id="data_inicio"
                        type="date"
                        value={formData.data_inicio}
                        onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="data_fim">Data de Fim</Label>
                      <Input
                        id="data_fim"
                        type="date"
                        value={formData.data_fim}
                        onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pontos_recompensa">Pontos de Recompensa</Label>
                    <Input
                      id="pontos_recompensa"
                      type="number"
                      value={formData.pontos_recompensa}
                      onChange={(e) => setFormData({ ...formData, pontos_recompensa: e.target.value })}
                      min="1"
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
                      Criar Meta
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de Metas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metas.length === 0 ? (
              <div className="col-span-full">
                <Card className="gaming-card">
                  <CardContent className="p-8 text-center">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma meta encontrada</h3>
                    <p className="text-muted-foreground">
                      Crie a primeira meta para começar a acompanhar o desempenho dos operadores.
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              metas.map((meta) => (
                <Card key={meta.id} className="gaming-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={`${getCorTipoMeta(meta.tipo_meta)} flex items-center gap-1`}>
                        {getIconeTipoMeta(meta.tipo_meta)}
                        {meta.tipo_meta}
                      </Badge>
                      <Badge variant={meta.ativa ? "default" : "secondary"}>
                        {meta.ativa ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-lg">{meta.operador_nome}</CardTitle>
                    <p className="text-sm text-muted-foreground">{meta.operador_email}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso:</span>
                        <span className="font-semibold">
                          {meta.valor_atual} / {meta.valor_meta}
                        </span>
                      </div>
                      
                      <Progress 
                        value={calcularProgresso(meta.valor_atual, meta.valor_meta)} 
                        className="h-2" 
                      />
                      
                      <div className="text-xs text-muted-foreground text-center">
                        {calcularProgresso(meta.valor_atual, meta.valor_meta).toFixed(1)}% completo
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Período:</span>
                        <span className="font-semibold">{meta.periodo}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Recompensa:</span>
                        <span className="font-semibold text-primary">
                          {meta.pontos_recompensa} pontos
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Válida até:</span>
                        <span className="font-semibold">
                          {new Date(meta.data_fim).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirEdicao(meta)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => excluirMeta(meta.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Meta</DialogTitle>
            <DialogDescription>
              Atualize os dados da meta
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={atualizarMeta} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_tipo_meta">Tipo de Meta</Label>
              <Select 
                value={formData.tipo_meta} 
                onValueChange={(value) => setFormData({ ...formData, tipo_meta: value as Meta['tipo_meta'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chamadas Atendidas">Chamadas Atendidas</SelectItem>
                  <SelectItem value="Tempo de Conversa">Tempo de Conversa</SelectItem>
                  <SelectItem value="Resolucoes">Resoluções</SelectItem>
                  <SelectItem value="Satisfacao Cliente">Satisfação Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_valor_meta">Valor da Meta</Label>
              <Input
                id="edit_valor_meta"
                type="number"
                value={formData.valor_meta}
                onChange={(e) => setFormData({ ...formData, valor_meta: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_periodo">Período</Label>
              <Select 
                value={formData.periodo} 
                onValueChange={(value) => setFormData({ ...formData, periodo: value as Meta['periodo'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Diario">Diário</SelectItem>
                  <SelectItem value="Semanal">Semanal</SelectItem>
                  <SelectItem value="Mensal">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_data_inicio">Data de Início</Label>
                <Input
                  id="edit_data_inicio"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_data_fim">Data de Fim</Label>
                <Input
                  id="edit_data_fim"
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_pontos_recompensa">Pontos de Recompensa</Label>
              <Input
                id="edit_pontos_recompensa"
                type="number"
                value={formData.pontos_recompensa}
                onChange={(e) => setFormData({ ...formData, pontos_recompensa: e.target.value })}
                min="1"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="btn-gaming">
                Atualizar Meta
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GerenciarMetas;
