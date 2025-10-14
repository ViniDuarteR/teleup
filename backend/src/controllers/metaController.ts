import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest, ApiResponse } from '../types';

// Listar metas de um operador
export const listarMetasOperador = async (req: AuthRequest, res: Response<ApiResponse<any[]>>): Promise<void> => {
  try {
    const { operadorId } = req.params;
    const gestorId = req.operador.id;

    // Verificar se o gestor tem permissão para ver as metas deste operador
    const [verificacao] = await pool.execute(`
      SELECT o.id FROM operadores o
      JOIN gestores g ON g.id = o.gestor_id
      WHERE o.id = $1 AND g.id = $2
    `, [operadorId, gestorId]);

    if ((verificacao as any[]).length === 0) {
      res.status(403).json({
        success: false,
        message: 'Você não tem permissão para ver as metas deste operador'
      });
      return;
    }

    const [metas] = await pool.execute(`
      SELECT 
        m.id,
        m.operador_id,
        m.tipo_meta,
        m.valor_atual,
        m.valor_meta,
        m.periodo,
        m.data_inicio,
        m.data_fim,
        m.ativa,
        m.pontos_recompensa,
        m.data_criacao,
        m.data_atualizacao,
        o.nome as operador_nome
      FROM metas m
      JOIN operadores o ON o.id = m.operador_id
      WHERE m.operador_id = $1
      ORDER BY m.data_criacao DESC
    `, [operadorId]);

    res.json({
      success: true,
      data: metas as any[]
    });

  } catch (error) {
    console.error('Erro ao listar metas do operador:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar nova meta para operador
export const criarMeta = async (req: AuthRequest, res: Response<ApiResponse<{ id: number }>>): Promise<void> => {
  try {
    console.log('🔍 [CRIAR META] Iniciando criação de meta');
    console.log('🔍 [CRIAR META] Body recebido:', req.body);
    
    const {
      operador_id,
      tipo_meta,
      valor_meta,
      periodo,
      data_inicio,
      data_fim,
      pontos_recompensa
    } = req.body;

    const gestorId = req.operador.id;
    console.log('🔍 [CRIAR META] Gestor ID:', gestorId);

    // Validar campos obrigatórios
    if (!operador_id || !tipo_meta || !valor_meta || !periodo || !data_inicio || !data_fim) {
      res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: operador_id, tipo_meta, valor_meta, periodo, data_inicio, data_fim'
      });
      return;
    }

    // Verificar se o gestor tem permissão para criar metas para este operador
    const [verificacao] = await pool.execute(`
      SELECT o.id FROM operadores o
      JOIN gestores g ON g.id = o.gestor_id
      WHERE o.id = $1 AND g.id = $2
    `, [operador_id, gestorId]);

    if ((verificacao as any[]).length === 0) {
      res.status(403).json({
        success: false,
        message: 'Você não tem permissão para criar metas para este operador'
      });
      return;
    }

    // Inserir nova meta
    console.log('🔍 [CRIAR META] Inserindo meta no banco...');
    const [result] = await pool.execute(`
      INSERT INTO metas (
        operador_id, tipo_meta, valor_atual, valor_meta, periodo,
        data_inicio, data_fim, ativa, pontos_recompensa
      ) VALUES ($1, $2, 0, $3, $4, $5, $6, TRUE, $7)
      RETURNING id
    `, [operador_id, tipo_meta, valor_meta, periodo, data_inicio, data_fim, pontos_recompensa || 100]);
    
    console.log('🔍 [CRIAR META] Resultado da inserção:', result);

    const insertResult = result as any;
    const metaId = insertResult[0].id;

    res.json({
      success: true,
      message: 'Meta criada com sucesso',
      data: { id: metaId }
    });

  } catch (error) {
    console.error('❌ [CRIAR META] Erro ao criar meta:', error);
    console.error('❌ [CRIAR META] Stack trace:', (error as Error).stack);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar meta
export const atualizarMeta = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      tipo_meta,
      valor_meta,
      periodo,
      data_inicio,
      data_fim,
      ativa,
      pontos_recompensa
    } = req.body;

    const gestorId = req.operador.id;

    // Verificar se o gestor tem permissão para atualizar esta meta
    const [verificacao] = await pool.execute(`
      SELECT m.id FROM metas m
      JOIN operadores o ON o.id = m.operador_id
      JOIN gestores g ON g.id = o.gestor_id
      WHERE m.id = $1 AND g.id = $2
    `, [id, gestorId]);

    if ((verificacao as any[]).length === 0) {
      res.status(403).json({
        success: false,
        message: 'Você não tem permissão para atualizar esta meta'
      });
      return;
    }

    // Atualizar meta
    await pool.execute(`
      UPDATE metas SET
        tipo_meta = COALESCE($1, tipo_meta),
        valor_meta = COALESCE($2, valor_meta),
        periodo = COALESCE($3, periodo),
        data_inicio = COALESCE($4, data_inicio),
        data_fim = COALESCE($5, data_fim),
        ativa = COALESCE($6, ativa),
        pontos_recompensa = COALESCE($7, pontos_recompensa),
        data_atualizacao = NOW()
      WHERE id = $8
    `, [tipo_meta, valor_meta, periodo, data_inicio, data_fim, ativa, pontos_recompensa, id]);

    res.json({
      success: true,
      message: 'Meta atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Excluir meta
export const excluirMeta = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { id } = req.params;
    const gestorId = req.operador.id;

    // Verificar se o gestor tem permissão para excluir esta meta
    const [verificacao] = await pool.execute(`
      SELECT m.id FROM metas m
      JOIN operadores o ON o.id = m.operador_id
      JOIN gestores g ON g.id = o.gestor_id
      WHERE m.id = $1 AND g.id = $2
    `, [id, gestorId]);

    if ((verificacao as any[]).length === 0) {
      res.status(403).json({
        success: false,
        message: 'Você não tem permissão para excluir esta meta'
      });
      return;
    }

    // Excluir meta
    await pool.execute('DELETE FROM metas WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Meta excluída com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir meta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar todas as metas dos operadores do gestor
export const listarTodasMetas = async (req: AuthRequest, res: Response<ApiResponse<any[]>>): Promise<void> => {
  try {
    const gestorId = req.operador.id;

    const [metas] = await pool.execute(`
      SELECT 
        m.id,
        m.operador_id,
        m.tipo_meta,
        m.valor_atual,
        m.valor_meta,
        m.periodo,
        m.data_inicio,
        m.data_fim,
        m.ativa,
        m.pontos_recompensa,
        m.data_criacao,
        m.data_atualizacao,
        o.nome as operador_nome,
        o.email as operador_email
      FROM metas m
      JOIN operadores o ON o.id = m.operador_id
      JOIN gestores g ON g.id = o.gestor_id
      WHERE g.id = $1
      ORDER BY m.data_criacao DESC
    `, [gestorId]);

    res.json({
      success: true,
      data: metas as any[]
    });

  } catch (error) {
    console.error('Erro ao listar todas as metas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
