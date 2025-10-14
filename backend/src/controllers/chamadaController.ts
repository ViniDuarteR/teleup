import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest, IniciarChamadaRequest, FinalizarChamadaRequest, ApiResponse } from '../types';

// Iniciar uma nova chamada
export const iniciarChamada = async (req: AuthRequest, res: Response<ApiResponse<{ chamada_id: number; operador_id: number; status: string }>>): Promise<void> => {
  try {
    const { numero_cliente, tipo_chamada = 'Entrada' } = req.body as IniciarChamadaRequest;
    const operadorId = req.operador.id;

    // Verificar se operador está disponível
    if (req.operador.status !== 'Aguardando Chamada') {
      res.status(400).json({
        success: false,
        message: 'Operador deve estar aguardando chamada para iniciar uma nova'
      });
      return;
    }

    // Criar nova chamada
    const [result] = await pool.execute(`
      INSERT INTO chamadas (operador_id, numero_cliente, tipo_chamada, status) 
      VALUES (?, ?, ?, 'Em Andamento')
    `, [operadorId, numero_cliente, tipo_chamada]);

    const chamadaId = (result as any).insertId;

    // Atualizar status do operador
    await pool.execute(
      'UPDATE operadores SET status = $1 WHERE id = $2',
      ['Em Chamada', operadorId]
    );

    res.json({
      success: true,
      message: 'Chamada iniciada com sucesso',
      data: {
        chamada_id: chamadaId,
        operador_id: operadorId,
        status: 'Em Chamada'
      }
    });

  } catch (error) {
    console.error('Erro ao iniciar chamada:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Finalizar uma chamada
export const finalizarChamada = async (req: AuthRequest, res: Response<ApiResponse<{ duracao_segundos: number; pontos_ganhos: number; status: string }>>): Promise<void> => {
  try {
    const { chamada_id, satisfacao_cliente, resolvida, observacoes } = req.body as FinalizarChamadaRequest;
    const operadorId = req.operador.id;

    // Buscar chamada
    const [chamadas] = await pool.execute(
      'SELECT * FROM chamadas WHERE id = ? AND operador_id = ? AND status = "Em Andamento"',
      [chamada_id, operadorId]
    );

    if ((chamadas as any[]).length === 0) {
      res.status(404).json({
        success: false,
        message: 'Chamada não encontrada ou já finalizada'
      });
      return;
    }

    const chamada = (chamadas as any[])[0];
    const agora = new Date();
    const duracaoSegundos = Math.floor((agora.getTime() - new Date(chamada.inicio_chamada).getTime()) / 1000);

    // Calcular pontos baseado na duração e satisfação
    let pontosGanhos = 10; // Base
    if (resolvida) pontosGanhos += 20;
    if (satisfacao_cliente && satisfacao_cliente >= 4) pontosGanhos += 15;
    if (satisfacao_cliente === 5) pontosGanhos += 10;

    // Finalizar chamada
    await pool.execute(`
      UPDATE chamadas 
      SET fim_chamada = ?, duracao_segundos = ?, status = 'Finalizada', 
          satisfacao_cliente = ?, resolvida = ?, observacoes = ?, pontos_ganhos = ?
      WHERE id = ?
    `, [agora, duracaoSegundos, satisfacao_cliente, resolvida, observacoes, pontosGanhos, chamada_id]);

    // Atualizar pontos do operador
    await pool.execute(
      'UPDATE operadores SET pontos_totais = pontos_totais + $1 WHERE id = $2',
      [pontosGanhos, operadorId]
    );

    // Atualizar status do operador
    await pool.execute(
      'UPDATE operadores SET status = $1 WHERE id = $2',
      ['Aguardando Chamada', operadorId]
    );

    // Verificar e atualizar missões
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

  } catch (error) {
    console.error('Erro ao finalizar chamada:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter histórico de chamadas
export const getHistorico = async (req: AuthRequest, res: Response<ApiResponse<{ chamadas: any[]; paginacao: { total: number; limite: number; offset: number } }>>): Promise<void> => {
  try {
    const { data_inicio, data_fim, limite = 50, offset = 0 } = req.query;
    const operadorId = req.operador.id;

    let whereClause = 'WHERE operador_id = ?';
    let params: any[] = [operadorId];

    if (data_inicio) {
      whereClause += ' AND DATE(inicio_chamada) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND DATE(inicio_chamada) <= ?';
      params.push(data_fim);
    }

    const [chamadas] = await pool.execute(`
      SELECT 
        id, numero_cliente, inicio_chamada, fim_chamada, duracao_segundos,
        tipo_chamada, status, satisfacao_cliente, resolvida, observacoes, pontos_ganhos
      FROM chamadas 
      ${whereClause}
      ORDER BY inicio_chamada DESC
      LIMIT $1 OFFSET $2
    `, [...params, parseInt(limite as string), parseInt(offset as string)]);

    // Buscar total de registros para paginação
    const [total] = await pool.execute(`
      SELECT COUNT(*) as total FROM chamadas ${whereClause}
    `, params);

    res.json({
      success: true,
      data: {
        chamadas: chamadas as any[],
        paginacao: {
          total: (total as any[])[0].total,
          limite: parseInt(limite as string),
          offset: parseInt(offset as string)
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter estatísticas de chamadas
export const getEstatisticas = async (req: AuthRequest, res: Response<ApiResponse<{
  periodo: string;
  total_chamadas: number;
  tempo_total_minutos: number;
  tempo_medio_minutos: number;
  satisfacao_media: number;
  taxa_resolucao: number;
  pontos_ganhos: number;
}>>): Promise<void> => {
  try {
    const { periodo = 'hoje' } = req.query;
    const operadorId = req.operador.id;

    let whereClause = 'WHERE operador_id = ?';
    let params: any[] = [operadorId];

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

    const [stats] = await pool.execute(`
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

    const estatisticas = (stats as any[])[0];

    res.json({
      success: true,
      data: {
        periodo: periodo as string,
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

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Função auxiliar para verificar missões
const verificarMissoes = async (operadorId: number, tipo: string, valor: number): Promise<void> => {
  try {
    // Buscar missões ativas do operador
    const [missoes] = await pool.execute(`
      SELECT m.*, pm.progresso_atual, pm.concluida
      FROM missoes m
      LEFT JOIN progresso_missoes pm ON m.id = pm.missao_id AND pm.operador_id = $1
      WHERE m.ativa = TRUE AND (pm.concluida = FALSE OR pm.concluida IS NULL)
    `, [operadorId]);

    for (const missao of (missoes as any[])) {
      let novoProgresso = missao.progresso_atual || 0;
      
      // Atualizar progresso baseado no tipo de ação
      if (tipo === 'chamada') {
        novoProgresso += valor;
      }

      if (novoProgresso >= missao.meta_valor) {
        // Missão concluída
        if (missao.concluida) {
          // Atualizar progresso
          await pool.execute(
            'UPDATE progresso_missoes SET progresso_atual = $1 WHERE operador_id = $2 AND missao_id = $3',
            [novoProgresso, operadorId, missao.id]
          );
        } else {
          // Criar ou atualizar registro
          await pool.execute(`
            INSERT INTO progresso_missoes (operador_id, missao_id, progresso_atual, concluida, data_conclusao)
            VALUES ($1, $2, $3, TRUE, NOW())
            ON DUPLICATE KEY UPDATE progresso_atual = $4, concluida = TRUE, data_conclusao = NOW()
          `, [operadorId, missao.id, novoProgresso, novoProgresso]);

          // Adicionar pontos da missão
          await pool.execute(
            'UPDATE operadores SET pontos_totais = pontos_totais + $1 WHERE id = $2',
            [missao.pontos_recompensa, operadorId]
          );
        }
      } else {
        // Atualizar progresso
        await pool.execute(`
          INSERT INTO progresso_missoes (operador_id, missao_id, progresso_atual, concluida)
          VALUES ($1, $2, $3, FALSE)
          ON DUPLICATE KEY UPDATE progresso_atual = $4
        `, [operadorId, missao.id, novoProgresso, novoProgresso]);
      }
    }
  } catch (error) {
    console.error('Erro ao verificar missões:', error);
  }
};
