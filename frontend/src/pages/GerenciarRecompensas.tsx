import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/useAuth";
import HeaderGestor from "../components/HeaderGestor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "../lib/api";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Gift, 
  Zap, 
  Crown, 
  Heart,
  Coins,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Recompensa {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  tipo?: 'item' | 'beneficio' | 'titulo' | 'avatar';
  raridade?: 'comum' | 'raro' | 'epico' | 'lendario';
  imagem?: string;
  disponivel: boolean;
  quantidade_restante?: number;
}

const GerenciarRecompensas = () => {
  const { user, token } = useAuth();
  const [recompensas, setRecompensas] = useState<Recompensa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editando, setEditando] = useState<Recompensa | null>(null);
  const [formulario, setFormulario] = useState<{
    nome: string;
    descricao: string;
    categoria: string;
    preco: number;
    tipo: 'item' | 'beneficio' | 'titulo' | 'avatar';
    raridade: 'comum' | 'raro' | 'epico' | 'lendario';
    imagem: string;
    disponivel: boolean;
    quantidade_restante: number | null;
  }>({
    nome: '',
    descricao: '',
    categoria: 'Itens',
    preco: 0,
    tipo: 'item',
    raridade: 'comum',
    imagem: '',
    disponivel: true,
    quantidade_restante: null
  });
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [arquivoImagem, setArquivoImagem] = useState<File | null>(null);
  const [mostrarModalSucesso, setMostrarModalSucesso] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');


  // Buscar recompensas
  const buscarRecompensas = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/recompensas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (data.success) {
        setRecompensas(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar recompensas:', error);
      toast.error('Erro ao carregar recompensas');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Salvar recompensa
  const salvarRecompensa = async () => {
    console.log('🔍 [SALVAR RECOMPENSA] Função chamada');
    console.log('🔍 [SALVAR RECOMPENSA] Botão clicado!');
    console.log('🔍 [SALVAR RECOMPENSA] Token:', token ? 'existe' : 'não existe');
    console.log('🔍 [SALVAR RECOMPENSA] Editando:', editando);
    console.log('🔍 [SALVAR RECOMPENSA] Formulário:', formulario);
    
    if (!token) {
      console.log('❌ [SALVAR RECOMPENSA] Sem token, abortando');
      return;
    }

    try {
      const url = editando 
      ? `${API_BASE_URL}/api/recompensas/${editando.id}`
      : `${API_BASE_URL}/api/recompensas`;
      
      const method = editando ? 'PUT' : 'POST';
      
      console.log('🔍 [SALVAR RECOMPENSA] URL:', url);
      console.log('🔍 [SALVAR RECOMPENSA] Method:', method);
      
      // Se há um arquivo de imagem, usar FormData
      if (arquivoImagem) {
        console.log('🔍 [SALVAR RECOMPENSA] Arquivo de imagem encontrado:', arquivoImagem);
        const formData = new FormData();
        formData.append('imagem', arquivoImagem);
        formData.append('nome', formulario.nome);
        formData.append('descricao', formulario.descricao);
        formData.append('categoria', formulario.categoria);
        formData.append('preco', formulario.preco.toString());
        formData.append('tipo', formulario.tipo);
        formData.append('raridade', formulario.raridade);
        formData.append('disponivel', formulario.disponivel.toString());
        formData.append('quantidade_restante', formulario.quantidade_restante?.toString() || '');
        
        console.log('🔍 [SALVAR RECOMPENSA] Enviando FormData');
        console.log('🔍 [SALVAR RECOMPENSA] FormData contents:');
        for (const [key, value] of formData.entries()) {
          console.log(`  ${key}:`, value);
        }
        
        console.log('🔍 [SALVAR RECOMPENSA] Enviando requisição para:', url);
        console.log('🔍 [SALVAR RECOMPENSA] Método:', method);
        console.log('🔍 [SALVAR RECOMPENSA] Headers:', {
          'Authorization': `Bearer ${token}`
        });
        
        const response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        console.log('🔍 [SALVAR RECOMPENSA] Response recebida!');
        console.log('🔍 [SALVAR RECOMPENSA] Response status:', response.status);
        console.log('🔍 [SALVAR RECOMPENSA] Response ok:', response.ok);
        console.log('🔍 [SALVAR RECOMPENSA] Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          console.log('❌ [SALVAR RECOMPENSA] Response not ok, status:', response.status);
          const errorText = await response.text();
          console.log('❌ [SALVAR RECOMPENSA] Error response:', errorText);
          toast.error(`Erro ${response.status}: ${errorText}`);
          return;
        }
        
        const responseText = await response.text();
        console.log('🔍 [SALVAR RECOMPENSA] Raw response text:', responseText);
        
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('🔍 [SALVAR RECOMPENSA] Parsed response data:', data);
        } catch (parseError) {
          console.error('❌ [SALVAR RECOMPENSA] Erro ao fazer parse do JSON:', parseError);
          console.error('❌ [SALVAR RECOMPENSA] Response text que falhou:', responseText);
          toast.error('Erro ao processar resposta do servidor');
          return;
        }
        
        if (data.success) {
          console.log('✅ [SALVAR RECOMPENSA] Sucesso!');
          const mensagem = editando ? 'Recompensa atualizada com sucesso!' : 'Recompensa criada com sucesso!';
          setMensagemSucesso(mensagem);
          setMostrarModalSucesso(true);
          toast.success(mensagem);
          buscarRecompensas();
          limparFormulario();
          setIsModalOpen(false);
        } else {
          console.log('❌ [SALVAR RECOMPENSA] Erro:', data.message);
          toast.error(data.message || 'Erro ao salvar recompensa');
        }
      } else {
        // Se não há arquivo, enviar como JSON normal
        console.log('🔍 [SALVAR RECOMPENSA] Nenhum arquivo de imagem, enviando JSON');
        console.log('🔍 [SALVAR RECOMPENSA] JSON data:', JSON.stringify(formulario, null, 2));
        
        const response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formulario)
        });
        
        console.log('🔍 [SALVAR RECOMPENSA] Response status:', response.status);
        console.log('🔍 [SALVAR RECOMPENSA] Response ok:', response.ok);
        
        if (!response.ok) {
          console.log('❌ [SALVAR RECOMPENSA] Response not ok, status:', response.status);
          const errorText = await response.text();
          console.log('❌ [SALVAR RECOMPENSA] Error response:', errorText);
          toast.error(`Erro ${response.status}: ${errorText}`);
          return;
        }
        
        const data = await response.json();
        console.log('🔍 [SALVAR RECOMPENSA] Response data:', data);

        if (data.success) {
          console.log('✅ [SALVAR RECOMPENSA] Sucesso!');
          const mensagem = editando ? 'Recompensa atualizada com sucesso!' : 'Recompensa criada com sucesso!';
          setMensagemSucesso(mensagem);
          setMostrarModalSucesso(true);
          toast.success(mensagem);
          buscarRecompensas();
          limparFormulario();
          setIsModalOpen(false);
        } else {
          console.log('❌ [SALVAR RECOMPENSA] Erro:', data.message);
          toast.error(data.message || 'Erro ao salvar recompensa');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar recompensa:', error);
      toast.error('Erro ao conectar com o servidor');
    }
  };

  // Excluir recompensa
  const excluirRecompensa = async (id: number) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/recompensas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();

      if (data.success) {
        toast.success('Recompensa excluída!');
        buscarRecompensas();
      } else {
        toast.error(data.message || 'Erro ao excluir recompensa');
      }
    } catch (error) {
      console.error('Erro ao excluir recompensa:', error);
      toast.error('Erro ao conectar com o servidor');
    }
  };

  // Toggle disponibilidade
  const toggleDisponibilidade = async (id: number, disponivel: boolean) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/recompensas/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ disponivel: !disponivel })
      });
      
      const data = await response.json();

      if (data.success) {
        toast.success(disponivel ? 'Recompensa desabilitada!' : 'Recompensa habilitada!');
        buscarRecompensas();
      } else {
        toast.error(data.message || 'Erro ao alterar status');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao conectar com o servidor');
    }
  };

  const limparFormulario = () => {
    setFormulario({
      nome: '',
      descricao: '',
      categoria: 'Itens',
      preco: 0,
      tipo: 'item',
      raridade: 'comum',
      imagem: '',
      disponivel: true,
      quantidade_restante: null
    });
    setEditando(null);
    setMostrarFormulario(false);
    setIsModalOpen(false);
    setImagemPreview(null);
    setArquivoImagem(null);
  };

  // Função para lidar com o upload de imagem
  const handleImagemChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔍 [UPLOAD IMAGEM] Input change detectado');
    const file = event.target.files?.[0];
    console.log('🔍 [UPLOAD IMAGEM] Arquivo selecionado:', file);
    
    if (file) {
      console.log('🔍 [UPLOAD IMAGEM] Nome do arquivo:', file.name);
      console.log('🔍 [UPLOAD IMAGEM] Tipo do arquivo:', file.type);
      console.log('🔍 [UPLOAD IMAGEM] Tamanho do arquivo:', file.size);
      
      // Verificar se é uma imagem
      if (!file.type.startsWith('image/')) {
        console.log('❌ [UPLOAD IMAGEM] Arquivo não é uma imagem');
        toast.error('Por favor, selecione apenas arquivos de imagem');
        return;
      }
      
      // Verificar tamanho do arquivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.log('❌ [UPLOAD IMAGEM] Arquivo muito grande');
        toast.error('A imagem deve ter no máximo 5MB');
        return;
      }

      console.log('✅ [UPLOAD IMAGEM] Arquivo válido, definindo no estado');
      setArquivoImagem(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagemPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Função para remover imagem
  const removerImagem = () => {
    setArquivoImagem(null);
    setImagemPreview(null);
    // Limpar o input de arquivo
    const input = document.getElementById('imagem-input') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  };

  const editarRecompensa = (recompensa: Recompensa) => {
    console.log('🔍 [EDITAR RECOMPENSA] Função chamada com:', recompensa);
    
    setFormulario({
      nome: recompensa.nome || '',
      descricao: recompensa.descricao || '',
      categoria: recompensa.categoria || 'Itens',
      preco: recompensa.preco || 0,
      tipo: (recompensa.tipo || 'item') as 'item' | 'beneficio' | 'titulo' | 'avatar',
      raridade: (recompensa.raridade || 'comum') as 'comum' | 'raro' | 'epico' | 'lendario',
      imagem: recompensa.imagem || '',
      disponivel: recompensa.disponivel !== undefined ? recompensa.disponivel : true,
      quantidade_restante: recompensa.quantidade_restante || null
    });
    
    console.log('🔍 [EDITAR RECOMPENSA] Formulário atualizado');
    setEditando(recompensa);
    setIsModalOpen(true);
    console.log('🔍 [EDITAR RECOMPENSA] Estados atualizados - editando:', recompensa, 'isModalOpen: true');
    
    // Se já tem imagem, mostrar preview
    if (recompensa.imagem) {
      setImagemPreview(recompensa.imagem);
    } else {
      setImagemPreview(null);
    }
    setArquivoImagem(null);
  };

  const getIconeCategoria = (categoria: string) => {
    switch (categoria) {
      case 'Itens':
        return <Gift className="w-4 h-4" />;
      case 'Benefícios':
        return <Zap className="w-4 h-4" />;
      case 'Títulos':
        return <Crown className="w-4 h-4" />;
      case 'Avatares':
        return <Heart className="w-4 h-4" />;
      default:
        return <Gift className="w-4 h-4" />;
    }
  };

  const getCorRaridade = (raridade?: string) => {
    switch (raridade) {
      case 'comum':
        return 'bg-gray-500 text-white';
      case 'raro':
        return 'bg-blue-500 text-white';
      case 'epico':
        return 'bg-purple-500 text-white';
      case 'lendario':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  useEffect(() => {
    buscarRecompensas();
  }, [token]); // Depender apenas do token, não da função

  // Debug do estado removido para evitar logs desnecessários

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando recompensas...</p>
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
                <Gift className="w-8 h-8 text-primary" />
                Gerenciar Recompensas
              </h1>
              <p className="text-muted-foreground">Crie e gerencie recompensas para a loja</p>
            </div>
            
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="btn-gaming">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Recompensa
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editando ? 'Editar Recompensa' : 'Criar Nova Recompensa'}</DialogTitle>
                  <DialogDescription>
                    {editando ? 'Atualize os dados da recompensa' : 'Adicione uma nova recompensa para os operadores'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome da Recompensa</Label>
                      <Input
                        id="nome"
                        value={formulario.nome}
                        onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoria</Label>
                      <Select 
                        value={formulario.categoria} 
                        onValueChange={(value) => setFormulario({ ...formulario, categoria: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Itens">Itens</SelectItem>
                          <SelectItem value="Benefícios">Benefícios</SelectItem>
                          <SelectItem value="Títulos">Títulos</SelectItem>
                          <SelectItem value="Avatares">Avatares</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formulario.descricao}
                      onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preco">Preço (Pontos)</Label>
                      <Input
                        id="preco"
                        type="number"
                        value={formulario.preco}
                        onChange={(e) => setFormulario({ ...formulario, preco: parseInt(e.target.value) || 0 })}
                        min="1"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select 
                        value={formulario.tipo} 
                        onValueChange={(value) => setFormulario({ ...formulario, tipo: value as 'item' | 'beneficio' | 'titulo' | 'avatar' })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="item">Item</SelectItem>
                          <SelectItem value="beneficio">Benefício</SelectItem>
                          <SelectItem value="titulo">Título</SelectItem>
                          <SelectItem value="avatar">Avatar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="raridade">Raridade</Label>
                      <Select 
                        value={formulario.raridade} 
                        onValueChange={(value) => setFormulario({ ...formulario, raridade: value as 'comum' | 'raro' | 'epico' | 'lendario' })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a raridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comum">Comum</SelectItem>
                          <SelectItem value="raro">Raro</SelectItem>
                          <SelectItem value="epico">Épico</SelectItem>
                          <SelectItem value="lendario">Lendário</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="imagem">Imagem da Recompensa</Label>
                    <Input
                      id="imagem-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImagemChange}
                    />
                    {imagemPreview && (
                      <div className="mt-2">
                        <img 
                          src={imagemPreview} 
                          alt="Preview" 
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={removerImagem}
                          className="mt-2"
                        >
                          Remover Imagem
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantidade_restante">Quantidade Restante (Opcional)</Label>
                      <Input
                        id="quantidade_restante"
                        type="number"
                        value={formulario.quantidade_restante || ''}
                        onChange={(e) => setFormulario({ 
                          ...formulario, 
                          quantidade_restante: e.target.value ? parseInt(e.target.value) : null 
                        })}
                        min="1"
                        placeholder="Deixe vazio para ilimitado"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Disponível</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="disponivel"
                          checked={formulario.disponivel}
                          onChange={(e) => setFormulario({ ...formulario, disponivel: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="disponivel" className="text-sm">
                          Recompensa disponível para compra
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsModalOpen(false);
                        limparFormulario();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="button" onClick={salvarRecompensa} className="btn-gaming">
                      <Save className="w-4 h-4 mr-2" />
                      {editando ? 'Atualizar Recompensa' : 'Criar Recompensa'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Formulário */}
          {mostrarFormulario && (
            <>
              {console.log('🔍 [FORM RENDER] Formulário sendo renderizado, mostrarFormulario:', mostrarFormulario)}
              <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {editando ? 'Editar Recompensa' : 'Nova Recompensa'}
                  <Button variant="ghost" size="sm" onClick={limparFormulario}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      value={formulario.nome}
                      onChange={(e) => setFormulario({...formulario, nome: e.target.value})}
                      placeholder="Nome da recompensa"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <select
                      id="categoria"
                      value={formulario.categoria}
                      onChange={(e) => setFormulario({...formulario, categoria: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="Itens">Itens</option>
                      <option value="Benefícios">Benefícios</option>
                      <option value="Títulos">Títulos</option>
                      <option value="Avatares">Avatares</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="preco">Preço (Pontos)</Label>
                    <Input
                      id="preco"
                      type="number"
                      value={formulario.preco}
                      onChange={(e) => setFormulario({...formulario, preco: parseInt(e.target.value) || 0})}
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tipo">Tipo</Label>
                    <select
                      id="tipo"
                      value={formulario.tipo}
                      onChange={(e) => setFormulario({...formulario, tipo: e.target.value as 'item' | 'beneficio' | 'titulo' | 'avatar'})}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="item">Item</option>
                      <option value="beneficio">Benefício</option>
                      <option value="titulo">Título</option>
                      <option value="avatar">Avatar</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="raridade">Raridade</Label>
                    <select
                      id="raridade"
                      value={formulario.raridade}
                      onChange={(e) => setFormulario({...formulario, raridade: e.target.value as 'comum' | 'raro' | 'epico' | 'lendario'})}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="comum">Comum</option>
                      <option value="raro">Raro</option>
                      <option value="epico">Épico</option>
                      <option value="lendario">Lendário</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="quantidade">Quantidade Restante (opcional)</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      value={formulario.quantidade_restante || ''}
                      onChange={(e) => setFormulario({...formulario, quantidade_restante: e.target.value ? parseInt(e.target.value) : null})}
                      placeholder="Deixe vazio para ilimitado"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formulario.descricao}
                    onChange={(e) => setFormulario({...formulario, descricao: e.target.value})}
                    placeholder="Descrição da recompensa"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="imagem-input">Imagem da Recompensa</Label>
                  <div className="space-y-3">
                    <Input
                      id="imagem-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImagemChange}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-muted-foreground">
                      Selecione uma imagem (JPG, PNG, GIF - máx. 5MB)
                    </p>
                    
                    {/* Preview da imagem */}
                    {imagemPreview && (
                      <div className="relative">
                        <img 
                          src={imagemPreview} 
                          alt="Preview da recompensa"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-dashed border-gray-300"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={removerImagem}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        >
                          ×
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formulario.disponivel}
                      onChange={(e) => setFormulario({...formulario, disponivel: e.target.checked})}
                      className="rounded"
                    />
                    <span>Disponível na loja</span>
                  </label>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      console.log('🔍 [BUTTON CLICK] Botão clicado!');
                      salvarRecompensa();
                    }} 
                    className="btn-gaming px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editando ? 'Atualizar' : 'Criar'}
                  </button>
                  <Button variant="outline" onClick={limparFormulario}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
            </>
          )}

          {/* Lista de Recompensas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recompensas.map((recompensa) => (
              <Card key={recompensa.id} className="gaming-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${getCorRaridade(recompensa.raridade)} capitalize`}>
                      {recompensa.raridade || 'comum'}
                    </Badge>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      {getIconeCategoria(recompensa.categoria)}
                      <span className="text-xs">{recompensa.categoria}</span>
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg">{recompensa.nome}</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {recompensa.descricao}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-primary" />
                      <span className="font-bold text-primary">
                        {recompensa.preco?.toLocaleString() || '0'}
                      </span>
                    </div>
                    
                    <Badge variant={recompensa.disponivel ? "default" : "secondary"}>
                      {recompensa.disponivel ? 'Disponível' : 'Indisponível'}
                    </Badge>
                  </div>
                  
                  {recompensa.quantidade_restante !== null && (
                    <div className="text-sm text-muted-foreground">
                      {recompensa.quantidade_restante} restantes
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editarRecompensa(recompensa)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleDisponibilidade(recompensa.id, recompensa.disponivel)}
                    >
                      {recompensa.disponivel ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-1" />
                          Desabilitar
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          Habilitar
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => excluirRecompensa(recompensa.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Sucesso */}
      <Dialog open={mostrarModalSucesso} onOpenChange={setMostrarModalSucesso}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Gift className="w-5 h-5" />
              Sucesso!
            </DialogTitle>
            <DialogDescription className="text-center py-4">
              {mensagemSucesso}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Button 
              onClick={() => setMostrarModalSucesso(false)}
              className="bg-green-600 hover:bg-green-700"
            >
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GerenciarRecompensas;
