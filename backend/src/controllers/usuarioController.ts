import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { AuthRequest, ApiResponse, Operador } from '../types';

// Listar todos os usuários da empresa
export const listarUsuarios = async (req: AuthRequest, res: Response<ApiResponse<Operador[]>>): Promise<void> => {
  try {
    // Se for gestor, buscar todos os operadores
    if (req.operador.tipo === 'gestor') {
      const [operadores] = await pool.execute(
        `SELECT id, nome, email, nivel, xp_atual, xp_proximo_nivel, pontos_totais, 
                status, avatar, tempo_online, data_criacao, data_atualizacao, pa, carteira
         FROM operadores 
         ORDER BY pontos_totais DESC`
      );

      res.json({
        success: true,
        data: operadores as Operador[]
      });
      return;
    }

    // Se for operador, buscar operadores da mesma empresa
    const operadorId = req.operador.id;
    
    // Buscar empresa do operador logado
    const [empresaResult] = await pool.execute(
      'SELECT empresa_id FROM operadores WHERE id = ?',
      [operadorId]
    );
    
    const empresa = empresaResult as any[];
    if (empresa.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Operador não encontrado'
      });
      return;
    }

    const empresaId = empresa[0].empresa_id;

    // Buscar todos os operadores da empresa
    const [operadores] = await pool.execute(
      `SELECT id, nome, email, nivel, xp_atual, xp_proximo_nivel, pontos_totais, 
              status, avatar, tempo_online, data_criacao, data_atualizacao, pa, carteira
       FROM operadores 
       WHERE empresa_id = ? 
       ORDER BY pontos_totais DESC`,
      [empresaId]
    );

    res.json({
      success: true,
      data: operadores as Operador[]
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar novo usuário
export const criarUsuario = async (req: AuthRequest, res: Response<ApiResponse<{ id: number }>>): Promise<void> => {
  try {
    const { nome, email, senha, nivel = 1, pa = '', carteira = '' } = req.body;
    
    let empresaId = 1; // Default empresa ID
    
    // Se for operador, buscar empresa do operador logado
    if (req.operador.tipo === 'operador') {
      const operadorId = req.operador.id;
      const [empresaResult] = await pool.execute(
        'SELECT empresa_id FROM operadores WHERE id = ?',
        [operadorId]
      );
      
      const empresa = empresaResult as any[];
      if (empresa.length > 0) {
        empresaId = empresa[0].empresa_id;
      }
    }

    // Verificar se email já existe
    const [emailExists] = await pool.execute(
      'SELECT id FROM operadores WHERE email = ? AND empresa_id = ?',
      [email, empresaId]
    );

    if ((emailExists as any[]).length > 0) {
      res.status(400).json({
        success: false,
        message: 'Email já cadastrado nesta empresa'
      });
      return;
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Calcular XP necessário para o próximo nível
    const xpProximoNivel = nivel * 100;

    // Inserir novo operador
    const [result] = await pool.execute(
      `INSERT INTO operadores (nome, email, senha, nivel, xp_atual, xp_proximo_nivel, 
                              pontos_totais, status, avatar, tempo_online, empresa_id, pa, carteira)
       VALUES (?, ?, ?, ?, 0, ?, 0, 'Aguardando Chamada', 'avatar1.png', 0, ?, ?, ?)`,
      [nome, email, senhaHash, nivel, xpProximoNivel, empresaId, pa, carteira]
    );

    const insertResult = result as any;
    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: { id: insertResult.insertId }
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar usuário
export const atualizarUsuario = async (req: AuthRequest, res: Response<ApiResponse<void>>): Promise<void> => {
  try {
    const { id } = req.params;
    const { nome, email, nivel, status } = req.body;
    const operadorId = req.operador.id;

    // Buscar empresa do operador logado
    const [empresaResult] = await pool.execute(
      'SELECT empresa_id FROM operadores WHERE id = ?',
      [operadorId]
    );
    
    const empresa = empresaResult as any[];
    if (empresa.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Operador não encontrado'
      });
      return;
    }

    const empresaId = empresa[0].empresa_id;

    // Verificar se o usuário pertence à mesma empresa
    const [usuarioResult] = await pool.execute(
      'SELECT id FROM operadores WHERE id = ? AND empresa_id = ?',
      [id, empresaId]
    );

    if ((usuarioResult as any[]).length === 0) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
      return;
    }

    // Verificar se email já existe (exceto para o próprio usuário)
    if (email) {
      const [emailExists] = await pool.execute(
        'SELECT id FROM operadores WHERE email = ? AND empresa_id = ? AND id != ?',
        [email, empresaId, id]
      );

      if ((emailExists as any[]).length > 0) {
        res.status(400).json({
          success: false,
          message: 'Email já cadastrado nesta empresa'
        });
        return;
      }
    }

    // Atualizar usuário
    const updateFields = [];
    const updateValues = [];

    if (nome) {
      updateFields.push('nome = ?');
      updateValues.push(nome);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (nivel) {
      updateFields.push('nivel = ?');
      updateFields.push('xp_proximo_nivel = ?');
      updateValues.push(nivel, nivel * 100);
    }
    if (status) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (updateFields.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar'
      });
      return;
    }

    updateFields.push('data_atualizacao = CURRENT_TIMESTAMP');
    updateValues.push(id);

    await pool.execute(
      `UPDATE operadores SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Excluir usuário
export const excluirUsuario = async (req: AuthRequest, res: Response<ApiResponse<void>>): Promise<void> => {
  try {
    const { id } = req.params;
    const operadorId = req.operador.id;

    // Não permitir excluir a si mesmo
    if (parseInt(id) === operadorId) {
      res.status(400).json({
        success: false,
        message: 'Não é possível excluir seu próprio usuário'
      });
      return;
    }

    // Buscar empresa do operador logado
    const [empresaResult] = await pool.execute(
      'SELECT empresa_id FROM operadores WHERE id = ?',
      [operadorId]
    );
    
    const empresa = empresaResult as any[];
    if (empresa.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Operador não encontrado'
      });
      return;
    }

    const empresaId = empresa[0].empresa_id;

    // Verificar se o usuário pertence à mesma empresa
    const [usuarioResult] = await pool.execute(
      'SELECT id FROM operadores WHERE id = ? AND empresa_id = ?',
      [id, empresaId]
    );

    if ((usuarioResult as any[]).length === 0) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
      return;
    }

    // Excluir usuário (cascade vai excluir dados relacionados)
    await pool.execute('DELETE FROM operadores WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Redefinir senha
export const redefinirSenha = async (req: AuthRequest, res: Response<ApiResponse<void>>): Promise<void> => {
  try {
    const { id } = req.params;
    const { novaSenha } = req.body;
    const operadorId = req.operador.id;

    // Buscar empresa do operador logado
    const [empresaResult] = await pool.execute(
      'SELECT empresa_id FROM operadores WHERE id = ?',
      [operadorId]
    );
    
    const empresa = empresaResult as any[];
    if (empresa.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Operador não encontrado'
      });
      return;
    }

    const empresaId = empresa[0].empresa_id;

    // Verificar se o usuário pertence à mesma empresa
    const [usuarioResult] = await pool.execute(
      'SELECT id FROM operadores WHERE id = ? AND empresa_id = ?',
      [id, empresaId]
    );

    if ((usuarioResult as any[]).length === 0) {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
      return;
    }

    // Hash da nova senha
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualizar senha
    await pool.execute(
      'UPDATE operadores SET senha = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
      [senhaHash, id]
    );

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
