"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEstatisticas = exports.getHistorico = exports.finalizarChamada = exports.iniciarChamada = void 0;
const database_1 = require("../config/database");
const iniciarChamada = async (req, res) => {
    try {
        const { numero_cliente, tipo_chamada = 'Entrada' } = req.body;
        const operadorId = req.operador.id;
        if (req.operador.status !== 'Aguardando Chamada') {
            res.status(400).json({
                success: false,
                message: 'Operador deve estar aguardando chamada para iniciar uma nova'
            });
            return;
        }
        const [result] = await database_1.pool.execute(`
      INSERT INTO chamadas (operador_id, numero_cliente, tipo_chamada, status) 
      VALUES (?, ?, ?, 'Em Andamento')
    `, [operadorId, numero_cliente, tipo_chamada]);
        const chamadaId = result.insertId;
        await database_1.pool.execute('UPDATE operadores SET status = ? WHERE id = ?', ['Em Chamada', operadorId]);
        res.json({
            success: true,
            message: 'Chamada iniciada com sucesso',
            data: {
                chamada_id: chamadaId,
                operador_id: operadorId,
                status: 'Em Chamada'
            }
        });
    }
    catch (error) {
        console.error('Erro ao iniciar chamada:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.iniciarChamada = iniciarChamada;
const finalizarChamada = async (req, res) => {
    try {
        const { chamada_id, satisfacao_cliente, resolvida, observacoes } = req.body;
        const operadorId = req.operador.id;
        const [chamadas] = await database_1.pool.execute('SELECT * FROM chamadas WHERE id = ? AND operador_id = ? AND status = "Em Andamento"', [chamada_id, operadorId]);
        if (chamadas.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Chamada não encontrada ou já finalizada'
            });
            return;
        }
        const chamada = chamadas[0];
        const agora = new Date();
        const duracaoSegundos = Math.floor((agora.getTime() - new Date(chamada.inicio_chamada).getTime()) / 1000);
        let pontosGanhos = 10;
        if (resolvida)
            pontosGanhos += 20;
        if (satisfacao_cliente && satisfacao_cliente >= 4)
            pontosGanhos += 15;
        if (satisfacao_cliente === 5)
            pontosGanhos += 10;
        await database_1.pool.execute(`
      UPDATE chamadas 
      SET fim_chamada = ?, duracao_segundos = ?, status = 'Finalizada', 
          satisfacao_cliente = ?, resolvida = ?, observacoes = ?, pontos_ganhos = ?
      WHERE id = ?
    `, [agora, duracaoSegundos, satisfacao_cliente, resolvida, observacoes, pontosGanhos, chamada_id]);
        await database_1.pool.execute('UPDATE operadores SET pontos_totais = pontos_totais + ? WHERE id = ?', [pontosGanhos, operadorId]);
        await database_1.pool.execute('UPDATE operadores SET status = ? WHERE id = ?', ['Aguardando Chamada', operadorId]);
        await verificarMissoes(operadorId, 'chamada', 1);
        res.json({
            success: true,
            message: 'Chamada finalizada com sucesso',
            data: {
                duracao_segundos: duracaoSegundos,
                pontos_ganhos: pontosGanhos,
                status: 'Aguardando Chamada'
            }
        });
    }
    catch (error) {
        console.error('Erro ao finalizar chamada:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.finalizarChamada = finalizarChamada;
const getHistorico = async (req, res) => {
    try {
        const { data_inicio, data_fim, limite = 50, offset = 0 } = req.query;
        const operadorId = req.operador.id;
        let whereClause = 'WHERE operador_id = ?';
        let params = [operadorId];
        if (data_inicio) {
            whereClause += ' AND DATE(inicio_chamada) >= ?';
            params.push(data_inicio);
        }
        if (data_fim) {
            whereClause += ' AND DATE(inicio_chamada) <= ?';
            params.push(data_fim);
        }
        const [chamadas] = await database_1.pool.execute(`
      SELECT 
        id, numero_cliente, inicio_chamada, fim_chamada, duracao_segundos,
        tipo_chamada, status, satisfacao_cliente, resolvida, observacoes, pontos_ganhos
      FROM chamadas 
      ${whereClause}
      ORDER BY inicio_chamada DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limite), parseInt(offset)]);
        const [total] = await database_1.pool.execute(`
      SELECT COUNT(*) as total FROM chamadas ${whereClause}
    `, params);
        res.json({
            success: true,
            data: {
                chamadas: chamadas,
                paginacao: {
                    total: total[0].total,
                    limite: parseInt(limite),
                    offset: parseInt(offset)
                }
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.getHistorico = getHistorico;
const getEstatisticas = async (req, res) => {
    try {
        const { periodo = 'hoje' } = req.query;
        const operadorId = req.operador.id;
        let whereClause = 'WHERE operador_id = ?';
        let params = [operadorId];
        switch (periodo) {
            case 'hoje':
                whereClause += ' AND DATE(inicio_chamada) = CURDATE()';
                break;
            case 'semana':
                whereClause += ' AND YEARWEEK(inicio_chamada) = YEARWEEK(NOW())';
                break;
            case 'mes':
                whereClause += ' AND YEAR(inicio_chamada) = YEAR(NOW()) AND MONTH(inicio_chamada) = MONTH(NOW())';
                break;
        }
        const [stats] = await database_1.pool.execute(`
      SELECT 
        COUNT(*) as total_chamadas,
        COALESCE(SUM(duracao_segundos), 0) as tempo_total_segundos,
        COALESCE(AVG(duracao_segundos), 0) as tempo_medio_segundos,
        COALESCE(AVG(satisfacao_cliente), 0) as satisfacao_media,
        COALESCE(SUM(CASE WHEN resolvida = TRUE THEN 1 ELSE 0 END), 0) as total_resolucoes,
        COALESCE(SUM(pontos_ganhos), 0) as pontos_ganhos
      FROM chamadas 
      ${whereClause}
    `, params);
        const estatisticas = stats[0];
        res.json({
            success: true,
            data: {
                periodo: periodo,
                total_chamadas: estatisticas.total_chamadas,
                tempo_total_minutos: Math.floor(estatisticas.tempo_total_segundos / 60),
                tempo_medio_minutos: Math.floor(estatisticas.tempo_medio_segundos / 60),
                satisfacao_media: Math.round(estatisticas.satisfacao_media * 10) / 10,
                taxa_resolucao: estatisticas.total_chamadas > 0
                    ? Math.round((estatisticas.total_resolucoes / estatisticas.total_chamadas) * 100)
                    : 0,
                pontos_ganhos: estatisticas.pontos_ganhos
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.getEstatisticas = getEstatisticas;
const verificarMissoes = async (operadorId, tipo, valor) => {
    try {
        const [missoes] = await database_1.pool.execute(`
      SELECT m.*, om.progresso_atual, om.concluida
      FROM missoes m
      LEFT JOIN operador_missoes om ON m.id = om.missao_id AND om.operador_id = ?
      WHERE m.ativa = TRUE AND (om.concluida = FALSE OR om.concluida IS NULL)
    `, [operadorId]);
        for (const missao of missoes) {
            let novoProgresso = missao.progresso_atual || 0;
            if (tipo === 'chamada') {
                novoProgresso += valor;
            }
            if (novoProgresso >= missao.meta_valor) {
                if (missao.concluida) {
                    await database_1.pool.execute('UPDATE operador_missoes SET progresso_atual = ? WHERE operador_id = ? AND missao_id = ?', [novoProgresso, operadorId, missao.id]);
                }
                else {
                    await database_1.pool.execute(`
            INSERT INTO operador_missoes (operador_id, missao_id, progresso_atual, concluida, data_conclusao)
            VALUES (?, ?, ?, TRUE, NOW())
            ON DUPLICATE KEY UPDATE progresso_atual = ?, concluida = TRUE, data_conclusao = NOW()
          `, [operadorId, missao.id, novoProgresso, novoProgresso]);
                    await database_1.pool.execute('UPDATE operadores SET pontos_totais = pontos_totais + ? WHERE id = ?', [missao.pontos_recompensa, operadorId]);
                }
            }
            else {
                await database_1.pool.execute(`
          INSERT INTO operador_missoes (operador_id, missao_id, progresso_atual, concluida)
          VALUES (?, ?, ?, FALSE)
          ON DUPLICATE KEY UPDATE progresso_atual = ?
        `, [operadorId, missao.id, novoProgresso, novoProgresso]);
            }
        }
    }
    catch (error) {
        console.error('Erro ao verificar missões:', error);
    }
};
//# sourceMappingURL=chamadaController.js.map