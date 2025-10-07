import { Response } from 'express';
import { AuthRequest } from '../types';
import { pool } from '../config/database';

// Buscar recompensas
export const getRecompensas = async (req: AuthRequest, res: Response) => {
  try {
    const [recompensas] = await pool.execute(
      'SELECT * FROM recompensas WHERE disponivel = 1 ORDER BY categoria, preco'
    );

    return res.json({
      success: true,
      data: recompensas
    });
  } catch (error) {
    console.error('Erro ao buscar recompensas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar compras do operador
export const getCompras = async (req: AuthRequest, res: Response) => {
  try {
    const operadorId = req.operador?.id;
    
    if (!operadorId) {
      return res.status(401).json({
        success: false,
        message: 'Operador não autenticado'
      });
    }

    const [compras] = await pool.execute(
      `SELECT c.*, r.nome as recompensa_nome, r.descricao as recompensa_descricao, r.preco
       FROM compras c
       JOIN recompensas r ON c.recompensa_id = r.id
       WHERE c.operador_id = ?
       ORDER BY c.data_compra DESC`,
      [operadorId]
    );

    return res.json({
      success: true,
      data: compras
    });
  } catch (error) {
    console.error('Erro ao buscar compras:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Comprar recompensa
export const comprarRecompensa = async (req: AuthRequest, res: Response) => {
  try {
    const { recompensa_id } = req.body;
    const operadorId = req.operador?.id;
    
    if (!operadorId) {
      return res.status(401).json({
        success: false,
        message: 'Operador não autenticado'
      });
    }

    // Buscar recompensa
    const [recompensas] = await pool.execute(
      'SELECT * FROM recompensas WHERE id = ? AND disponivel = 1',
      [recompensa_id]
    );
    
    if ((recompensas as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recompensa não encontrada ou indisponível'
      });
    }

    const recompensa = (recompensas as any[])[0];

    // Verificar se o operador tem pontos suficientes
    const [operador] = await pool.execute(
      'SELECT pontos_totais FROM operadores WHERE id = ?',
      [operadorId]
    );

    const pontosOperador = (operador as any[])[0]?.pontos_totais || 0;
    
    if (pontosOperador < recompensa.preco) {
      return res.status(400).json({
        success: false,
        message: 'Pontos insuficientes para esta compra'
      });
    }

    // Realizar a compra
    await pool.execute(
      'INSERT INTO compras (operador_id, recompensa_id, pontos_gastos, data_compra) VALUES (?, ?, ?, NOW())',
      [operadorId, recompensa_id, recompensa.preco]
    );

    // Deduzir pontos do operador
    await pool.execute(
      'UPDATE operadores SET pontos_totais = pontos_totais - ? WHERE id = ?',
      [recompensa.preco, operadorId]
    );

    return res.json({
      success: true,
      message: 'Compra realizada com sucesso!',
      data: {
        recompensa_nome: recompensa.nome,
        pontos_gastos: recompensa.preco,
        pontos_restantes: pontosOperador - recompensa.preco
      }
    });
    
  } catch (error) {
    console.error('Erro ao comprar recompensa:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar nova recompensa
export const criarRecompensa = async (req: AuthRequest, res: Response) => {
  try {
    const {
      nome,
      descricao,
      categoria,
      preco,
      tipo,
      raridade,
      imagem,
      disponivel,
      quantidade_restante
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO recompensas (nome, descricao, categoria, preco, tipo, raridade, imagem, disponivel, quantidade_restante)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, descricao, categoria, parseInt(preco), tipo, raridade, imagem || null, disponivel !== false ? 1 : 0, quantidade_restante ? parseInt(quantidade_restante) : null]
    );

    const novaRecompensa = {
      id: (result as any).insertId,
      nome,
      descricao,
      categoria,
      preco: parseInt(preco),
      tipo,
      raridade,
      imagem: imagem || null,
      disponivel: disponivel !== false,
      quantidade_restante: quantidade_restante ? parseInt(quantidade_restante) : null
    };

    return res.json({
      success: true,
      message: 'Recompensa criada com sucesso!',
      data: novaRecompensa
    });
  } catch (error) {
    console.error('Erro ao criar recompensa:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar recompensa
export const atualizarRecompensa = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      nome,
      descricao,
      categoria,
      preco,
      tipo,
      raridade,
      imagem,
      disponivel,
      quantidade_restante
    } = req.body;

    const [result] = await pool.execute(
      `UPDATE recompensas SET nome = ?, descricao = ?, categoria = ?, preco = ?, tipo = ?, raridade = ?, imagem = ?, disponivel = ?, quantidade_restante = ?
       WHERE id = ?`,
      [nome, descricao, categoria, parseInt(preco), tipo, raridade, imagem || null, disponivel !== false ? 1 : 0, quantidade_restante ? parseInt(quantidade_restante) : null, parseInt(id)]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recompensa não encontrada'
      });
    }

    return res.json({
      success: true,
      message: 'Recompensa atualizada com sucesso!',
      data: {
        id: parseInt(id),
        nome,
        descricao,
        categoria,
        preco: parseInt(preco),
        tipo,
        raridade,
        imagem: imagem || null,
        disponivel: disponivel !== false,
        quantidade_restante: quantidade_restante ? parseInt(quantidade_restante) : null
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar recompensa:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Excluir recompensa
export const excluirRecompensa = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM recompensas WHERE id = ?',
      [parseInt(id)]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recompensa não encontrada'
      });
    }

    return res.json({
      success: true,
      message: 'Recompensa excluída com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao excluir recompensa:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Toggle disponibilidade
export const toggleDisponibilidade = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { disponivel } = req.body;
    
    const [result] = await pool.execute(
      'UPDATE recompensas SET disponivel = ? WHERE id = ?',
      [disponivel ? 1 : 0, parseInt(id)]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recompensa não encontrada'
      });
    }

    return res.json({
      success: true,
      message: `Recompensa ${disponivel ? 'habilitada' : 'desabilitada'} com sucesso!`,
      data: {
        id: parseInt(id),
        disponivel
      }
    });
  } catch (error) {
    console.error('Erro ao alterar disponibilidade:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
