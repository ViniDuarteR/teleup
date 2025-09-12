import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  BarChart3,
  Circle
} from "lucide-react";

interface Operador {
  id: number;
  nome: string;
  avatar: string;
  status: string;
  pontosHoje: number;
  chamadasHoje: number;
  tempoMedioAtendimento: string;
  nivel: number;
}

interface TabelaDesempenhoDetalhadaProps {
  operadores: Operador[];
}

type TipoOrdenacao = 'nome' | 'status' | 'chamadas' | 'tempo' | 'pontos';
type DirecaoOrdenacao = 'asc' | 'desc';

const TabelaDesempenhoDetalhada = ({ operadores }: TabelaDesempenhoDetalhadaProps) => {
  const [filtro, setFiltro] = useState("");
  const [ordenacao, setOrdenacao] = useState<{
    tipo: TipoOrdenacao;
    direcao: DirecaoOrdenacao;
  }>({
    tipo: 'pontos',
    direcao: 'desc'
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'online':
        return { 
          cor: 'bg-success', 
          texto: 'Online', 
          variant: 'default' as const 
        };
      case 'chamada':
        return { 
          cor: 'bg-primary', 
          texto: 'Em Chamada', 
          variant: 'default' as const 
        };
      case 'pausa':
        return { 
          cor: 'bg-warning', 
          texto: 'Em Pausa', 
          variant: 'secondary' as const 
        };
      case 'offline':
        return { 
          cor: 'bg-muted', 
          texto: 'Offline', 
          variant: 'outline' as const 
        };
      default:
        return { 
          cor: 'bg-muted', 
          texto: 'Desconhecido', 
          variant: 'outline' as const 
        };
    }
  };

  const handleOrdenacao = (tipo: TipoOrdenacao) => {
    setOrdenacao(prev => ({
      tipo,
      direcao: prev.tipo === tipo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
  };

  const operadoresFiltrados = operadores.filter(operador =>
    operador.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  const operadoresOrdenados = [...operadoresFiltrados].sort((a, b) => {
    const fator = ordenacao.direcao === 'asc' ? 1 : -1;
    
    switch (ordenacao.tipo) {
      case 'nome':
        return a.nome.localeCompare(b.nome) * fator;
      case 'status':
        return a.status.localeCompare(b.status) * fator;
      case 'chamadas':
        return (a.chamadasHoje - b.chamadasHoje) * fator;
      case 'tempo':
        // Converter tempo para segundos para comparação
        const aSegundos = parseInt(a.tempoMedioAtendimento.split('m')[0]) * 60 + 
                         parseInt(a.tempoMedioAtendimento.split('m')[1].split('s')[0]);
        const bSegundos = parseInt(b.tempoMedioAtendimento.split('m')[0]) * 60 + 
                         parseInt(b.tempoMedioAtendimento.split('m')[1].split('s')[0]);
        return (aSegundos - bSegundos) * fator;
      case 'pontos':
        return (a.pontosHoje - b.pontosHoje) * fator;
      default:
        return 0;
    }
  });

  const IconeOrdenacao = ({ tipo }: { tipo: TipoOrdenacao }) => {
    if (ordenacao.tipo !== tipo) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return ordenacao.direcao === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  return (
    <Card className="gaming-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <BarChart3 className="h-5 w-5" />
          Desempenho Detalhado da Equipe
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar operador..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="outline">
            {operadoresFiltrados.length} operador(es)
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleOrdenacao('nome')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Operador
                    <IconeOrdenacao tipo="nome" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleOrdenacao('status')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Status
                    <IconeOrdenacao tipo="status" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleOrdenacao('chamadas')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Chamadas Hoje
                    <IconeOrdenacao tipo="chamadas" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleOrdenacao('tempo')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    TMA
                    <IconeOrdenacao tipo="tempo" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleOrdenacao('pontos')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Pontos Hoje
                    <IconeOrdenacao tipo="pontos" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operadoresOrdenados.map((operador) => {
                const statusConfig = getStatusConfig(operador.status);
                return (
                  <TableRow key={operador.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={operador.avatar} />
                          <AvatarFallback className="text-xs">
                            {operador.nome.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{operador.nome}</div>
                          <div className="text-sm text-muted-foreground">
                            Nível {operador.nivel}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Circle className={`h-2 w-2 ${statusConfig.cor} rounded-full`} />
                        <Badge variant={statusConfig.variant} className="text-xs">
                          {statusConfig.texto}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {operador.chamadasHoje}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {operador.tempoMedioAtendimento}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xp font-medium">
                        {operador.pontosHoje}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {operadoresFiltrados.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum operador encontrado</p>
            <p className="text-sm">Tente ajustar os filtros de busca</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TabelaDesempenhoDetalhada;