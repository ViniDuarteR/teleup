import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  BarChart3,
  CalendarDays,
  Download,
  Filter,
  LineChart,
  PieChart,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

interface IndicadorResumo {
  titulo: string;
  valor: string;
  variacao?: number;
  icone: React.ElementType;
  destaque?: "positivo" | "negativo";
  descricao: string;
}

interface ResultadoEquipe {
  equipe: string;
  chamadas: number;
  resolucao: number;
  satisfacao: number;
  tempoMedio: number;
}

interface ChamadaDiaria {
  data: string;
  total: number;
  resolvidas: number;
}

interface MotivoContato {
  motivo: string;
  percentual: number;
}

const KPI_INICIAIS: IndicadorResumo[] = [
  {
    titulo: "Chamadas Totais",
    valor: "4.820",
    variacao: 12,
    icone: TrendingUp,
    destaque: "positivo",
    descricao: "Volume total de contatos atendidos no período selecionado.",
  },
  {
    titulo: "Taxa de Resolução",
    valor: "88%",
    variacao: -3,
    icone: Target,
    destaque: "negativo",
    descricao: "Percentual de chamados resolvidos no primeiro contato.",
  },
  {
    titulo: "Satisfação Média",
    valor: "4.3 / 5",
    variacao: 8,
    icone: Users,
    destaque: "positivo",
    descricao: "Avaliação média registrada pelos clientes após o atendimento.",
  },
  {
    titulo: "Tempo Médio",
    valor: "7m 45s",
    variacao: -6,
    icone: BarChart3,
    destaque: "positivo",
    descricao: "Duração média dos atendimentos finalizados no período.",
  },
];

const EQUIPES_DISPONIVEIS = ["Todos", "Amanhecer", "Expresso", "Prime", "Noturno"];

const RELATORIO_EQUIPES: ResultadoEquipe[] = [
  { equipe: "Amanhecer", chamadas: 1280, resolucao: 90, satisfacao: 4.4, tempoMedio: 6.8 },
  { equipe: "Expresso", chamadas: 930, resolucao: 84, satisfacao: 4.1, tempoMedio: 7.9 },
  { equipe: "Prime", chamadas: 1460, resolucao: 92, satisfacao: 4.7, tempoMedio: 6.1 },
  { equipe: "Noturno", chamadas: 1150, resolucao: 81, satisfacao: 3.9, tempoMedio: 8.6 },
];

const HISTORICO_CHAMADAS: ChamadaDiaria[] = Array.from({ length: 14 }).map((_, index) => {
  const data = new Date();
  data.setDate(data.getDate() - (13 - index));
  return {
    data: format(data, "dd/MM", { locale: ptBR }),
    total: Math.round(280 + Math.random() * 120),
    resolvidas: Math.round(220 + Math.random() * 90),
  };
});

const MOTIVOS_CONTATO: MotivoContato[] = [
  { motivo: "Suporte técnico", percentual: 34 },
  { motivo: "Dúvidas comerciais", percentual: 22 },
  { motivo: "Retenção / cancelamento", percentual: 18 },
  { motivo: "Cobrança", percentual: 15 },
  { motivo: "Outros", percentual: 11 },
];

