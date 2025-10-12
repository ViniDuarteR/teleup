import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Gamepad2, 
  Plus, 
  Target, 
  Clock, 
  Users, 
  X,
  CheckCircle
} from "lucide-react";

interface Operador {
  id: number;
  nome: string;
}

interface MissaoAtiva {
  id: number;
  titulo: string;
  descricao: string;
  recompensa: number;
  progresso: number;
  atribuicao: string;
  dataVencimento: string;
}

interface FerramentaDeGamificacaoProps {
  operadores: Operador[];
  missoesAtivas: MissaoAtiva[];
}

const FerramentaDeGamificacao = ({ operadores, missoesAtivas }: FerramentaDeGamificacaoProps) => {
  const { toast } = useToast();
  const [novaMissao, setNovaMissao] = useState({
    titulo: "",
    descricao: "",
    recompensa: "",
    atribuicao: "toda-equipe",
    operadoresEspecificos: [] as number[]
  });

  const handleCriarMissao = () => {
    if (!novaMissao.titulo || !novaMissao.descricao || !novaMissao.recompensa) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Simular criação de missão
    toast({
      title: "Missão Criada!",
      description: `"${novaMissao.titulo}" foi lançada com sucesso`,
    });

    // Limpar formulário
    setNovaMissao({
      titulo: "",
      descricao: "",
      recompensa: "",
      atribuicao: "toda-equipe",
      operadoresEspecificos: []
    });
  };

  const handleCancelarMissao = (missaoId: number, titulo: string) => {
    toast({
      title: "Missão Cancelada",
      description: `"${titulo}" foi removida das missões ativas`,
      variant: "destructive"
    });
  };

  const formatarDataVencimento = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="gaming-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Gamepad2 className="h-5 w-5" />
          Ferramenta de Gamificação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="criar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="criar" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Criar Missão
            </TabsTrigger>
            <TabsTrigger value="ativas" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Missões Ativas ({missoesAtivas.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="criar" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="titulo">Título da Missão *</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Maratona de Resoluções"
                  value={novaMissao.titulo}
                  onChange={(e) => setNovaMissao(prev => ({ ...prev, titulo: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  placeholder="Ex: Resolva 20 chamadas até o final do dia"
                  value={novaMissao.descricao}
                  onChange={(e) => setNovaMissao(prev => ({ ...prev, descricao: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="recompensa">Recompensa em Pontos *</Label>
                <Input
                  id="recompensa"
                  type="number"
                  placeholder="100"
                  value={novaMissao.recompensa}
                  onChange={(e) => setNovaMissao(prev => ({ ...prev, recompensa: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="atribuicao">Atribuição</Label>
                <Select
                  value={novaMissao.atribuicao}
                  onValueChange={(value) => setNovaMissao(prev => ({ ...prev, atribuicao: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="toda-equipe">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Toda a Equipe
                      </div>
                    </SelectItem>
                    <SelectItem value="especificos">Operadores Específicos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {novaMissao.atribuicao === "especificos" && (
                <div>
                  <Label>Selecionar Operadores</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {operadores.map((operador) => (
                      <div key={operador.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`op-${operador.id}`}
                          checked={novaMissao.operadoresEspecificos.includes(operador.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNovaMissao(prev => ({
                                ...prev,
                                operadoresEspecificos: [...prev.operadoresEspecificos, operador.id]
                              }));
                            } else {
                              setNovaMissao(prev => ({
                                ...prev,
                                operadoresEspecificos: prev.operadoresEspecificos.filter(id => id !== operador.id)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={`op-${operador.id}`} className="text-sm">
                          {operador.nome}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleCriarMissao} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Lançar Missão
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="ativas" className="mt-6">
            {missoesAtivas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma missão ativa no momento</p>
                <p className="text-sm">Crie uma nova missão para engajar sua equipe</p>
              </div>
            ) : (
              <div className="space-y-4">
                {missoesAtivas.map((missao) => (
                  <Card key={missao.id} className="bg-card/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{missao.titulo}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{missao.descricao}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelarMissao(missao.id, missao.titulo)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">{missao.progresso}%</span>
                        </div>
                        <Progress value={missao.progresso} className="h-2" />

                        <div className="flex justify-between items-center">
                          <Badge variant="secondary" className="text-xp">
                            {missao.recompensa} pontos
                          </Badge>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatarDataVencimento(missao.dataVencimento)}
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          <Users className="h-3 w-3 inline mr-1" />
                          {missao.atribuicao}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FerramentaDeGamificacao;
