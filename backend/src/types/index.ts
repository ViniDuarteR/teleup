import { Request } from 'express';

// Tipos de banco de dados
export interface Operador {
  id: string;
  nome: string;
  email: string;
  senha: string;
  tipo: 'operador' | 'gestor';
  avatar?: string;
  nivel: number;
  xp_atual: number;
  xp_proximo_nivel: number;
  pontos_totais: number;
  status: 'Ativo' | 'Inativo' | 'Suspenso';
  status_operacional: 'Aguardando Chamada' | 'Em Chamada' | 'Em Pausa' | 'Offline';
  tempo_online: number;
  data_criacao: Date;
  data_atualizacao: Date;
}

export interface Chamada {
  id: string;
  operador_id: string;
  numero_cliente?: string;
  inicio_chamada: Date;
  fim_chamada?: Date;
  duracao_segundos: number;
  tipo_chamada: 'Entrada' | 'Saida' | 'Interna';
  status: 'Em Andamento' | 'Finalizada' | 'Transferida' | 'Abandonada';
  satisfacao_cliente?: number;
  resolvida: boolean;
  observacoes?: string;
  pontos_ganhos: number;
}

export interface Meta {
  id: string;
  operador_id: string;
  tipo_meta: 'Chamadas Atendidas' | 'Tempo de Conversa' | 'Resolucoes' | 'Satisfacao Cliente';
  valor_atual: number;
  valor_meta: number;
  periodo: 'Diario' | 'Semanal' | 'Mensal';
  data_inicio: Date;
  data_fim: Date;
  ativa: boolean;
  pontos_recompensa: number;
}

export interface Missao {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'Diaria' | 'Semanal' | 'Mensal' | 'Especial';
  meta_valor: number;
  pontos_recompensa: number;
  ativa: boolean;
  data_criacao: Date;
  data_expiracao?: Date;
}

export interface OperadorMissao {
  id: string;
  operador_id: string;
  missao_id: string;
  progresso_atual: number;
  concluida: boolean;
  data_inicio: Date;
  data_conclusao?: Date;
}

export interface Conquista {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
  condicao_tipo: 'Chamadas' | 'Tempo' | 'Satisfacao' | 'Resolucoes' | 'Pontos' | 'Nivel';
  condicao_valor: number;
  pontos_recompensa: number;
  ativa: boolean;
}

export interface OperadorConquista {
  id: string;
  operador_id: string;
  conquista_id: string;
  data_desbloqueio: Date;
}

export interface Ranking {
  id: string;
  operador_id: string;
  posicao: number;
  pontos_semana: number;
  pontos_mes: number;
  chamadas_semana: number;
  chamadas_mes: number;
  data_atualizacao: Date;
}

export interface Sessao {
  id: string;
  operador_id: string;
  token: string;
  data_criacao: Date;
  data_expiracao: Date;
  ativa: boolean;
}

// Tipos de requisição
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    tipo: string;
  };
  operador?: Operador;
  empresa?: Empresa;
  token?: string;
}

// Tipos de resposta da API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  debug?: string;
}

// Tipos para login
export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  operador: Omit<Operador, 'senha'>;
}

// Tipos para dashboard
export interface DashboardData {
  operador: Omit<Operador, 'senha'>;
  metas: Meta[];
  missoes: (Missao & { progresso_atual: number; concluida: boolean })[];
  conquistas: (Conquista & { data_desbloqueio?: Date; desbloqueada: boolean })[];
  estatisticas: {
    chamadas_hoje: number;
    tempo_total: number;
    satisfacao_media: number;
    resolucoes: number;
  };
}

// Tipos para chamadas
export interface IniciarChamadaRequest {
  numero_cliente?: string;
  tipo_chamada?: 'Entrada' | 'Saida' | 'Interna';
}

export interface FinalizarChamadaRequest {
  chamada_id: string;
  satisfacao_cliente?: number;
  resolvida: boolean;
  observacoes?: string;
}

// Tipos para gamificação
export interface EstatisticasGamificacao {
  nivel: number;
  xp_atual: number;
  xp_proximo_nivel: number;
  progresso_nivel: number;
  pontos_totais: number;
  missoes_concluidas: number;
  conquistas_desbloqueadas: number;
  posicao_ranking?: number;
}

// Tipos para gestor
export interface MetricasEquipe {
  chamadas_andamento: number;
  operadores_disponiveis: number;
  operadores_pausa: number;
  operadores_offline: number;
  total_operadores: number;
  eficiencia_discador: number;
  nivel_ociosidade: number;
  tempo_medio_atendimento: number;
  satisfacao_media: number;
}

export interface OperadorDesempenho extends Omit<Operador, 'senha'> {
  total_chamadas: number;
  tempo_total_minutos: number;
  tempo_medio_minutos: number;
  satisfacao_media: number;
  total_resolucoes: number;
  taxa_resolucao: number;
  pontos_periodo: number;
  posicao?: number;
}

// Tipos para WebSocket
export interface SocketData {
  operador_id: string;
  status?: string;
  chamada_id?: string;
  pontos_ganhos?: number;
  nova_conquista?: Conquista;
}

// Tipos para empresa
export interface Empresa {
  id: string;
  nome: string;
  email: string;
  status: string;
  avatar?: string;
  data_ultimo_login?: Date;
}