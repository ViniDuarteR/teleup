import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { API_BASE_URL } from '../lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Key, Users, Crown, Star, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  nivel: number;
  xp_atual: number;
  xp_proximo_nivel: number;
  pontos_totais: number;
  status: string;
  avatar: string;
  tempo_online: number;
  data_criacao: string;
  data_atualizacao: string;
  pa?: string;
  carteira?: string;
}

const GerenciarUsuarios = () => {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    nivel: 1,
    status: 'Aguardando Chamada',
    pa: '',
    carteira: ''
  });

  

  // Buscar usuários
  const buscarUsuarios = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setUsuarios(data.data);
      } else {
        toast.error('Erro ao carregar usuários');
      }
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    buscarUsuarios();
  }, [buscarUsuarios]);

  // Criar usuário
  const criarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Usuário criado com sucesso!');
        setIsDialogOpen(false);
        setFormData({ nome: '', email: '', senha: '', nivel: 1, status: 'Aguardando Chamada', pa: '', carteira: '' });
        buscarUsuarios();
      } else {
        toast.error(data.message || 'Erro ao criar usuário');
      }
    } catch (error) {
      toast.error('Erro ao criar usuário');
    }
  };

  // Atualizar usuário
  const atualizarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUsuario) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios/${selectedUsuario.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          nivel: formData.nivel,
          status: formData.status
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Usuário atualizado com sucesso!');
        setIsEditDialogOpen(false);
        setSelectedUsuario(null);
        buscarUsuarios();
      } else {
        toast.error(data.message || 'Erro ao atualizar usuário');
      }
    } catch (error) {
      toast.error('Erro ao atualizar usuário');
    }
  };

  // Excluir usuário
  const excluirUsuario = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Usuário excluído com sucesso!');
        buscarUsuarios();
      } else {
        toast.error(data.message || 'Erro ao excluir usuário');
      }
    } catch (error) {
      toast.error('Erro ao excluir usuário');
    }
  };

  // Redefinir senha
  const redefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUsuario) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios/${selectedUsuario.id}/redefinir-senha`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ novaSenha: formData.senha })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Senha redefinida com sucesso!');
        setIsPasswordDialogOpen(false);
        setFormData({ ...formData, senha: '' });
      } else {
        toast.error(data.message || 'Erro ao redefinir senha');
      }
    } catch (error) {
      toast.error('Erro ao redefinir senha');
    }
  };

  // Abrir dialog de edição
  const abrirEdicao = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      senha: '',
      nivel: usuario.nivel,
      status: usuario.status,
      pa: usuario.pa || '',
      carteira: usuario.carteira || ''
    });
    setIsEditDialogOpen(true);
  };

  // Abrir dialog de redefinir senha
  const abrirRedefinirSenha = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setFormData({ ...formData, senha: '' });
    setIsPasswordDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponível': return 'bg-green-500';
      case 'Em Chamada': return 'bg-blue-500';
      case 'Pausa': return 'bg-yellow-500';
      case 'Aguardando Chamada': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getNivelIcon = (nivel: number) => {
    if (nivel >= 4) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (nivel >= 2) return <Star className="w-4 h-4 text-blue-500" />;
    return <Zap className="w-4 h-4 text-green-500" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">Gerenciar Usuários</h1>
            <p className="text-muted-foreground">Gerencie os operadores da sua empresa</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gaming">
                <Plus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Adicione um novo operador à sua empresa
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={criarUsuario} className="space-y-4">
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
                <div className="space-y-2">
                  <Label htmlFor="nivel">Nível</Label>
                  <Select
                    value={formData.nivel?.toString() || '1'}
                    onValueChange={(value) => setFormData({ ...formData, nivel: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Nível 1 - Iniciante</SelectItem>
                      <SelectItem value="2">Nível 2 - Intermediário</SelectItem>
                      <SelectItem value="3">Nível 3 - Avançado</SelectItem>
                      <SelectItem value="4">Nível 4 - Especialista</SelectItem>
                      <SelectItem value="5">Nível 5 - Mestre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pa">PA (Ponto de Acesso)</Label>
                  <Input
                    id="pa"
                    value={formData.pa}
                    onChange={(e) => setFormData({ ...formData, pa: e.target.value })}
                    placeholder="Ex: PA001, PA002"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carteira">Carteira</Label>
                  <Input
                    id="carteira"
                    value={formData.carteira}
                    onChange={(e) => setFormData({ ...formData, carteira: e.target.value })}
                    placeholder="Ex: Carteira A, Carteira B"
                  />
                </div>
                <Button type="submit" className="btn-gaming w-full">
                  Criar Usuário
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usuários da Empresa ({usuarios.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>PA</TableHead>
                  <TableHead>Carteira</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {usuario.nome.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{usuario.nome}</p>
                          <p className="text-sm text-muted-foreground">{usuario.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getNivelIcon(usuario.nivel)}
                        <span className="font-medium">Nível {usuario.nivel}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-right">
                        <p className="font-medium">{usuario.pontos_totais?.toLocaleString() || '0'}</p>
                        <p className="text-sm text-muted-foreground">
                          {usuario.xp_atual}/{usuario.xp_proximo_nivel} XP
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{usuario.pa || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{usuario.carteira || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(usuario.status)} text-white`}>
                        {usuario.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirEdicao(usuario)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirRedefinirSenha(usuario)}
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => excluirUsuario(usuario.id)}
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                Atualize as informações do usuário
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={atualizarUsuario} className="space-y-4">
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
                <Label htmlFor="edit-nivel">Nível</Label>
                <Select
                  value={formData.nivel?.toString() || '1'}
                  onValueChange={(value) => setFormData({ ...formData, nivel: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Nível 1 - Iniciante</SelectItem>
                    <SelectItem value="2">Nível 2 - Intermediário</SelectItem>
                    <SelectItem value="3">Nível 3 - Avançado</SelectItem>
                    <SelectItem value="4">Nível 4 - Especialista</SelectItem>
                    <SelectItem value="5">Nível 5 - Mestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status || 'Aguardando Chamada'}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aguardando Chamada">Aguardando Chamada</SelectItem>
                    <SelectItem value="Disponível">Disponível</SelectItem>
                    <SelectItem value="Em Chamada">Em Chamada</SelectItem>
                    <SelectItem value="Pausa">Pausa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="btn-gaming w-full">
                Atualizar Usuário
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Redefinir Senha */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Redefinir Senha</DialogTitle>
              <DialogDescription>
                Defina uma nova senha para {selectedUsuario?.nome}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={redefinirSenha} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="btn-gaming w-full">
                Redefinir Senha
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GerenciarUsuarios;
