import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/useAuth';
import { toast } from 'sonner';
import { Save, Upload, User, X, Camera } from 'lucide-react';
import HeaderEmpresa from '@/components/HeaderEmpresa';

const ConfiguracoesEmpresa = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.avatar) {
      setPreviewUrl(user.avatar);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem');
        return;
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo permitido: 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(user?.avatar || '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveAvatar = async () => {
    if (!selectedFile) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('teleup_token');
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/empresas/avatar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Avatar atualizado com sucesso!');
        // Atualizar o usuário no contexto
        if (user) {
          user.avatar = data.data.avatar;
          localStorage.setItem('teleup_user', JSON.stringify(user));
        }
        // Limpar arquivo selecionado
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(data.message || 'Erro ao atualizar avatar');
      }
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderEmpresa empresa={user} />
      
      <div className="p-6 pt-24">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Configurações da Empresa</h1>
            <p className="text-muted-foreground">Gerencie as configurações da sua empresa</p>
          </div>

          <Card className="gaming-card-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Avatar da Empresa
              </CardTitle>
              <CardDescription>
                Atualize o avatar da sua empresa. Selecione uma imagem do seu computador.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Atual */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-4 border-primary/50">
                  <AvatarImage src={previewUrl || user.avatar} alt={user.nome} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-xl">
                    {user.nome?.split(' ').map(n => n[0]).join('').toUpperCase() || 'E'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.nome}</p>
                  <p className="text-sm text-muted-foreground">Avatar atual</p>
                </div>
              </div>

              {/* Upload de arquivo */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg cursor-pointer transition-all duration-300 hover:scale-105"
                  >
                    <Camera className="w-4 h-4" />
                    Escolher Imagem
                  </label>
                  
                  {selectedFile && (
                    <Button
                      onClick={removeSelectedFile}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remover
                    </Button>
                  )}
                </div>

                {selectedFile && (
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      onClick={handleSaveAvatar}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Avatar
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Informações sobre upload */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Informações sobre o upload:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Formatos aceitos: JPG, PNG, GIF, WebP</li>
                  <li>• Tamanho máximo: 5MB</li>
                  <li>• A imagem será redimensionada automaticamente</li>
                  <li>• Recomendado: imagem quadrada para melhor resultado</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracoesEmpresa;
