import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Users, Crown, Star, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Gestor {
  id: number;
  nome: string;
  email: string;
  status: string;
  avatar: string;
  data_criacao: string;
  data_atualizacao: string;
}

const GerenciarGestores = () => {
  const { token, user } = useAuth();
  const [gestores, setGestores] = useState<Gestor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGestor, setSelectedGestor] = useState<Gestor | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    status: 'Ativo'
  });

  const API_BASE_URL = 'http://localhost:3001/api';

  // Buscar gestores
  const buscarGestores = async () => {
    if (!token) return;

    try {
      // Determinar a rota baseada no tipo de usuário
      const endpoint = user?.tipo === 'empresa' ? '/empresas/gestores' : '/gestores';
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setGestores(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar gestores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Criar gestor
  const criarGestor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Determinar a rota baseada no tipo de usuário
      const endpoint = user?.tipo === 'empresa' ? '/empresas/gestores' : '/gestores';
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Gestor criado com sucesso!');
        setIsDialogOpen(false);
        setFormData({ nome: '', email: '', senha: '', status: 'Ativo' });
        buscarGestores();
      } else {
        toast.error(data.message || 'Erro ao criar gestor');
      }
    } catch (error) {
      toast.error('Erro ao criar gestor');
    }
  };

  // Atualizar gestor
  const atualizarGestor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGestor) return;

    try {
      const response = await fetch(`${API_BASE_URL}/gestores/${selectedGestor.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          status: formData.status
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Gestor atualizado com sucesso!');
        setIsEditDialogOpen(false);
        setSelectedGestor(null);
        buscarGestores();
      } else {
        toast.error(data.message || 'Erro ao atualizar gestor');
      }
    } catch (error) {
      toast.error('Erro ao atualizar gestor');
    }
  };

  // Excluir gestor
  const excluirGestor = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este gestor?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/gestores/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Gestor excluído com sucesso!');
        buscarGestores();
      } else {
        toast.error(data.message || 'Erro ao excluir gestor');
      }
    } catch (error) {
      toast.error('Erro ao excluir gestor');
    }
  };

  // Abrir dialog de edição
  const abrirEdicao = (gestor: Gestor) => {
    setSelectedGestor(gestor);
    setFormData({
      nome: gestor.nome,
      email: gestor.email,
      senha: '',
      status: gestor.status
    });
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-500';
      case 'Inativo':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  useEffect(() => {
    buscarGestores();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Carregando gestores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Gerenciar Gestores</h1>
            <p className="text-muted-foreground">
              Gerencie os gestores da sua empresa
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gaming">
                <Plus className="w-4 h-4 mr-2" />
                Novo Gestor
              </Button>
            </DialogTrigger>
            <DialogContent className="gaming-card">
              <DialogHeader>
                <DialogTitle>Criar Novo Gestor</DialogTitle>
                <DialogDescription>
                  Adicione um novo gestor à sua empresa
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={criarGestor} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
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
                <Button type="submit" className="btn-gaming w-full">
                  Criar Gestor
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Gestores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Gestores da Empresa
            </CardTitle>
            <CardDescription>
              Lista de todos os gestores da TeleUp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gestor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gestores.map((gestor) => (
                  <TableRow key={gestor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {gestor.nome.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{gestor.nome}</p>
                          <p className="text-sm text-muted-foreground">{gestor.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(gestor.status)} text-white`}>
                        {gestor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(gestor.data_criacao).toLocaleDateString('pt-BR')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirEdicao(gestor)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => excluirGestor(gestor.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="gaming-card">
            <DialogHeader>
              <DialogTitle>Editar Gestor</DialogTitle>
              <DialogDescription>
                Atualize as informações do gestor
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={atualizarGestor} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nome">Nome</Label>
                <Input
                  id="edit-nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="btn-gaming w-full">
                Atualizar Gestor
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GerenciarGestores;
