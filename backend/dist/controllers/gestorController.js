"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOperadores = exports.atribuirMissao = exports.criarMissao = exports.getDesempenhoDetalhado = exports.getRankingOperadores = exports.getMetricasEquipe = void 0;
const database_1 = require("../config/database");
const getMetricasEquipe = async (req, res) => {
    try {
        const [metricas] = await database_1.pool.execute(`
      SELECT 
        COUNT(CASE WHEN status = 'Em Chamada' THEN 1 END) as chamadas_andamento,
        COUNT(CASE WHEN status = 'Aguardando Chamada' THEN 1 END) as operadores_disponiveis,
        COUNT(CASE WHEN status = 'Em Pausa' THEN 1 END) as operadores_pausa,
        COUNT(CASE WHEN status = 'Offline' THEN 1 END) as operadores_offline,
        COUNT(*) as total_operadores
      FROM operadores
    `);
        const [eficiencia] = await database_1.pool.execute(`
      SELECT 
        COUNT(*) as total_chamadas_hoje,
        COUNT(CASE WHEN status = 'Finalizada' THEN 1 END) as chamadas_finalizadas,
        COALESCE(AVG(duracao_segundos), 0) as tempo_medio_atendimento,
        COALESCE(AVG(satisfacao_cliente), 0) as satisfacao_media
      FROM chamadas 
      WHERE DATE(inicio_chamada) = CURDATE()
    `);
        const dadosMetricas = metricas[0];
        const dadosEficiencia = eficiencia[0];
        const totalOperadores = dadosMetricas.total_operadores;
        const operadoresDisponiveis = dadosMetricas.operadores_disponiveis;
        const operadoresEmChamada = dadosMetricas.chamadas_andamento;
        const nivelOciosidade = totalOperadores > 0
            ? Math.round((operadoresDisponiveis / totalOperadores) * 100)
            : 0;
        const eficienciaDiscador = dadosEficiencia.total_chamadas_hoje > 0
            ? Math.round((dadosEficiencia.chamadas_finalizadas / dadosEficiencia.total_chamadas_hoje) * 100)
            : 0;
        res.json({
            success: true,
            data: {
                chamadas_andamento: dadosMetricas.chamadas_andamento,
                operadores_disponiveis: operadoresDisponiveis,
                operadores_pausa: dadosMetricas.operadores_pausa,
                operadores_offline: dadosMetricas.operadores_offline,
                total_operadores: totalOperadores,
                eficiencia_discador: eficienciaDiscador,
                nivel_ociosidade: nivelOciosidade,
                tempo_medio_atendimento: Math.floor(dadosEficiencia.tempo_medio_atendimento / 60),
                satisfacao_media: Math.round(dadosEficiencia.satisfacao_media * 10) / 10
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar métricas da equipe:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.getMetricasEquipe = getMetricasEquipe;
const getRankingOperadores = async (req, res) => {
    try {
        const { periodo = 'semana', limite = 10 } = req.query;
        let campoPontos = 'pontos_semana';
        if (periodo === 'mes') {
            campoPontos = 'pontos_mes';
        }
        const [ranking] = await database_1.pool.execute(`
      SELECT 
        r.posicao,
        o.id, o.nome, o.avatar, o.nivel, o.status,
        r.${campoPontos} as pontos,
        r.chamadas_semana, r.chamadas_mes,
        CASE 
          WHEN r.posicao = 1 THEN '🥇'
          WHEN r.posicao = 2 THEN '🥈'
          WHEN r.posicao = 3 THEN '🥉'
          ELSE CONCAT('#', r.posicao)
        END as emoji_posicao
      FROM ranking r
      INNER JOIN operadores o ON r.operador_id = o.id
      ORDER BY r.${campoPontos} DESC
      LIMIT ?
    `, [parseInt(limite)]);
        res.json({
            success: true,
            data: {
                ranking: ranking,
                periodo: periodo
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar ranking de operadores:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.getRankingOperadores = getRankingOperadores;
const getDesempenhoDetalhado = async (req, res) => {
    try {
        const { periodo = 'hoje' } = req.query;
        let whereClause = '';
        switch (periodo) {
            case 'hoje':
                whereClause = 'AND DATE(c.inicio_chamada) = CURDATE()';
                break;
            case 'semana':
                whereClause = 'AND YEARWEEK(c.inicio_chamada) = YEARWEEK(NOW())';
                break;
            case 'mes':
                whereClause = 'AND YEAR(c.inicio_chamada) = YEAR(NOW()) AND MONTH(c.inicio_chamada) = MONTH(NOW())';
                break;
        }
        const [operadores] = await database_1.pool.execute(`
      SELECT 
        o.id, o.nome, o.avatar, o.nivel, o.status, o.pontos_totais,
        COALESCE(COUNT(c.id), 0) as total_chamadas,
        COALESCE(SUM(c.duracao_segundos), 0) as tempo_total_segundos,
        COALESCE(AVG(c.duracao_segundos), 0) as tempo_medio_segundos,
        COALESCE(AVG(c.satisfacao_cliente), 0) as satisfacao_media,
        COALESCE(SUM(CASE WHEN c.resolvida = TRUE THEN 1 ELSE 0 END), 0) as total_resolucoes,
        COALESCE(SUM(c.pontos_ganhos), 0) as pontos_periodo,
        r.posicao
      FROM operadores o
      LEFT JOIN chamadas c ON o.id = c.operador_id ${whereClause}
      LEFT JOIN ranking r ON o.id = r.operador_id
      GROUP BY o.id, o.nome, o.avatar, o.nivel, o.status, o.pontos_totais, r.posicao
      ORDER BY pontos_periodo DESC, total_chamadas DESC
    `);
        const operadoresComStats = operadores.map(op => ({
            ...op,
            tempo_total_minutos: Math.floor(op.tempo_total_segundos / 60),
            tempo_medio_minutos: Math.floor(op.tempo_medio_segundos / 60),
            taxa_resolucao: op.total_chamadas > 0
                ? Math.round((op.total_resolucoes / op.total_chamadas) * 100)
                : 0,
            satisfacao_media: Math.round(op.satisfacao_media * 10) / 10
        }));
        res.json({
            success: true,
            data: {
                operadores: operadoresComStats,
                periodo: periodo
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar desempenho detalhado:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.getDesempenhoDetalhado = getDesempenhoDetalhado;
const criarMissao = async (req, res) => {
    try {
        const { titulo, descricao, tipo, meta_valor, pontos_recompensa, data_expiracao } = req.body;
        if (!titulo || !descricao || !tipo || !meta_valor || !pontos_recompensa) {
            res.status(400).json({
                success: false,
                message: 'Todos os campos obrigatórios devem ser preenchidos'
            });
            return;
        }
        const [result] = await database_1.pool.execute(`
      INSERT INTO missoes (titulo, descricao, tipo, meta_valor, pontos_recompensa, data_expiracao)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [titulo, descricao, tipo, meta_valor, pontos_recompensa, data_expiracao]);
        res.json({
            success: true,
            message: 'Missão criada com sucesso',
            data: {
                missao_id: result.insertId
            }
        });
    }
    catch (error) {
        console.error('Erro ao criar missão:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.criarMissao = criarMissao;
const atribuirMissao = async (req, res) => {
    try {
        const { operador_id, missao_id } = req.body;
        if (!operador_id || !missao_id) {
            res.status(400).json({
                success: false,
                message: 'ID do operador e ID da missão são obrigatórios'
            });
            return;
        }
        const [operadores] = await database_1.pool.execute('SELECT id FROM operadores WHERE id = ?', [operador_id]);
        if (operadores.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Operador não encontrado'
            });
            return;
        }
        const [missoes] = await database_1.pool.execute('SELECT id FROM missoes WHERE id = ? AND ativa = TRUE', [missao_id]);
        if (missoes.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Missão não encontrada ou inativa'
            });
            return;
        }
        await database_1.pool.execute(`
      INSERT INTO operador_missoes (operador_id, missao_id, progresso_atual, concluida)
      VALUES (?, ?, 0, FALSE)
      ON DUPLICATE KEY UPDATE progresso_atual = 0, concluida = FALSE
    `, [operador_id, missao_id]);
        res.json({
            success: true,
            message: 'Missão atribuída com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao atribuir missão:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.atribuirMissao = atribuirMissao;
const getOperadores = async (req, res) => {
    try {
        const [operadores] = await database_1.pool.execute(`
      SELECT id, nome, email, nivel, status, pontos_totais
      FROM operadores
      ORDER BY nome
    `);
        res.json({
            success: true,
            data: operadores
        });
    }
    catch (error) {
        console.error('Erro ao buscar operadores:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.getOperadores = getOperadores;
//# sourceMappingURL=gestorController.js.map