const RelatoriosGestor = () => {
  const [periodo, setPeriodo] = useState<"7" | "15" | "30">("15");
  const [equipesSelecionadas, setEquipesSelecionadas] = useState<string[]>(["Todos"]);
  const [indicadores, setIndicadores] = useState<IndicadorResumo[]>(KPI_INICIAIS);
  const [carregando, setCarregando] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date>(new Date());

  const equipesFiltradas = useMemo(() => {
    if (equipesSelecionadas.includes("Todos")) return RELATORIO_EQUIPES;
    return RELATORIO_EQUIPES.filter((resultado) => equipesSelecionadas.includes(resultado.equipe));
  }, [equipesSelecionadas]);

  useEffect(() => {
    const atualizarIndicadores = async () => {
      setCarregando(true);
      // simula latência de rede
      await new Promise((resolve) => setTimeout(resolve, 600));
      setIndicadores(
        KPI_INICIAIS.map((item) => ({
          ...item,
          valor: item.valor,
          variacao: item.variacao,
        }))
      );
      setUltimaAtualizacao(new Date());
      setCarregando(false);
    };

    atualizarIndicadores();
  }, [periodo, equipesSelecionadas]);

  const handleExportar = (tipo: "pdf" | "excel") => {
    toast.success(`Relatório exportado como ${tipo.toUpperCase()}`);
  };

  const handleAtualizar = () => {
    setPeriodo("15");
    setEquipesSelecionadas(["Todos"]);
    toast.info("Filtros resetados para o padrão");
  };

  const toggleEquipe = (equipe: string) => {
    setEquipesSelecionadas((prev) => {
      if (equipe === "Todos") {
        return ["Todos"];
      }

      const semTodos = prev.filter((item) => item !== "Todos");
      if (semTodos.includes(equipe)) {
        const novaLista = semTodos.filter((item) => item !== equipe);
        return novaLista.length === 0 ? ["Todos"] : novaLista;
      }

      return [...semTodos, equipe];
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="border-b border-white/10 bg-black/30 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 lg:px-8 lg:py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold lg:text-3xl">Relatórios Operacionais</h1>
              <p className="mt-1 text-sm text-white/70">
                Acompanhe métricas de produtividade, qualidade de atendimento e desempenho das equipes.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => handleExportar("pdf")}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => handleExportar("excel")}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar Excel
              </Button>
              <Button variant="default" className="btn-gaming" onClick={handleAtualizar}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Resetar Filtros
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/60">
            <CalendarDays className="h-4 w-4" />
            Última atualização em{" "}
            <span className="font-semibold text-white">
              {format(ultimaAtualizacao, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-10 lg:px-8">
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-sm uppercase tracking-wide text-white/60">
              <Filter className="h-4 w-4" />
              Filtros inteligentes
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-indigo-400/40 bg-indigo-500/10 text-indigo-200"
              >
                Período de {periodo} dias
              </Badge>
              <Badge
                variant="outline"
                className="border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
              >
                Equipes: {equipesSelecionadas.includes("Todos") ? "Todas" : equipesSelecionadas.join(", ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/60">Período</span>
                <Tabs value={periodo} onValueChange={(valor) => setPeriodo(valor as "7" | "15" | "30")}>
                  <TabsList className="bg-white/10 text-white">
                    <TabsTrigger value="7" className="data-[state=active]:bg-white/20">
                      Últimos 7 dias
                    </TabsTrigger>
                    <TabsTrigger value="15" className="data-[state=active]:bg-white/20">
                      Últimos 15 dias
                    </TabsTrigger>
                    <TabsTrigger value="30" className="data-[state=active]:bg-white/20">
                      Últimos 30 dias
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <span className="text-white/60">Equipes</span>
                <ScrollArea className="max-h-24 rounded-md border border-white/10 bg-black/20 p-3">
                  <div className="grid grid-cols-2 gap-2 text-xs lg:grid-cols-3">
                    {EQUIPES_DISPONIVEIS.map((equipe) => (
                      <label key={equipe} className="flex items-center gap-2">
                        <Checkbox
                          className="border-white/30 data-[state=checked]:bg-emerald-500"
                          checked={
                            equipe === "Todos"
                              ? equipesSelecionadas.includes("Todos")
                              : equipesSelecionadas.includes(equipe)
                          }
                          onCheckedChange={() => toggleEquipe(equipe)}
                        />
                        <span>{equipe}</span>
                      </label>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {indicadores.map((indicador) => {
            const Icone = indicador.icone;
            return (
              <Card
                key={indicador.titulo}
                className="border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/10 text-white"
              >
                <CardHeader className="space-y-1">
                  <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/60">
                    <Icone className="h-4 w-4 text-white/70" />
                    {indicador.titulo}
                  </CardDescription>
                  <CardTitle className="text-3xl font-semibold">{indicador.valor}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-white/70">
                  {indicador.variacao !== undefined && (
                    <div
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        indicador.destaque === "positivo"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-rose-500/15 text-rose-200"
                      }`}
                    >
                      {indicador.destaque === "positivo" ? "▲" : "▼"} {Math.abs(indicador.variacao)}% vs período anterior
                    </div>
                  )}
                  <p>{indicador.descricao}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LineChart className="h-5 w-5 text-emerald-300" />
                  Tendência de Chamadas Resolvidas
                </CardTitle>
                <CardDescription className="text-white/70">
                  Evolução diária do volume total de atendimentos resolvidos no período selecionado.
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-emerald-400/40 bg-emerald-500/10 text-emerald-200">
                Dados simulados
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full rounded-xl border border-white/10 bg-black/20">
                <div className="flex h-full w-full items-center justify-center text-sm text-white/50">
                  <div className="text-center">
                    <LineChart className="mx-auto mb-3 h-8 w-8 opacity-60" />
                    Visualização de linha será integrada ao módulo de gráficos
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-white/70">
                <div>
                  <span className="block text-xs uppercase text-white/50">Média diária</span>
                  <strong className="text-lg text-white">
                    {Math.round(
                      HISTORICO_CHAMADAS.reduce((acc, item) => acc + item.resolvidas, 0) /
                        HISTORICO_CHAMADAS.length
                    )}
                  </strong>
                </div>
                <div>
                  <span className="block text-xs uppercase text-white/50">Melhor dia</span>
                  <strong className="text-lg text-emerald-300">
                    {
                      HISTORICO_CHAMADAS.reduce((prev, current) =>
                        current.resolvidas > prev.resolvidas ? current : prev
                      ).resolvidas
                    }
                  </strong>
                </div>
                <div>
                  <span className="block text-xs uppercase text-white/50">Tendência</span>
                  <strong className="text-lg text-emerald-300">+6,4% semana</strong>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PieChart className="h-5 w-5 text-indigo-300" />
                Motivos mais frequentes
              </CardTitle>
              <CardDescription className="text-white/70">
                Distribuição percentual das categorias dos atendimentos finalizados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-48 w-full rounded-xl border border-white/10 bg-black/20">
                <div className="flex h-full w-full items-center justify-center text-sm text-white/50">
                  <PieChart className="mr-2 h-6 w-6 opacity-60" />
                  Gráfico de pizza será exibido aqui
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {MOTIVOS_CONTATO.map((item) => (
                  <div key={item.motivo} className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2">
                    <span>{item.motivo}</span>
                    <span className="font-semibold text-indigo-200">{item.percentual}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader className="flex flex-col gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-cyan-300" />
              Ranking de equipes
            </CardTitle>
            <CardDescription className="text-white/70">
              Comparativo das principais métricas operacionais segmentadas por equipe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4 rounded-md border border-white/10 bg-black/30 px-4 py-2 text-xs uppercase tracking-wide text-white/60">
              <span>Equipe</span>
              <span>Chamadas Totais</span>
              <span>Taxa de Resolução</span>
              <span>Satisfação</span>
            </div>
            {equipesFiltradas.map((resultado) => (
              <div
                key={resultado.equipe}
                className="grid grid-cols-4 gap-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-2 font-semibold text-white">
                  <Badge className="bg-white/10 text-white">{resultado.equipe}</Badge>
                </div>
                <div className="text-white/80">{resultado.chamadas.toLocaleString("pt-BR")}</div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-emerald-300">{resultado.resolucao}%</span>
                  <span className="text-xs text-white/50">meta 85%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-indigo-200">{resultado.satisfacao.toFixed(1)}</span>
                  <span className="text-xs text-white/50">meta 4.2</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-rose-300" />
              Últimos destaques individuais
            </CardTitle>
            <CardDescription className="text-white/70">
              Operadores com melhores resultados combinando volume, resolutividade e satisfação.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { nome: "Ana Souza", equipe: "Prime", metricas: "96% resolução • 4.9 satisfação" },
                { nome: "Carlos Mendes", equipe: "Amanhecer", metricas: "1.120 chamadas • 4.5 satisfação" },
                { nome: "Fernanda Ribeiro", equipe: "Expresso", metricas: "7m tempo médio • 92% SLA" },
                { nome: "João Pedro", equipe: "Noturno", metricas: "820 chamadas • 4.3 satisfação" },
              ].map((operador) => (
                <div
                  key={operador.nome}
                  className="rounded-lg border border-white/10 bg-black/30 p-4 transition-all hover:border-white/20 hover:bg-black/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-white">{operador.nome}</p>
                      <p className="text-xs uppercase tracking-wide text-white/50">{operador.equipe}</p>
                    </div>
                    <Badge variant="outline" className="border-rose-400/40 bg-rose-500/10 text-rose-200">
                      Destaque
                    </Badge>
                  </div>
                  <Separator className="my-3 bg-white/10" />
                  <p className="text-sm text-white/70">{operador.metricas}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RelatoriosGestor;


