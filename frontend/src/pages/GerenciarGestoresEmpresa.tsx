import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import HeaderEmpresa from '@/components/HeaderEmpresa';
import { 
  Building2, 
  Users, 
  Plus, 
  Search,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  X
} from 'lucide-react';

interface EmpresaData {
  id: number;
  nome: string;
  email: string;
  status: string;
}

interface GestorData {
  id: number;
  nome: string;
  email: string;
  status: string;
  dataCriacao: string;
  ultimoLogin?: string;
  operadoresGerenciados: number;
}

const GerenciarGestoresEmpresa: React.FC = () => {
  const [empresa, setEmpresa] = useState<EmpresaData | null>(null);
  const [gestores, setGestores] = useState<GestorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: ''
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGestor, setSelectedGestor] = useState<GestorData | null>(null);
  const [editFormData, setEditFormData] = useState({
    nome: '',
    email: '',
    senha: ''
  });

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
    fetchGestores();
  }, []);

  const fetchGestores = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('teleup_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/empresas/gestores`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Normaliza campos vindos do backend (snake_case -> camelCase)
        const normalizados: GestorData[] = (data.data || []).map((g: any) => ({
          id: g.id,
          nome: g.nome,
          email: g.email,
          status: g.status,
          dataCriacao: g.data_criacao || g.dataCriacao || null,
          ultimoLogin: g.data_ultimo_login || g.ultimoLogin || undefined,
          operadoresGerenciados: g.operadoresGerenciados ?? g.total_operadores ?? 0,
        }));
        setGestores(normalizados);
      } else {
        // Dados simulados para demonstração
        const dadosSimulados: GestorData[] = [
          {
            id: 1,
            nome: 'Hyttalo Costa',
            email: 'hyttalo@teleup.com',
            status: 'Ativo',
            dataCriacao: '2025-10-07',
            ultimoLogin: '2025-10-07 14:30',
            operadoresGerenciados: 0
          }
        ];
        setGestores(dadosSimulados);
      }
    } catch (error) {
      console.error('Erro ao buscar gestores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGestor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('teleup_token');
      console.log('🔍 [CRIAR GESTOR] Token:', token ? 'presente' : 'ausente');
      console.log('🔍 [CRIAR GESTOR] Dados:', formData);
      console.log('🔍 [CRIAR GESTOR] URL:', `${import.meta.env.VITE_API_URL}/api/empresas/gestores`);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/empresas/gestores`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      console.log('🔍 [CRIAR GESTOR] Status:', response.status);
      console.log('🔍 [CRIAR GESTOR] Response:', await response.text());

      if (response.ok) {
        setFormData({ nome: '', email: '', senha: '' });
        setShowForm(false);
        fetchGestores();
        setShowSuccessModal(true);
        // Auto fechar o modal após 3 segundos
        setTimeout(() => setShowSuccessModal(false), 3000);
      } else {
        alert('Erro ao criar gestor. Verifique o console para mais detalhes.');
      }
    } catch (error) {
      console.error('Erro ao criar gestor:', error);
      alert('Erro ao criar gestor: ' + error);
    }
  };

  const handleDeleteGestor = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este gestor?')) {
      try {
        const token = localStorage.getItem('teleup_token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/empresas/gestores/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          fetchGestores();
        }
      } catch (error) {
        console.error('Erro ao excluir gestor:', error);
      }
    }
  };

  const handleViewGestor = (gestor: GestorData) => {
    setSelectedGestor(gestor);
    setShowViewModal(true);
  };

  const handleEditGestor = (gestor: GestorData) => {
    setSelectedGestor(gestor);
    setEditFormData({
      nome: gestor.nome,
      email: gestor.email,
      senha: ''
    });
    setShowEditModal(true);
  };

  const handleUpdateGestor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGestor) return;

    try {
      const token = localStorage.getItem('teleup_token');
      const updateData = {
        ...editFormData,
        // Se senha estiver vazia, não incluir no update
        ...(editFormData.senha && { senha: editFormData.senha })
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/empresas/gestores/${selectedGestor.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedGestor(null);
        fetchGestores();
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
      } else {
        alert('Erro ao atualizar gestor.');
      }
    } catch (error) {
      console.error('Erro ao atualizar gestor:', error);
      alert('Erro ao atualizar gestor: ' + error);
    }
  };

  const filteredGestores = gestores.filter(gestor =>
    gestor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gestor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando gestores...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <HeaderEmpresa empresa={empresa} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Formulário de Novo Gestor */}
        {showForm && (
          <Card className="gaming-card mb-6">
            <CardHeader>
              <CardTitle className="text-white">Adicionar Novo Gestor</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGestor} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome" className="text-gray-300">Nome Completo</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="gaming-input"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="gaming-input"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="senha" className="text-gray-300">Senha</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className="gaming-input"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="gaming-button">
                    Criar Gestor
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowForm(false)}
                    className="gaming-button"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Busca e Ações */}
        <Card className="gaming-card mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar gestores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="gaming-input pl-10"
                />
              </div>
              <Button 
                onClick={() => setShowForm(true)}
                className="gaming-button flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Gestor
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Gestores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredGestores.map((gestor) => (
            <Card key={gestor.id} className="gaming-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{gestor.nome}</CardTitle>
                  <Badge 
                    variant="outline" 
                    className={gestor.status === 'Ativo' ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}
                  >
                    {gestor.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-300">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="text-sm">{gestor.email}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-300">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">Criado em: {gestor.dataCriacao ? new Date(gestor.dataCriacao).toLocaleDateString() : '—'}</span>
                  </div>

                  {gestor.ultimoLogin && (
                    <div className="flex items-center text-gray-300">
                      <Phone className="w-4 h-4 mr-2" />
                      <span className="text-sm">Último login: {gestor.ultimoLogin}</span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-300">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-sm">{(gestor.operadoresGerenciados ?? 0)} operadores</span>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gaming-button"
                    onClick={() => handleViewGestor(gestor)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gaming-button"
                    onClick={() => handleEditGestor(gestor)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gaming-button text-red-400 border-red-400 hover:bg-red-400/10"
                    onClick={() => handleDeleteGestor(gestor.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGestores.length === 0 && (
          <Card className="gaming-card">
            <CardContent className="text-center py-8">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Nenhum gestor encontrado</h3>
              <p className="text-gray-400">
                {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece adicionando um novo gestor.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-slate-800 to-purple-900 border border-purple-500 rounded-lg p-6 max-w-md mx-4 animate-in zoom-in-95">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">
              Sucesso!
            </h3>
            <p className="text-gray-300 text-center mb-4">
              Gestor {selectedGestor ? 'atualizado' : 'criado'} com sucesso!
            </p>
            <div className="flex justify-center">
              <Button 
                onClick={() => setShowSuccessModal(false)}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Ok
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {showViewModal && selectedGestor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-slate-800 to-purple-900 border border-purple-500 rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Detalhes do Gestor</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Nome</Label>
                <p className="text-white font-medium">{selectedGestor.nome}</p>
              </div>
              <div>
                <Label className="text-gray-300">Email</Label>
                <p className="text-white font-medium">{selectedGestor.email}</p>
              </div>
              <div>
                <Label className="text-gray-300">Status</Label>
                <Badge 
                  variant="outline" 
                  className={selectedGestor.status === 'Ativo' ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}
                >
                  {selectedGestor.status}
                </Badge>
              </div>
              <div>
                <Label className="text-gray-300">Data de Criação</Label>
                <p className="text-white font-medium">
                  {selectedGestor.dataCriacao ? new Date(selectedGestor.dataCriacao).toLocaleDateString('pt-BR') : '—'}
                </p>
              </div>
              <div>
                <Label className="text-gray-300">Operadores Gerenciados</Label>
                <p className="text-white font-medium">{selectedGestor.operadoresGerenciados ?? 0}</p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => setShowViewModal(false)}
                className="gaming-button"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {showEditModal && selectedGestor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-slate-800 to-purple-900 border border-purple-500 rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Editar Gestor</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <form onSubmit={handleUpdateGestor} className="space-y-4">
              <div>
                <Label htmlFor="edit-nome" className="text-gray-300">Nome Completo</Label>
                <Input
                  id="edit-nome"
                  value={editFormData.nome}
                  onChange={(e) => setEditFormData({ ...editFormData, nome: e.target.value })}
                  className="gaming-input"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-email" className="text-gray-300">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="gaming-input"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-senha" className="text-gray-300">
                  Nova Senha <span className="text-gray-500">(deixe em branco para manter a atual)</span>
                </Label>
                <Input
                  id="edit-senha"
                  type="password"
                  value={editFormData.senha}
                  onChange={(e) => setEditFormData({ ...editFormData, senha: e.target.value })}
                  className="gaming-input"
                  placeholder="Digite nova senha ou deixe em branco"
                />
              </div>

              <div className="flex space-x-2 mt-6">
                <Button type="submit" className="gaming-button">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEditModal(false)}
                  className="gaming-button"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciarGestoresEmpresa;
