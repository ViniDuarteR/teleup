"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEstatisticasGamificacao = exports.getRankingGeral = exports.verificarConquistas = exports.getConquistas = exports.getMissoes = void 0;
const database_1 = require("../config/database");
const getMissoes = async (req, res) => {
    try {
        const operadorId = req.operador.id;
        const [missoes] = await database_1.pool.execute(`
      SELECT 
        m.id, m.titulo, m.descricao, m.tipo, m.objetivo as meta_valor, m.recompensa_pontos as pontos_recompensa,
        COALESCE(pm.progresso_atual, 0) as progresso_atual,
        COALESCE(pm.concluida, FALSE) as concluida,
        pm.data_inicio, pm.data_conclusao
      FROM missoes m
      LEFT JOIN progresso_missoes pm ON m.id = pm.missao_id AND pm.operador_id = ?
      WHERE m.ativa = TRUE
      ORDER BY m.tipo, m.data_criacao
    `, [operadorId]);
        res.json({
            success: true,
            data: missoes
        });
    }
    catch (error) {
        console.error('Erro ao buscar missões:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.getMissoes = getMissoes;
const getConquistas = async (req, res) => {
    try {
        const operadorId = req.operador.id;
        const [conquistas] = await database_1.pool.execute(`
      SELECT 
        c.id, c.nome as titulo, c.descricao, c.icone, c.pontos_recompensa,
        COALESCE(oc.data_desbloqueio, NULL) as data_desbloqueio,
        CASE WHEN oc.operador_id IS NOT NULL THEN TRUE ELSE FALSE END as desbloqueada
      FROM conquistas c
      LEFT JOIN operador_conquistas oc ON c.id = oc.conquista_id AND oc.operador_id = ?
      WHERE c.ativa = TRUE
      ORDER BY oc.data_desbloqueio DESC, c.nome
    `, [operadorId]);
        res.json({
            success: true,
            data: conquistas
        });
    }
    catch (error) {
        console.error('Erro ao buscar conquistas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.getConquistas = getConquistas;
const verificarConquistas = async (req, res) => {
    try {
        const operadorId = req.operador.id;
        const novasConquistas = [];
        const [conquistas] = await database_1.pool.execute(`
      SELECT c.* FROM conquistas c
      LEFT JOIN operador_conquistas oc ON c.id = oc.conquista_id AND oc.operador_id = ?
      WHERE c.ativa = TRUE AND oc.operador_id IS NULL
    `, [operadorId]);
        const [stats] = await database_1.pool.execute(`
      SELECT 
        COUNT(*) as total_chamadas,
        COALESCE(AVG(duracao_segundos), 0) as tempo_medio_segundos,
        COALESCE(AVG(satisfacao_cliente), 0) as satisfacao_media,
        COALESCE(SUM(CASE WHEN resolvida = TRUE THEN 1 ELSE 0 END), 0) as total_resolucoes
      FROM chamadas 
      WHERE operador_id = ?
    `, [operadorId]);
        const [operador] = await database_1.pool.execute('SELECT pontos_totais, nivel FROM operadores WHERE id = ?', [operadorId]);
        const estatisticas = stats[0];
        const dadosOperador = operador[0];
        for (const conquista of conquistas) {
            let desbloquear = false;
            switch (conquista.condicao_tipo) {
                case 'Chamadas':
                    if (estatisticas.total_chamadas >= conquista.condicao_valor) {
                        desbloquear = true;
                    }
                    break;
                case 'Tempo':
                    if (estatisticas.tempo_medio_segundos <= conquista.condicao_valor) {
                        desbloquear = true;
                    }
                    break;
                case 'Satisfacao':
                    if (estatisticas.satisfacao_media >= conquista.condicao_valor) {
                        desbloquear = true;
                    }
                    break;
                case 'Resolucoes':
                    if (estatisticas.total_resolucoes >= conquista.condicao_valor) {
                        desbloquear = true;
                    }
                    break;
                case 'Pontos':
                    if (dadosOperador.pontos_totais >= conquista.condicao_valor) {
                        desbloquear = true;
                    }
                    break;
                case 'Nivel':
                    if (dadosOperador.nivel >= conquista.condicao_valor) {
                        desbloquear = true;
                    }
                    break;
            }
            if (desbloquear) {
                await database_1.pool.execute('INSERT INTO operador_conquistas (operador_id, conquista_id) VALUES (?, ?)', [operadorId, conquista.id]);
                if (conquista.pontos_recompensa > 0) {
                    await database_1.pool.execute('UPDATE operadores SET pontos_totais = pontos_totais + ? WHERE id = ?', [conquista.pontos_recompensa, operadorId]);
                }
                novasConquistas.push(conquista);
            }
        }
        res.json({
            success: true,
            data: {
                novas_conquistas: novasConquistas,
                total_novas: novasConquistas.length
            }
        });
    }
    catch (error) {
        console.error('Erro ao verificar conquistas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.verificarConquistas = verificarConquistas;
const getRankingGeral = async (req, res) => {
    try {
        const { tipo = 'pontos', periodo = 'semana' } = req.query;
        let campoOrdenacao = 'pontos_semana';
        if (periodo === 'mes') {
            campoOrdenacao = 'pontos_mes';
        }
        const [ranking] = await database_1.pool.execute(`
      SELECT 
        r.posicao,
        o.id, o.nome, o.avatar, o.nivel,
        r.${campoOrdenacao} as pontos,
        r.chamadas_semana, r.chamadas_mes,
        CASE 
          WHEN r.posicao = 1 THEN '🥇'
          WHEN r.posicao = 2 THEN '🥈'
          WHEN r.posicao = 3 THEN '🥉'
          ELSE CONCAT('#', r.posicao)
        END as emoji_posicao
      FROM ranking r
      INNER JOIN operadores o ON r.operador_id = o.id
      ORDER BY r.${campoOrdenacao} DESC
      LIMIT 50
    `);
        res.json({
            success: true,
            data: {
                ranking: ranking,
                periodo: periodo,
                tipo: tipo
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar ranking:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.getRankingGeral = getRankingGeral;
const getEstatisticasGamificacao = async (req, res) => {
    try {
        const operadorId = req.operador.id;
        const [operador] = await database_1.pool.execute('SELECT nivel, xp_atual, xp_proximo_nivel, pontos_totais FROM operadores WHERE id = ?', [operadorId]);
        const [missoesConcluidas] = await database_1.pool.execute(`
      SELECT COUNT(*) as total FROM progresso_missoes 
      WHERE operador_id = ? AND concluida = TRUE
    `, [operadorId]);
        const [conquistasDesbloqueadas] = await database_1.pool.execute(`
      SELECT COUNT(*) as total FROM operador_conquistas 
      WHERE operador_id = ?
    `, [operadorId]);
        const [posicaoRanking] = await database_1.pool.execute(`
      SELECT posicao FROM ranking 
      WHERE operador_id = ?
    `, [operadorId]);
        const dados = operador[0];
        const progressoNivel = (dados.xp_atual / dados.xp_proximo_nivel) * 100;
        res.json({
            success: true,
            data: {
                nivel: dados.nivel,
                xp_atual: dados.xp_atual,
                xp_proximo_nivel: dados.xp_proximo_nivel,
                progresso_nivel: Math.round(progressoNivel),
                pontos_totais: dados.pontos_totais,
                missoes_concluidas: missoesConcluidas[0].total,
                conquistas_desbloqueadas: conquistasDesbloqueadas[0].total,
                posicao_ranking: posicaoRanking[0]?.posicao || null
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar estatísticas de gamificação:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.getEstatisticasGamificacao = getEstatisticasGamificacao;
//# sourceMappingURL=gamificacaoController.js.map