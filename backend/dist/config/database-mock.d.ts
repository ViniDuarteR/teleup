export declare const mockOperadores: ({
    id: number;
    nome: string;
    email: string;
    senha: string;
    avatar: string;
    nivel: number;
    xp_atual: number;
    xp_proximo_nivel: number;
    pontos_totais: number;
    status: "Aguardando Chamada";
    tempo_online: string;
    data_criacao: Date;
    data_atualizacao: Date;
} | {
    id: number;
    nome: string;
    email: string;
    senha: string;
    avatar: string;
    nivel: number;
    xp_atual: number;
    xp_proximo_nivel: number;
    pontos_totais: number;
    status: "Em Chamada";
    tempo_online: string;
    data_criacao: Date;
    data_atualizacao: Date;
})[];
export declare const mockMetas: ({
    id: number;
    operador_id: number;
    tipo_meta: "Chamadas Atendidas";
    valor_atual: number;
    valor_meta: number;
    periodo: "Diario";
    data_inicio: Date;
    data_fim: Date;
    ativa: boolean;
    pontos_recompensa: number;
} | {
    id: number;
    operador_id: number;
    tipo_meta: "Tempo de Conversa";
    valor_atual: number;
    valor_meta: number;
    periodo: "Diario";
    data_inicio: Date;
    data_fim: Date;
    ativa: boolean;
    pontos_recompensa: number;
})[];
export declare const mockMissoes: ({
    id: number;
    titulo: string;
    descricao: string;
    tipo: "Diaria";
    meta_valor: number;
    pontos_recompensa: number;
    ativa: boolean;
    data_criacao: Date;
    data_expiracao: any;
} | {
    id: number;
    titulo: string;
    descricao: string;
    tipo: "Semanal";
    meta_valor: number;
    pontos_recompensa: number;
    ativa: boolean;
    data_criacao: Date;
    data_expiracao: any;
})[];
export declare const mockConquistas: ({
    id: number;
    titulo: string;
    descricao: string;
    icone: string;
    condicao_tipo: "Chamadas";
    condicao_valor: number;
    pontos_recompensa: number;
    ativa: boolean;
} | {
    id: number;
    titulo: string;
    descricao: string;
    icone: string;
    condicao_tipo: "Tempo";
    condicao_valor: number;
    pontos_recompensa: number;
    ativa: boolean;
})[];
export declare const pool: {
    execute: (query: string, params?: any[]) => Promise<({
        id: number;
        operador_id: number;
        tipo_meta: "Chamadas Atendidas";
        valor_atual: number;
        valor_meta: number;
        periodo: "Diario";
        data_inicio: Date;
        data_fim: Date;
        ativa: boolean;
        pontos_recompensa: number;
    } | {
        id: number;
        operador_id: number;
        tipo_meta: "Tempo de Conversa";
        valor_atual: number;
        valor_meta: number;
        periodo: "Diario";
        data_inicio: Date;
        data_fim: Date;
        ativa: boolean;
        pontos_recompensa: number;
    })[][] | ({
        progresso_atual: number;
        concluida: boolean;
        id: number;
        titulo: string;
        descricao: string;
        tipo: "Diaria";
        meta_valor: number;
        pontos_recompensa: number;
        ativa: boolean;
        data_criacao: Date;
        data_expiracao: any;
    } | {
        progresso_atual: number;
        concluida: boolean;
        id: number;
        titulo: string;
        descricao: string;
        tipo: "Semanal";
        meta_valor: number;
        pontos_recompensa: number;
        ativa: boolean;
        data_criacao: Date;
        data_expiracao: any;
    })[][] | ({
        data_desbloqueio: Date;
        desbloqueada: boolean;
        id: number;
        titulo: string;
        descricao: string;
        icone: string;
        condicao_tipo: "Chamadas";
        condicao_valor: number;
        pontos_recompensa: number;
        ativa: boolean;
    } | {
        data_desbloqueio: Date;
        desbloqueada: boolean;
        id: number;
        titulo: string;
        descricao: string;
        icone: string;
        condicao_tipo: "Tempo";
        condicao_valor: number;
        pontos_recompensa: number;
        ativa: boolean;
    })[][] | ({
        id: number;
        nome: string;
        email: string;
        senha: string;
        avatar: string;
        nivel: number;
        xp_atual: number;
        xp_proximo_nivel: number;
        pontos_totais: number;
        status: "Aguardando Chamada";
        tempo_online: string;
        data_criacao: Date;
        data_atualizacao: Date;
    } | {
        id: number;
        nome: string;
        email: string;
        senha: string;
        avatar: string;
        nivel: number;
        xp_atual: number;
        xp_proximo_nivel: number;
        pontos_totais: number;
        status: "Em Chamada";
        tempo_online: string;
        data_criacao: Date;
        data_atualizacao: Date;
    })[][] | {
        chamadas_hoje: number;
        tempo_total_segundos: number;
        satisfacao_media: number;
        resolucoes: number;
    }[][] | {
        insertId: number;
    }[] | {
        affectedRows: number;
    }[]>;
};
export declare const testConnection: () => Promise<boolean>;
//# sourceMappingURL=database-mock.d.ts.map