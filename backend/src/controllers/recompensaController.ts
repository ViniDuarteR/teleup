import { Response } from 'express';
import { AuthRequest } from '../types';
import { pool } from '../config/database';

// Buscar todas as recompensas disponíveis da empresa
export const getRecompensas = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 [GET RECOMPENSAS] Buscando recompensas');
    
    let empresaId = 1; // Default
    
    // Se for gestor, buscar empresa do gestor
    if (req.user?.tipo === 'gestor') {
      const gestorId = req.user.id;
      const [empresaResult] = await pool.execute(
        'SELECT empresa_id FROM gestores WHERE id = $1',
        [gestorId]
      );
      
      const empresa = empresaResult as any[];
      if (empresa.length > 0) {
        empresaId = empresa[0].empresa_id;
      }
    } else if (req.user?.tipo === 'operador') {
      // Se for operador, buscar empresa do operador
      const operadorId = req.user.id;
      const [empresaResult] = await pool.execute(
        'SELECT empresa_id FROM operadores WHERE id = $1',
        [operadorId]
      );
      
      const empresa = empresaResult as any[];
      if (empresa.length > 0) {
        empresaId = empresa[0].empresa_id;
      }
    }
    
    console.log('🔍 [GET RECOMPENSAS] Empresa ID:', empresaId);
    
    const query = `
      SELECT 
        id,
        titulo as nome,
        descricao,
        categoria,
        preco,
        tipo,
        raridade,
        imagem,
        disponivel,
        quantidade_restante,
        criado_em as data_criacao
      FROM recompensas 
      WHERE disponivel = true AND empresa_id = $1
      ORDER BY raridade DESC, preco ASC
    `;

    const [rows] = await pool.execute(query, [empresaId]);
    
    console.log('✅ [GET RECOMPENSAS] Recompensas encontradas:', rows.length);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('❌ [GET RECOMPENSAS] Erro ao buscar recompensas:', error);
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
      WHERE c.operador_id = $1
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
  try {
    
    const operadorId = req.user?.id;
    const { recompensa_id } = req.body;
    
    if (!operadorId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    // Buscar informações da recompensa
    const [recompensaRows] = await pool.execute(
      'SELECT * FROM recompensas WHERE id = $1 AND disponivel = true',
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
    const [compraExistente] = await pool.execute(
      'SELECT id FROM compras WHERE operador_id = $1 AND recompensa_id = $2',
      [operadorId, recompensa_id]
    );
    
    if (Array.isArray(compraExistente) && compraExistente.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Você já possui esta recompensa'
      });
    }
    
    // Buscar pontos do operador
    const [operadorRows] = await pool.execute(
      'SELECT pontos_totais FROM operadores WHERE id = $1',
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
    const [result] = await pool.execute(
      'INSERT INTO compras (operador_id, recompensa_id, data_compra, status) VALUES ($1, $2, NOW(), \'aprovada\') RETURNING id',
      [operadorId, recompensa_id]
    );
    
    // Deduzir pontos do operador
    await pool.execute(
      'UPDATE operadores SET pontos_totais = pontos_totais - $1 WHERE id = $2',
      [recompensa.preco, operadorId]
    );
    
    // Atualizar quantidade restante se aplicável
    if (recompensa.quantidade_restante !== null) {
      await pool.execute(
        'UPDATE recompensas SET quantidade_restante = quantidade_restante - 1 WHERE id = $1',
        [recompensa_id]
      );
    }
    
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
    console.error('Erro ao comprar recompensa:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  } finally {
  }
};

// Criar nova recompensa (apenas para gestores)
export const criarRecompensa = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 [CRIAR RECOMPENSA] Iniciando criação de recompensa');
    console.log('🔍 [CRIAR RECOMPENSA] Headers:', req.headers);
    console.log('🔍 [CRIAR RECOMPENSA] Body recebido:', req.body);
    console.log('🔍 [CRIAR RECOMPENSA] User:', req.user);
    console.log('🔍 [CRIAR RECOMPENSA] File:', req.file);
    
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
    
    // Validar campos obrigatórios
    if (!nome || !preco) {
      return res.status(400).json({
        success: false,
        message: 'Nome e preço são obrigatórios'
      });
    }
    
    // Obter empresa_id do gestor logado
    const gestorId = req.user?.id;
    console.log('🔍 [CRIAR RECOMPENSA] Gestor ID:', gestorId);
    
    // Buscar empresa do gestor
    const [empresaResult] = await pool.execute(
      'SELECT empresa_id FROM gestores WHERE id = $1',
      [gestorId]
    );
    
    const empresa = empresaResult as any[];
    if (empresa.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empresa do gestor não encontrada'
      });
    }
    
    const empresaId = empresa[0].empresa_id;
    console.log('🔍 [CRIAR RECOMPENSA] Empresa ID:', empresaId);
    
    // Mapear campos do frontend para a estrutura da tabela
    const titulo = nome; // O campo na tabela é 'titulo', não 'nome'
    const categoriaFinal = categoria || 'Outros';
    
    console.log('🔍 [CRIAR RECOMPENSA] Dados mapeados:', {
      titulo,
      descricao,
      categoria: categoriaFinal,
      preco,
      empresaId
    });
    
    const query = `
      INSERT INTO recompensas (
        titulo, descricao, categoria, preco, tipo, raridade, 
        imagem, disponivel, quantidade_restante, empresa_id, criado_em
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, $9, NOW()) RETURNING id
    `;
    
    const [result] = await pool.execute(query, [
      titulo, descricao, categoriaFinal, preco, tipo || 'item', raridade || 'comum',
      imagem || null, quantidade_restante || null, empresaId
    ]);
    
    console.log('✅ [CRIAR RECOMPENSA] Recompensa criada com sucesso, ID:', (result as any)[0]?.id);
    
    res.json({
      success: true,
      message: 'Recompensa criada com sucesso!',
      data: {
        id: (result as any)[0]?.id
      }
    });
  } catch (error: any) {
    console.error('❌ [CRIAR RECOMPENSA] Erro ao criar recompensa:', error);
    console.error('❌ [CRIAR RECOMPENSA] Stack trace:', error?.stack);
    
    // Log detalhado do erro para debug
    if (error.code) {
      console.error('❌ [CRIAR RECOMPENSA] Código do erro:', error.code);
    }
    if (error.detail) {
      console.error('❌ [CRIAR RECOMPENSA] Detalhes do erro:', error.detail);
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
