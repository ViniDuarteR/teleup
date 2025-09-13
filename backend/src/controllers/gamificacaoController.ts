import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest, ApiResponse, EstatisticasGamificacao } from '../types';

// Obter missões do operador
export const getMissoes = async (req: AuthRequest, res: Response<ApiResponse<any[]>>): Promise<void> => {
  try {
    const operadorId = req.operador.id;

    const [missoes] = await pool.execute(`
      SELECT 
        m.id, m.titulo, m.descricao, m.tipo, m.meta_valor, m.pontos_recompensa,
        COALESCE(om.progresso_atual, 0) as progresso_atual,
        COALESCE(om.concluida, FALSE) as concluida,
        om.data_inicio, om.data_conclusao
      FROM missoes m
      LEFT JOIN operador_missoes om ON m.id = om.missao_id AND om.operador_id = ?
      WHERE m.ativa = TRUE
      ORDER BY m.tipo, m.data_criacao
    `, [operadorId]);

    res.json({
      success: true,
      data: missoes as any[]
    });

  } catch (error) {
    console.error('Erro ao buscar missões:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter conquistas do operador
export const getConquistas = async (req: AuthRequest, res: Response<ApiResponse<any[]>>): Promise<void> => {
  try {
    const operadorId = req.operador.id;

    const [conquistas] = await pool.execute(`
      SELECT 
        c.id, c.titulo, c.descricao, c.icone, c.pontos_recompensa,
        COALESCE(oc.data_desbloqueio, NULL) as data_desbloqueio,
        CASE WHEN oc.operador_id IS NOT NULL THEN TRUE ELSE FALSE END as desbloqueada
      FROM conquistas c
      LEFT JOIN operador_conquistas oc ON c.id = oc.conquista_id AND oc.operador_id = ?
      WHERE c.ativa = TRUE
      ORDER BY oc.data_desbloqueio DESC, c.titulo
    `, [operadorId]);

    res.json({
      success: true,
      data: conquistas as any[]
    });

  } catch (error) {
    console.error('Erro ao buscar conquistas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Verificar e desbloquear conquistas
export const verificarConquistas = async (req: AuthRequest, res: Response<ApiResponse<{ novas_conquistas: any[]; total_novas: number }>>): Promise<void> => {
  try {
    const operadorId = req.operador.id;
    const novasConquistas: any[] = [];

    // Buscar conquistas não desbloqueadas
    const [conquistas] = await pool.execute(`
      SELECT c.* FROM conquistas c
      LEFT JOIN operador_conquistas oc ON c.id = oc.conquista_id AND oc.operador_id = ?
      WHERE c.ativa = TRUE AND oc.operador_id IS NULL
    `, [operadorId]);

    // Buscar estatísticas do operador
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_chamadas,
        COALESCE(AVG(duracao_segundos), 0) as tempo_medio_segundos,
        COALESCE(AVG(satisfacao_cliente), 0) as satisfacao_media,
        COALESCE(SUM(CASE WHEN resolvida = TRUE THEN 1 ELSE 0 END), 0) as total_resolucoes
      FROM chamadas 
      WHERE operador_id = ?
    `, [operadorId]);

    const [operador] = await pool.execute(
      'SELECT pontos_totais, nivel FROM operadores WHERE id = ?',
      [operadorId]
    );

    const estatisticas = (stats as any[])[0];
    const dadosOperador = (operador as any[])[0];

    // Verificar cada conquista
    for (const conquista of (conquistas as any[])) {
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
        // Desbloquear conquista
        await pool.execute(
          'INSERT INTO operador_conquistas (operador_id, conquista_id) VALUES (?, ?)',
          [operadorId, conquista.id]
        );

        // Adicionar pontos da conquista
        if (conquista.pontos_recompensa > 0) {
          await pool.execute(
            'UPDATE operadores SET pontos_totais = pontos_totais + ? WHERE id = ?',
            [conquista.pontos_recompensa, operadorId]
          );
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

  } catch (error) {
    console.error('Erro ao verificar conquistas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter ranking geral
export const getRankingGeral = async (req: AuthRequest, res: Response<ApiResponse<{ ranking: any[]; periodo: string; tipo: string }>>): Promise<void> => {
  try {
    const { tipo = 'pontos', periodo = 'semana' } = req.query;

    let campoOrdenacao = 'pontos_semana';
    if (periodo === 'mes') {
      campoOrdenacao = 'pontos_mes';
    }

    const [ranking] = await pool.execute(`
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
        ranking: ranking as any[],
        periodo: periodo as string,
        tipo: tipo as string
      }
    });

  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter estatísticas de gamificação
export const getEstatisticasGamificacao = async (req: AuthRequest, res: Response<ApiResponse<EstatisticasGamificacao>>): Promise<void> => {
  try {
    const operadorId = req.operador.id;

    // Buscar dados do operador
    const [operador] = await pool.execute(
      'SELECT nivel, xp_atual, xp_proximo_nivel, pontos_totais FROM operadores WHERE id = ?',
      [operadorId]
    );

    // Buscar missões concluídas
    const [missoesConcluidas] = await pool.execute(`
      SELECT COUNT(*) as total FROM operador_missoes 
      WHERE operador_id = ? AND concluida = TRUE
    `, [operadorId]);

    // Buscar conquistas desbloqueadas
    const [conquistasDesbloqueadas] = await pool.execute(`
      SELECT COUNT(*) as total FROM operador_conquistas 
      WHERE operador_id = ?
    `, [operadorId]);

    // Buscar posição no ranking
    const [posicaoRanking] = await pool.execute(`
      SELECT posicao FROM ranking 
      WHERE operador_id = ?
    `, [operadorId]);

    const dados = (operador as any[])[0];
    const progressoNivel = (dados.xp_atual / dados.xp_proximo_nivel) * 100;

    res.json({
      success: true,
      data: {
        nivel: dados.nivel,
        xp_atual: dados.xp_atual,
        xp_proximo_nivel: dados.xp_proximo_nivel,
        progresso_nivel: Math.round(progressoNivel),
        pontos_totais: dados.pontos_totais,
        missoes_concluidas: (missoesConcluidas as any[])[0].total,
        conquistas_desbloqueadas: (conquistasDesbloqueadas as any[])[0].total,
        posicao_ranking: (posicaoRanking as any[])[0]?.posicao || null
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas de gamificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
