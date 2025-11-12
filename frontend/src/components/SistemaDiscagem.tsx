import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/useAuth";
import { toast } from "sonner";
import DialpadDiscagem from "./DialpadDiscagem";
import ModalChamadaAtiva from "./ModalChamadaAtiva";
import FormFinalizarChamada, { DadosFinalizacao } from "./FormFinalizarChamada";
import { API_BASE_URL } from "../lib/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Building2, Clock, PhoneCall, Search, User2, NotebookPen, RefreshCw, PanelRightClose, PanelRightOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChamadaAtiva {
  id: string;
  numero: string;
  tipo: "Entrada" | "Saída";
  inicio: Date;
}

interface ContatoDiscador {
  id: string;
  nome: string;
  numero: string;
  empresa: string;
  segmento: string;
  observacao?: string;
  origem?: string;
}

const TABULACOES_PADRAO = [
  "Venda concluída",
  "Cliente interessado",
  "Agendar retorno",
  "Sem interesse",
  "Suporte finalizado",
  "Transferido para outro setor",
  "Contato indisponível",
];

const CONTATOS_PADRAO: ContatoDiscador[] = [
  {
    id: "mock-1",
    nome: "Ana Souza",
    numero: "11987654321",
    empresa: "Mercado São João",
    segmento: "Varejo",
    observacao: "Cliente ativo - nível ouro",
    origem: "mock",
  },
  {
    id: "mock-2",
    nome: "Marcos Lima",
    numero: "21981234567",
    empresa: "TechPrime",
    segmento: "Tecnologia",
    observacao: "Aguardando proposta comercial",
    origem: "mock",
  },
  {
    id: "mock-3",
    nome: "Cláudia Ramos",
    numero: "31999887766",
    empresa: "HealthCare Plus",
    segmento: "Saúde",
    observacao: "Solicitou demonstração do produto",
    origem: "mock",
  },
  {
    id: "mock-4",
    nome: "Eduardo Santos",
    numero: "41988776655",
    empresa: "AutoMax",
    segmento: "Automotivo",
    observacao: "Retornar com opções de financiamento",
    origem: "mock",
  },
  {
    id: "mock-5",
    nome: "Fernanda Oliveira",
    numero: "51977665544",
    empresa: "GreenFoods",
    segmento: "Alimentos",
    observacao: "Cliente novo – indicado pelo marketing",
    origem: "mock",
  },
  {
    id: "mock-6",
    nome: "João Pedro",
    numero: "71966554433",
    empresa: "SolarUp",
    segmento: "Energia",
    observacao: "Interessado no plano premium",
    origem: "mock",
  },
  {
    id: "mock-7",
    nome: "Luciana Pereira",
    numero: "11999887711",
    empresa: "Casa Verde",
    segmento: "Construção",
    observacao: "Solicitou catálogo atualizado",
    origem: "mock",
  },
  {
    id: "mock-8",
    nome: "Rafael Gomes",
    numero: "21988776644",
    empresa: "FitNow",
    segmento: "Saúde e Fitness",
    observacao: "Interessado em plano corporativo",
    origem: "mock",
  },
  {
    id: "mock-9",
    nome: "Patrícia Nunes",
    numero: "31977666533",
    empresa: "MegaTech",
    segmento: "Tecnologia",
    observacao: "Aguardando proposta de upgrade",
    origem: "mock",
  },
  {
    id: "mock-10",
    nome: "Carlos Alberto",
    numero: "41966554422",
    empresa: "AutoFrota",
    segmento: "Logística",
    observacao: "Renovação de contrato em análise",
    origem: "mock",
  },
  {
    id: "mock-11",
    nome: "Juliana Batista",
    numero: "51955443322",
    empresa: "EcoFoods",
    segmento: "Alimentação",
    observacao: "Aguardando visita técnica",
    origem: "mock",
  },
  {
    id: "mock-12",
    nome: "Marcelo Ribeiro",
    numero: "71944332211",
    empresa: "EnergiaMais",
    segmento: "Energia",
    observacao: "Solicitou simulação de economia",
    origem: "mock",
  },
];

const calcularPontos = (dados: Pick<DadosFinalizacao, "satisfacao_cliente" | "resolvida">) => {
  let pontos = 10;
  if (dados.resolvida) pontos += 20;
  if (dados.satisfacao_cliente >= 4) pontos += 15;
  if (dados.satisfacao_cliente === 5) pontos += 10;
  return pontos;
};

