import { Response } from 'express';
import { AuthRequest } from '../types';
import { pool } from '../config/database';

// Buscar todas as recompensas disponíveis
export const getRecompensas = async (req: AuthRequest, res: Response) => {
  try {
    const query = `
      SELECT 
        id,
        nome,
        descricao,
        categoria,
        preco,
        tipo,
        raridade,
        imagem,
        disponivel,
        quantidade_restante,
        data_criacao
      FROM recompensas 
      WHERE disponivel = true
      ORDER BY raridade DESC, preco ASC
    `;

    const [rows] = await pool.execute(query);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Erro ao buscar recompensas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar compras do operador
export const getCompras = async (req: AuthRequest, res: Response) => {
  try {
    const operadorId = req.user?.id;
    
    if (!operadorId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const query = `
      SELECT 
        c.id,
        c.recompensa_id,
        c.operador_id,
        c.data_compra,
        c.status,
        r.nome as recompensa_nome,
        r.categoria,
        r.preco
      FROM compras c
      JOIN recompensas r ON c.recompensa_id = r.id
      WHERE c.operador_id = ?
      ORDER BY c.data_compra DESC
    `;

    const [rows] = await pool.execute(query, [operadorId]);
    
    return res.json({
      success: true,
      data: rows
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
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const operadorId = req.user?.id;
    const { recompensa_id } = req.body;
    
    if (!operadorId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    // Buscar informações da recompensa
    const [recompensaRows] = await connection.execute(
      'SELECT * FROM recompensas WHERE id = ? AND disponivel = true',
      [recompensa_id]
    );
    
    if (!Array.isArray(recompensaRows) || recompensaRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recompensa não encontrada ou indisponível'
      });
    }
    
    const recompensa = recompensaRows[0] as any;
    
    // Verificar se já possui a recompensa
    const [compraExistente] = await connection.execute(
      'SELECT id FROM compras WHERE operador_id = ? AND recompensa_id = ?',
      [operadorId, recompensa_id]
    );
    
    if (Array.isArray(compraExistente) && compraExistente.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Você já possui esta recompensa'
      });
    }
    
    // Buscar pontos do operador
    const [operadorRows] = await connection.execute(
      'SELECT pontos_totais FROM operadores WHERE id = ?',
      [operadorId]
    );
    
    if (!Array.isArray(operadorRows) || operadorRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Operador não encontrado'
      });
    }
    
    const operador = operadorRows[0] as any;
    
    if (operador.pontos_totais < recompensa.preco) {
      return res.status(400).json({
        success: false,
        message: 'Pontos insuficientes para comprar esta recompensa'
      });
    }
    
    // Verificar quantidade restante
    if (recompensa.quantidade_restante !== null && recompensa.quantidade_restante <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Recompensa esgotada'
      });
    }
    
    // Realizar a compra
    const [result] = await connection.execute(
      'INSERT INTO compras (operador_id, recompensa_id, data_compra, status) VALUES (?, ?, NOW(), "aprovada")',
      [operadorId, recompensa_id]
    );
    
    // Deduzir pontos do operador
    await connection.execute(
      'UPDATE operadores SET pontos_totais = pontos_totais - ? WHERE id = ?',
      [recompensa.preco, operadorId]
    );
    
    // Atualizar quantidade restante se aplicável
    if (recompensa.quantidade_restante !== null) {
      await connection.execute(
        'UPDATE recompensas SET quantidade_restante = quantidade_restante - 1 WHERE id = ?',
        [recompensa_id]
      );
    }
    
    await connection.commit();
    
    return res.json({
      success: true,
      message: 'Compra realizada com sucesso!',
      data: {
        compra_id: (result as any).insertId,
        pontos_gastos: recompensa.preco,
        pontos_restantes: operador.pontos_totais - recompensa.preco
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao comprar recompensa:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  } finally {
    connection.release();
  }
};

// Criar nova recompensa (apenas para gestores)
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
      quantidade_restante
    } = req.body;
    
    const query = `
      INSERT INTO recompensas (
        nome, descricao, categoria, preco, tipo, raridade, 
        imagem, disponivel, quantidade_restante, data_criacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, true, ?, NOW())
    `;
    
    const [result] = await pool.execute(query, [
      nome, descricao, categoria, preco, tipo, raridade,
      imagem, quantidade_restante
    ]);
    
    res.json({
      success: true,
      message: 'Recompensa criada com sucesso!',
      data: {
        id: (result as any).insertId
      }
    });
  } catch (error) {
    console.error('Erro ao criar recompensa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
