import { Request } from 'express';
export interface Operador {
    id: number;
    nome: string;
    email: string;
    senha: string;
    avatar?: string;
    nivel: number;
    xp_atual: number;
    xp_proximo_nivel: number;
    pontos_totais: number;
    status: 'Aguardando Chamada' | 'Em Chamada' | 'Em Pausa' | 'Offline';
    tempo_online: string;
    data_criacao: Date;
    data_atualizacao: Date;
}
export interface Chamada {
    id: number;
    operador_id: number;
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
    id: number;
    operador_id: number;
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
    id: number;
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
    id: number;
    operador_id: number;
    missao_id: number;
    progresso_atual: number;
    concluida: boolean;
    data_inicio: Date;
    data_conclusao?: Date;
}
export interface Conquista {
    id: number;
    titulo: string;
    descricao: string;
    icone: string;
    condicao_tipo: 'Chamadas' | 'Tempo' | 'Satisfacao' | 'Resolucoes' | 'Pontos' | 'Nivel';
    condicao_valor: number;
    pontos_recompensa: number;
    ativa: boolean;
}
export interface OperadorConquista {
    id: number;
    operador_id: number;
    conquista_id: number;
    data_desbloqueio: Date;
}
export interface Ranking {
    id: number;
    operador_id: number;
    posicao: number;
    pontos_semana: number;
    pontos_mes: number;
    chamadas_semana: number;
    chamadas_mes: number;
    data_atualizacao: Date;
}
export interface Sessao {
    id: number;
    operador_id: number;
    token: string;
    data_criacao: Date;
    data_expiracao: Date;
    ativa: boolean;
}
export interface AuthRequest extends Request {
    operador: Operador;
    token: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
}
export interface LoginRequest {
    email: string;
    senha: string;
}
export interface LoginResponse {
    token: string;
    operador: Omit<Operador, 'senha'>;
}
export interface DashboardData {
    operador: Omit<Operador, 'senha'>;
    metas: Meta[];
    missoes: (Missao & {
        progresso_atual: number;
        concluida: boolean;
    })[];
    conquistas: (Conquista & {
        data_desbloqueio?: Date;
        desbloqueada: boolean;
    })[];
    estatisticas: {
        chamadas_hoje: number;
        tempo_total: number;
        satisfacao_media: number;
        resolucoes: number;
    };
}
export interface IniciarChamadaRequest {
    numero_cliente?: string;
    tipo_chamada?: 'Entrada' | 'Saida' | 'Interna';
}
export interface FinalizarChamadaRequest {
    chamada_id: number;
    satisfacao_cliente?: number;
    resolvida: boolean;
    observacoes?: string;
}
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
export interface SocketData {
    operador_id: number;
    status?: string;
    chamada_id?: number;
    pontos_ganhos?: number;
    nova_conquista?: Conquista;
}
//# sourceMappingURL=index.d.ts.map