const formatarDuracao = (segundos: number) => {
  const minutos = Math.floor(segundos / 60);
  const segs = segundos % 60;
  return `${minutos.toString().padStart(2, "0")}:${segs.toString().padStart(2, "0")}`;
};

interface SistemaDiscagemProps {
  onAtualizarDashboard?: () => void;
}

const SistemaDiscagem = ({ onAtualizarDashboard }: SistemaDiscagemProps) => {
  const { token, user, updateUser } = useAuth();
  const [chamadaAtiva, setChamadaAtiva] = useState<ChamadaAtiva | null>(null);
  const [duracaoChamada, setDuracaoChamada] = useState(0);
  const [mostrarModalAtiva, setMostrarModalAtiva] = useState(false);
  const [mostrarFormFinalizar, setMostrarFormFinalizar] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [numeroDiscagem, setNumeroDiscagem] = useState("");
  const [filtroContato, setFiltroContato] = useState("");
  const [contatos, setContatos] = useState<ContatoDiscador[]>(CONTATOS_PADRAO);
  const [origemContatos, setOrigemContatos] = useState<"api" | "mock">("mock");
  const [carregandoContatos, setCarregandoContatos] = useState(false);
  const [contatoSelecionado, setContatoSelecionado] = useState<ContatoDiscador | null>(null);
  const [tabulacaoAtual, setTabulacaoAtual] = useState("");
  const [resumoTabulacao, setResumoTabulacao] = useState("");
  const [modoSimulado, setModoSimulado] = useState(false);
  const [listaColapsada, setListaColapsada] = useState(false);
  
  const emChamada = chamadaAtiva !== null;

  const carregarContatos = useCallback(async () => {
    if (!token) {
      setContatos(CONTATOS_PADRAO);
      setOrigemContatos("mock");
      return;
    }

    setCarregandoContatos(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/contatos/discador`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.success && Array.isArray(data.data?.contatos) && data.data.contatos.length > 0) {
        setContatos(
          data.data.contatos.map((contato: ContatoDiscador) => ({
            id: contato.id,
            nome: contato.nome,
            numero: contato.numero,
            empresa: contato.empresa,
            segmento: contato.segmento,
            observacao: contato.observacao,
            origem: contato.origem ?? "api",
          })),
        );
        setOrigemContatos("api");
      } else {
        setContatos(CONTATOS_PADRAO);
        setOrigemContatos("mock");
      }
    } catch (error) {
      console.error("Erro ao carregar contatos do discador:", error);
      toast.warning("Não foi possível carregar a lista de contatos. Usando dados padrão.");
      setContatos(CONTATOS_PADRAO);
      setOrigemContatos("mock");
    } finally {
      setCarregandoContatos(false);
    }
  }, [token]);

  const contatosFiltrados = useMemo(() => {
    const termo = filtroContato.trim().toLowerCase();
    if (!termo) return contatos;
    return contatos.filter((contato) =>
      [contato.nome, contato.numero, contato.empresa, contato.segmento]
        .join(" ")
        .toLowerCase()
        .includes(termo)
    );
  }, [filtroContato, contatos]);

  useEffect(() => {
    carregarContatos();
  }, [carregarContatos]);

  useEffect(() => {
    if (!chamadaAtiva) {
      setDuracaoChamada(0);
      return;
    }

    const interval = setInterval(() => {
      const agora = new Date();
      const diff = Math.floor((agora.getTime() - chamadaAtiva.inicio.getTime()) / 1000);
      setDuracaoChamada(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [chamadaAtiva]);

  const iniciarChamadaLocal = (numero: string, modo: "api" | "simulado", chamadaId?: string) => {
    setChamadaAtiva({
      id: chamadaId ?? Date.now().toString(),
      numero,
      tipo: "Saída",
      inicio: new Date(),
    });
    setMostrarModalAtiva(true);
    setModoSimulado(modo === "simulado");

    if (updateUser && user) {
      updateUser({ ...user, status: "Em Chamada" });
    }
  };

  const iniciarChamada = async (numero: string, origem: "manual" | "contato" = "manual", contato?: ContatoDiscador) => {
    if (emChamada) {
      toast.error("Finalize a chamada atual antes de iniciar outra");
      return;
    }

    if (!numero || numero.length < 8) {
      toast.error("Informe um número válido para iniciar a chamada");
      return;
    }

    setNumeroDiscagem(numero);
    setContatoSelecionado(contato ?? null);
    setTabulacaoAtual("");
    setResumoTabulacao("");

    if (!token) {
      iniciarChamadaLocal(numero, "simulado");
      toast.info("Modo simulado ativo. Chamada iniciada localmente.");
      return;
    }

    try {
      toast.loading("Iniciando chamada...", { id: "iniciando-chamada" });

      const response = await fetch(`${API_BASE_URL}/api/chamadas/iniciar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numero_cliente: numero,
          tipo_chamada: "Saida",
          origem_discagem: origem,
        }),
      });

      const data = await response.json();

      if (data.success) {
        iniciarChamadaLocal(numero, "api", data.data.chamada_id);
        toast.success("Chamada iniciada! 📞", { id: "iniciando-chamada" });
      } else {
        toast.warning(data.message || "Não foi possível iniciar na API. Chamada simulada iniciada.", {
          id: "iniciando-chamada",
        });
        iniciarChamadaLocal(numero, "simulado");
      }
    } catch (error) {
      console.error("Erro ao iniciar chamada:", error);
      toast.warning("Servidor indisponível. Chamada simulada iniciada.", { id: "iniciando-chamada" });
      iniciarChamadaLocal(numero, "simulado");
    } finally {
      toast.dismiss("iniciando-chamada");
    }
  };

  const prepararFinalizacao = () => {
    if (chamadaAtiva) {
      setMostrarModalAtiva(false);
      setMostrarFormFinalizar(true);
    }
  };

  const finalizarChamadaLocal = (pontosGanhos: number) => {
    toast.success(`Chamada finalizada! +${pontosGanhos} pontos ganhos! 🎉`, { duration: 5000 });
    setChamadaAtiva(null);
    setMostrarFormFinalizar(false);
    setDuracaoChamada(0);
    setTabulacaoAtual("");
    setResumoTabulacao("");
    setModoSimulado(false);
    setNumeroDiscagem("");
    setContatoSelecionado(null);

    if (updateUser && user) {
      updateUser({
        ...user,
        status: "Aguardando Chamada",
        pontos_totais: user.pontos_totais + pontosGanhos,
      });
    }

    onAtualizarDashboard?.();
  };

  const finalizarChamada = async (dados: DadosFinalizacao) => {
    if (!chamadaAtiva) return;

    setTabulacaoAtual(dados.tabulacao);
    setResumoTabulacao(dados.resumo_tabulacao);

    const pontosCalculados = calcularPontos(dados);

    try {
      setFinalizando(true);

      if (!token || modoSimulado) {
        finalizarChamadaLocal(pontosCalculados);
        return;
      }

      const payload = {
        ...dados,
        duracao_registrada: duracaoChamada,
        numero_cliente: chamadaAtiva.numero,
      };

      const response = await fetch(`${API_BASE_URL}/api/chamadas/finalizar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        finalizarChamadaLocal(data.data.pontos_ganhos);
        verificarConquistas();
      } else {
        toast.warning(data.message || "Não foi possível registrar a finalização. Salvando localmente.");
        finalizarChamadaLocal(pontosCalculados);
      }
    } catch (error) {
      console.error("Erro ao finalizar chamada:", error);
      toast.warning("Servidor indisponível. Salvando finalização localmente.");
      finalizarChamadaLocal(pontosCalculados);
    } finally {
      setFinalizando(false);
    }
  };

  const verificarConquistas = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/gamificacao/verificar-conquistas`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        const novasConquistas = data.data?.novas_conquistas as Array<{ nome: string }> | undefined;
        if (novasConquistas && novasConquistas.length > 0) {
          novasConquistas.forEach((conquista) => {
            toast.success(`🏆 Nova conquista desbloqueada: ${conquista.nome}!`, {
              duration: 5000,
            });
          });
        }
      }
    } catch (error) {
      console.error("Erro ao verificar conquistas:", error);
    }
  };

  const cancelarFinalizacao = () => {
    if (chamadaAtiva) {
      setMostrarFormFinalizar(false);
      setMostrarModalAtiva(true);
    } else {
      setMostrarFormFinalizar(false);
    }
  };

  const handleSelecionarContato = (contato: ContatoDiscador) => {
    if (emChamada) {
      toast.error("Finalize a chamada atual antes de iniciar outra");
      return;
    }

    setContatoSelecionado(contato);
    setNumeroDiscagem(contato.numero);
    iniciarChamada(contato.numero, "contato", contato);
  };

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "grid items-start gap-6",
          listaColapsada
            ? "lg:grid-cols-[minmax(0,1fr)]"
            : "lg:grid-cols-[minmax(0,1fr)_360px]"
        )}
      >
        <div className="relative">
          <DialpadDiscagem
            onIniciarChamada={(numero) => iniciarChamada(numero, "manual")}
            onFinalizarChamada={prepararFinalizacao}
            emChamada={emChamada}
            disabled={finalizando}
            numeroAtual={numeroDiscagem}
            onNumeroChange={(valor) => {
              setNumeroDiscagem(valor);
              if (!emChamada) {
                setContatoSelecionado(null);
              }
            }}
          />
          {listaColapsada && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-4 top-10 hidden h-10 w-10 rounded-full border border-primary/40 bg-primary/10 text-primary backdrop-blur lg:flex"
              onClick={() => setListaColapsada(false)}
            >
              <PanelRightOpen className="h-5 w-5" />
              <span className="sr-only">Mostrar lista</span>
            </Button>
          )}
        </div>

        {!listaColapsada && (
          <Card className="relative flex h-full flex-col overflow-hidden border border-primary/10 bg-gradient-to-br from-[#181531] via-[#14102b] to-[#0f0d24] p-0 shadow-lg">
            <div className="relative flex items-start justify-between gap-4 border-b border-white/5 bg-white/5 px-6 pb-5 pt-6">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                  <PhoneCall className="h-3.5 w-3.5" />
                  Contatos
                </span>
                <h3 className="text-lg font-semibold text-foreground">Lista Telefônica</h3>
                <p className="text-xs text-muted-foreground">
                  Clique em um contato para iniciar uma chamada imediatamente.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={origemContatos === "api" ? "secondary" : "outline"}
                  className="rounded-full border border-primary/30 bg-primary/10 text-[10px] uppercase tracking-widest text-primary"
                >
                  {origemContatos === "api" ? "Dados da empresa" : "Mock"}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={carregarContatos}
                  disabled={carregandoContatos}
                  className="h-9 w-9 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                >
                  <RefreshCw className={cn("h-4 w-4", carregandoContatos && "animate-spin")} />
                  <span className="sr-only">Atualizar contatos</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden h-9 w-9 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 lg:flex"
                  onClick={() => setListaColapsada(true)}
                >
                  <PanelRightClose className="h-4 w-4" />
                  <span className="sr-only">Colapsar lista</span>
                </Button>
              </div>
            </div>

            <div className="border-b border-white/5 px-6 pb-5 pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                <Input
                  placeholder="Buscar por nome, empresa ou telefone..."
                  className="rounded-2xl border border-white/10 bg-white/5 pl-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
                  value={filtroContato}
                  onChange={(event) => setFiltroContato(event.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1 px-6 pb-6">
              <div className="space-y-3 pb-2">
                {carregandoContatos && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 py-6 text-center text-sm text-muted-foreground">
                    Carregando contatos...
                  </div>
                )}

                {!carregandoContatos && contatosFiltrados.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-muted-foreground">
                    Nenhum contato encontrado com esse filtro.
                  </div>
                )}

                {!carregandoContatos &&
                  contatosFiltrados.length > 0 &&
                  contatosFiltrados.map((contato) => {
                    const selecionado = contatoSelecionado?.id === contato.id;
                    return (
                      <button
                        key={contato.id}
                        onClick={() => handleSelecionarContato(contato)}
                        className={cn(
                          "group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition-all duration-200",
                          "hover:border-primary/40 hover:bg-primary/5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                          selecionado && "border-primary/60 bg-primary/5 shadow-lg"
                        )}
                        type="button"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground/90">
                            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary shadow-inner">
                              <User2 className="h-4 w-4" />
                            </span>
                            {contato.nome}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
                              {contato.segmento}
                            </span>
                            {contato.origem === "mock" && (
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                Mock
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 rounded-full bg-black/20 px-2 py-1 font-mono text-sm text-foreground/90">
                            {contato.numero}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-primary/80" />
                            {contato.empresa}
                          </span>
                        </div>
                        {contato.observacao && (
                          <p className="mt-3 text-xs text-muted-foreground/90">
                            <NotebookPen className="mr-1 inline-block h-3 w-3 text-primary/80" />
                            {contato.observacao}
                          </p>
                        )}
                      </button>
                    );
                  })}
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>

      {emChamada ? (
        <Card className="space-y-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Chamada ativa
              </span>
              <h4 className="text-2xl font-semibold text-foreground">
                {contatoSelecionado?.nome ?? chamadaAtiva?.numero}
              </h4>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {contatoSelecionado && (
                  <>
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {contatoSelecionado.empresa}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-foreground">
                      <PhoneCall className="h-3.5 w-3.5" />
                      {contatoSelecionado.numero}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary">
                {tabulacaoAtual ? `Tabulação: ${tabulacaoAtual}` : "Tabulação pendente"}
              </Badge>
              {modoSimulado && (
                <Badge variant="outline" className="border-dashed border-warning/60 text-warning">
                  Modo simulado
                </Badge>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-muted/30 p-4">
              <Label className="text-xs uppercase text-muted-foreground">Duração</Label>
              <div className="mt-2 flex items-center gap-2 text-xl font-semibold">
                <Clock className="h-4 w-4 text-success" />
                {formatarDuracao(duracaoChamada)}
              </div>
            </div>
            <div className="rounded-xl border bg-muted/30 p-4">
              <Label className="text-xs uppercase text-muted-foreground">Número</Label>
              <div className="mt-2 font-mono text-lg font-semibold">{chamadaAtiva?.numero}</div>
            </div>
            <div className="rounded-xl border bg-muted/30 p-4">
              <Label className="text-xs uppercase text-muted-foreground">Tipo</Label>
              <div className="mt-2 text-lg font-semibold text-primary">{chamadaAtiva?.tipo}</div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">
                Tabulação rápida *
              </Label>
              <Select
                value={tabulacaoAtual}
                onValueChange={setTabulacaoAtual}
                disabled={finalizando}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a tabulação desta chamada" />
                </SelectTrigger>
                <SelectContent>
                  {TABULACOES_PADRAO.map((opcao) => (
                    <SelectItem key={opcao} value={opcao}>
                      {opcao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="tabulacao-resumo" className="text-sm font-semibold text-foreground">
                Resumo da tabulação (opcional)
              </Label>
              <Textarea
                id="tabulacao-resumo"
                placeholder="Adicione um resumo enquanto conversa com o cliente..."
                value={resumoTabulacao}
                onChange={(event) => setResumoTabulacao(event.target.value)}
                disabled={finalizando}
                className="min-h-24 resize-none"
                maxLength={280}
              />
              <div className="text-right text-xs text-muted-foreground">
                {resumoTabulacao.length}/280 caracteres
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              Utilize o botão abaixo para finalizar e registrar a tabulação da chamada.
            </span>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => setMostrarModalAtiva(true)}
                disabled={finalizando}
              >
                Ver detalhes
              </Button>
              <Button
                variant="destructive"
                onClick={prepararFinalizacao}
                disabled={finalizando}
              >
                Encerrar e tabular
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-dashed p-6 text-center text-sm text-muted-foreground">
          Inicie uma chamada pelo discador ou selecione um contato da lista telefônica mock para
          começar um atendimento.
        </Card>
      )}

      {chamadaAtiva && (
        <ModalChamadaAtiva
          aberto={mostrarModalAtiva}
          numeroChamada={chamadaAtiva.numero}
          tipoChamada={chamadaAtiva.tipo}
          onFechar={() => setMostrarModalAtiva(false)}
        />
      )}

      {chamadaAtiva && (
        <FormFinalizarChamada
          aberto={mostrarFormFinalizar}
          chamadaId={chamadaAtiva.id}
          numeroChamada={chamadaAtiva.numero}
          duracao={duracaoChamada}
          onFinalizar={finalizarChamada}
          onCancelar={cancelarFinalizacao}
          tabulacaoInicial={tabulacaoAtual}
          resumoTabulacaoInicial={resumoTabulacao}
          onTabulacaoChange={setTabulacaoAtual}
          onResumoTabulacaoChange={setResumoTabulacao}
          tabulacoesDisponiveis={TABULACOES_PADRAO}
        />
      )}
    </div>
  );
};

export default SistemaDiscagem;

