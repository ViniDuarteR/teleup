"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.pool = exports.mockConquistas = exports.mockMissoes = exports.mockMetas = exports.mockOperadores = void 0;
exports.mockOperadores = [
    {
        id: 1,
        nome: "Carlos Silva",
        email: "admin@teleup.com",
        senha: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos&backgroundColor=b6e3f4,c0aede,d1d4f9",
        nivel: 12,
        xp_atual: 1850,
        xp_proximo_nivel: 2000,
        pontos_totais: 15420,
        status: "Aguardando Chamada",
        tempo_online: "06:32:00",
        data_criacao: new Date("2024-01-01"),
        data_atualizacao: new Date()
    },
    {
        id: 2,
        nome: "Ana Santos",
        email: "ana@teleup.com",
        senha: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana&backgroundColor=b6e3f4,c0aede,d1d4f9",
        nivel: 8,
        xp_atual: 1200,
        xp_proximo_nivel: 1500,
        pontos_totais: 8750,
        status: "Em Chamada",
        tempo_online: "04:15:00",
        data_criacao: new Date("2024-01-15"),
        data_atualizacao: new Date()
    }
];
exports.mockMetas = [
    {
        id: 1,
        operador_id: 1,
        tipo_meta: "Chamadas Atendidas",
        valor_atual: 78,
        valor_meta: 100,
        periodo: "Diario",
        data_inicio: new Date(),
        data_fim: new Date(),
        ativa: true,
        pontos_recompensa: 50
    },
    {
        id: 2,
        operador_id: 1,
        tipo_meta: "Tempo de Conversa",
        valor_atual: 150,
        valor_meta: 240,
        periodo: "Diario",
        data_inicio: new Date(),
        data_fim: new Date(),
        ativa: true,
        pontos_recompensa: 75
    }
];
exports.mockMissoes = [
    {
        id: 1,
        titulo: "Maratona de Chamadas",
        descricao: "Complete 50 chamadas hoje e ganhe 200 pontos!",
        tipo: "Diaria",
        meta_valor: 50,
        pontos_recompensa: 200,
        ativa: true,
        data_criacao: new Date(),
        data_expiracao: null
    },
    {
        id: 2,
        titulo: "Rei da Resolução",
        descricao: "Resolva 25 chamadas sem transferir",
        tipo: "Semanal",
        meta_valor: 25,
        pontos_recompensa: 350,
        ativa: true,
        data_criacao: new Date(),
        data_expiracao: null
    }
];
exports.mockConquistas = [
    {
        id: 1,
        titulo: "Primeiras 100 Chamadas",
        descricao: "Completou suas primeiras 100 chamadas",
        icone: "phone",
        condicao_tipo: "Chamadas",
        condicao_valor: 100,
        pontos_recompensa: 500,
        ativa: true
    },
    {
        id: 2,
        titulo: "Operador Mais Rápido",
        descricao: "Tempo médio de atendimento abaixo de 3 minutos",
        icone: "zap",
        condicao_tipo: "Tempo",
        condicao_valor: 180,
        pontos_recompensa: 750,
        ativa: true
    }
];
exports.pool = {
    execute: async (query, params = []) => {
        console.log('Mock Query:', query);
        console.log('Mock Params:', params);
        if (query.includes('SELECT * FROM operadores WHERE email')) {
            const operador = exports.mockOperadores.find(op => op.email === params[0]);
            return [[operador || null]];
        }
        if (query.includes('SELECT * FROM operadores WHERE id')) {
            const operador = exports.mockOperadores.find(op => op.id === params[0]);
            return [[operador || null]];
        }
        if (query.includes('SELECT * FROM metas')) {
            return [exports.mockMetas.filter(meta => meta.operador_id === params[0])];
        }
        if (query.includes('SELECT m.*, om.progresso_atual, om.concluida FROM missoes')) {
            return [exports.mockMissoes.map(missao => ({
                    ...missao,
                    progresso_atual: 35,
                    concluida: false
                }))];
        }
        if (query.includes('SELECT c.*, oc.data_desbloqueio FROM conquistas')) {
            return [exports.mockConquistas.map(conquista => ({
                    ...conquista,
                    data_desbloqueio: new Date(),
                    desbloqueada: true
                }))];
        }
        if (query.includes('COUNT(*) as chamadas_hoje')) {
            return [[{ chamadas_hoje: 47, tempo_total_segundos: 13500, satisfacao_media: 4.2, resolucoes: 42 }]];
        }
        if (query.includes('INSERT INTO sessoes')) {
            return [{ insertId: 1 }];
        }
        if (query.includes('UPDATE operadores SET status')) {
            return [{ affectedRows: 1 }];
        }
        return [[]];
    }
};
const testConnection = async () => {
    console.log('✅ Conectado ao banco de dados MOCK');
    return true;
};
exports.testConnection = testConnection;
//# sourceMappingURL=database-mock.js.map