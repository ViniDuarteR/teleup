import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { ApiResponse, LoginRequest, LoginResponse } from '../types';

export const loginGestor = async (req: Request<{}, ApiResponse<LoginResponse>, LoginRequest>, res: Response<ApiResponse<LoginResponse>>): Promise<void> => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
      return;
    }

    const [gestores] = await pool.execute(
      'SELECT * FROM gestores WHERE email = $1 AND status = $2',
      [email, 'Ativo']
    );

    if ((gestores as any[]).length === 0) {
      res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
      return;
    }

    const gestor = (gestores as any[])[0];

    const senhaValida = await bcrypt.compare(senha, gestor.senha);
    if (!senhaValida) {
      res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
      return;
    }

    const token = jwt.sign(
      { gestorId: gestor.id, email: gestor.email, tipo: 'gestor' },
      process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro_aqui',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
    );

    const dataExpiracao = new Date();
    dataExpiracao.setHours(dataExpiracao.getHours() + 24);

    try {
      await pool.execute(
        'INSERT INTO sessoes_empresa (empresa_id, token, expiracao) VALUES ($1, $2, $3)',
        [gestor.empresa_id, token, dataExpiracao]
      );
    } catch (error: any) {
      console.error('Erro ao salvar sessão do gestor:', error.message);
      // Continuar mesmo se falhar ao salvar sessão
    }

    // Preparar dados do gestor (sem campos de gamificação)
    const gestorData: any = {
      id: gestor.id,
      nome: gestor.nome,
      email: gestor.email,
      tipo: 'gestor',
      status: gestor.status,
      avatar: gestor.avatar,
      data_criacao: gestor.data_criacao,
      data_atualizacao: gestor.data_atualizacao
    };

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        operador: gestorData
      }
    });

  } catch (error: any) {
    console.error('Erro no login do gestor:', error);
    
    // Verificar se é erro de conexão com banco
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
      res.status(500).json({
        success: false,
        message: 'Erro de conexão com banco de dados'
      });
      return;
    }
    
    // Verificar se é erro de query
    if (error?.code && error.code.startsWith('23')) {
      res.status(400).json({
        success: false,
        message: 'Dados inválidos fornecidos'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar gestores da empresa
export const listarGestores = async (req: any, res: Response): Promise<void> => {
  try {
    const gestorId = req.operador.id;
    
    // Buscar empresa do gestor logado
    const [empresaResult] = await pool.execute(
      'SELECT empresa_id FROM gestores WHERE id = ?',
      [gestorId]
    );
    
    const empresa = empresaResult as any[];
    if (empresa.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Gestor não encontrado'
      });
      return;
    }

    const empresaId = empresa[0].empresa_id;

    // Buscar todos os gestores da empresa
    const [gestores] = await pool.execute(
      `SELECT id, nome, email, status, avatar, data_criacao, data_atualizacao
       FROM gestores 
       WHERE empresa_id = ? 
       ORDER BY nome`,
      [empresaId]
    );

    res.json({
      success: true,
      data: gestores
    });
  } catch (error) {
    console.error('Erro ao listar gestores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar novo gestor
export const criarGestor = async (req: any, res: Response): Promise<void> => {
  try {
    const { nome, email, senha } = req.body;
    const gestorId = req.operador.id;

    // Buscar empresa do gestor logado
    const [empresaResult] = await pool.execute(
      'SELECT empresa_id FROM gestores WHERE id = ?',
      [gestorId]
    );
    
    const empresa = empresaResult as any[];
    if (empresa.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Gestor não encontrado'
      });
      return;
    }

    const empresaId = empresa[0].empresa_id;

    // Verificar se email já existe
    const [emailExists] = await pool.execute(
      'SELECT id FROM gestores WHERE email = ? AND empresa_id = ?',
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

    // Inserir novo gestor
    const [result] = await pool.execute(
      `INSERT INTO gestores (nome, email, senha, status, avatar, empresa_id)
       VALUES (?, ?, ?, 'Ativo', 'avatar1.png', ?)`,
      [nome, email, senhaHash, empresaId]
    );

    const insertResult = result as any;
    res.status(201).json({
      success: true,
      message: 'Gestor criado com sucesso',
      data: { id: insertResult.insertId }
    });

  } catch (error) {
    console.error('Erro ao criar gestor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar gestor
export const atualizarGestor = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nome, email, status } = req.body;
    const gestorId = req.operador.id;

    // Verificar se o gestor pertence à mesma empresa
    const [gestorResult] = await pool.execute(
      'SELECT empresa_id FROM gestores WHERE id = ?',
      [id]
    );
    
    const [currentGestorResult] = await pool.execute(
      'SELECT empresa_id FROM gestores WHERE id = ?',
      [gestorId]
    );

    const gestor = gestorResult as any[];
    const currentGestor = currentGestorResult as any[];

    if (gestor.length === 0 || currentGestor.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Gestor não encontrado'
      });
      return;
    }

    if (gestor[0].empresa_id !== currentGestor[0].empresa_id) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
      return;
    }

    // Atualizar gestor
    await pool.execute(
      'UPDATE gestores SET nome = ?, email = ?, status = ? WHERE id = ?',
      [nome, email, status, id]
    );

    res.json({
      success: true,
      message: 'Gestor atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar gestor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Excluir gestor
export const excluirGestor = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const gestorId = req.operador.id;

    // Não permitir excluir a si mesmo
    if (parseInt(id) === gestorId) {
      res.status(400).json({
        success: false,
        message: 'Não é possível excluir seu próprio usuário'
      });
      return;
    }

    // Verificar se o gestor pertence à mesma empresa
    const [gestorResult] = await pool.execute(
      'SELECT empresa_id FROM gestores WHERE id = ?',
      [id]
    );
    
    const [currentGestorResult] = await pool.execute(
      'SELECT empresa_id FROM gestores WHERE id = ?',
      [gestorId]
    );

    const gestor = gestorResult as any[];
    const currentGestor = currentGestorResult as any[];

    if (gestor.length === 0 || currentGestor.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Gestor não encontrado'
      });
      return;
    }

    if (gestor[0].empresa_id !== currentGestor[0].empresa_id) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
      return;
    }

    // Excluir gestor
    await pool.execute('DELETE FROM gestores WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Gestor excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir gestor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Logout do gestor
export const logoutGestor = async (req: any, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      await pool.execute(
        'UPDATE sessoes SET ativo = FALSE WHERE token = ?',
        [token]
      );
    }

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no logout do gestor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter operadores gerenciados pelo gestor
export const getOperadoresGerenciados = async (req: any, res: Response): Promise<void> => {
  try {
    const gestorId = req.operador.id;
    
    // Buscar operadores atribuídos ao gestor
    const [operadores] = await pool.execute(
      `SELECT o.id, o.nome, o.email, o.nivel, o.xp_atual, o.xp_proximo_nivel, 
              o.pontos_totais, o.status, o.avatar, o.tempo_online, o.pa, o.carteira,
              o.data_criacao, o.data_atualizacao
       FROM operadores o
       INNER JOIN operador_gestor og ON o.id = og.operador_id
       WHERE og.gestor_id = ? AND og.ativo = TRUE
       ORDER BY o.pontos_totais DESC`,
      [gestorId]
    );

    res.json({
      success: true,
      data: operadores
    });
  } catch (error) {
    console.error('Erro ao buscar operadores gerenciados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atribuir operador ao gestor
export const atribuirOperador = async (req: any, res: Response): Promise<void> => {
  try {
    const { operadorId } = req.body;
    const gestorId = req.operador.id;

    // Verificar se o operador existe
    const [operadorResult] = await pool.execute(
      'SELECT id FROM operadores WHERE id = ?',
      [operadorId]
    );

    if ((operadorResult as any[]).length === 0) {
      res.status(404).json({
        success: false,
        message: 'Operador não encontrado'
      });
      return;
    }

    // Verificar se já está atribuído
    const [atribuicaoResult] = await pool.execute(
      'SELECT id FROM operador_gestor WHERE operador_id = ? AND gestor_id = ? AND ativo = TRUE',
      [operadorId, gestorId]
    );

    if ((atribuicaoResult as any[]).length > 0) {
      res.status(400).json({
        success: false,
        message: 'Operador já está atribuído a este gestor'
      });
      return;
    }

    // Atribuir operador ao gestor
    await pool.execute(
      'INSERT INTO operador_gestor (operador_id, gestor_id, data_atribuicao, ativo) VALUES (?, ?, NOW(), TRUE)',
      [operadorId, gestorId]
    );

    res.json({
      success: true,
      message: 'Operador atribuído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atribuir operador:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Remover operador do gestor
export const removerOperador = async (req: any, res: Response): Promise<void> => {
  try {
    const { operadorId } = req.body;
    const gestorId = req.operador.id;

    // Remover atribuição
    await pool.execute(
      'UPDATE operador_gestor SET ativo = FALSE WHERE operador_id = ? AND gestor_id = ?',
      [operadorId, gestorId]
    );

    res.json({
      success: true,
      message: 'Operador removido com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover operador:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};