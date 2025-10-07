import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { AuthRequest, LoginRequest, LoginResponse, DashboardData, ApiResponse } from '../types';

// Login do operador
export const login = async (req: Request<{}, ApiResponse<LoginResponse>, LoginRequest>, res: Response<ApiResponse<LoginResponse>>): Promise<void> => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
      return;
    }

    // Buscar operador por email
    const [operadores] = await pool.execute(
      'SELECT * FROM operadores WHERE email = ?',
      [email]
    );

    if ((operadores as any[]).length === 0) {
      res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
      return;
    }

    const operador = (operadores as any[])[0];

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, operador.senha);
    if (!senhaValida) {
      res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
      return;
    }

    // Gerar token JWT
    const token = jwt.sign(
      { operadorId: operador.id, email: operador.email },
      process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro_aqui',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
    );

    // Salvar sessão no banco
    const dataExpiracao = new Date();
    dataExpiracao.setHours(dataExpiracao.getHours() + 24);

    await pool.execute(
      'INSERT INTO sessoes (operador_id, token, expiracao) VALUES (?, ?, ?)',
      [operador.id, token, dataExpiracao]
    );

    // Atualizar status para online
    await pool.execute(
      'UPDATE operadores SET status = ? WHERE id = ?',
      ['Aguardando Chamada', operador.id]
    );

    // Preparar dados do operador baseado no tipo
    let operadorData: any = {
      id: operador.id,
      nome: operador.nome,
      email: operador.email,
      tipo: operador.tipo,
      status: 'Aguardando Chamada' as const,
      avatar: operador.avatar,
      data_criacao: operador.data_criacao,
      data_atualizacao: operador.data_atualizacao
    };

    // Adicionar campos de gamificação apenas para operadores
    if (operador.tipo === 'operador') {
      operadorData.nivel = operador.nivel;
      operadorData.xp_atual = operador.xp_atual;
      operadorData.xp_proximo_nivel = operador.xp_proximo_nivel;
      operadorData.pontos_totais = operador.pontos_totais;
      operadorData.tempo_online = operador.tempo_online;
    }
    // Para gestores, não incluir nenhum campo de gamificação

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        operador: operadorData
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Logout do operador
export const logout = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { token } = req;

    // Desativar sessão
    await pool.execute(
      'UPDATE sessoes SET ativo = FALSE WHERE token = ?',
      [token]
    );

    // Atualizar status para offline
    await pool.execute(
      'UPDATE operadores SET status = ? WHERE id = ?',
      ['Offline', req.operador.id]
    );

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter dados do dashboard do operador
export const getDashboard = async (req: AuthRequest, res: Response<ApiResponse<DashboardData>>): Promise<void> => {
  try {
    const operadorId = req.operador.id;

    // Buscar dados do operador
    const [operadores] = await pool.execute(
      'SELECT * FROM operadores WHERE id = ?',
      [operadorId]
    );

    if ((operadores as any[]).length === 0) {
      res.status(404).json({
        success: false,
        message: 'Operador não encontrado'
      });
      return;
    }

    const operador = (operadores as any[])[0];

    // Buscar metas ativas
    const [metas] = await pool.execute(`
      SELECT * FROM metas 
      WHERE operador_id = ? AND concluida = FALSE 
      AND data_inicio <= CURDATE() AND data_fim >= CURDATE()
      ORDER BY data_inicio DESC
    `, [operadorId]);

    // Buscar missões ativas
    const [missoes] = await pool.execute(`
      SELECT m.*, pm.progresso_atual, pm.concluida
      FROM missoes m
      LEFT JOIN progresso_missoes pm ON m.id = pm.missao_id AND pm.operador_id = ?
      WHERE m.ativa = TRUE AND (pm.concluida = FALSE OR pm.concluida IS NULL)
      ORDER BY m.tipo, m.data_inicio
    `, [operadorId]);

    // Buscar conquistas desbloqueadas
    const [conquistas] = await pool.execute(`
      SELECT c.*, oc.data_desbloqueio
      FROM conquistas c
      INNER JOIN operador_conquistas oc ON c.id = oc.conquista_id
      WHERE oc.operador_id = ?
      ORDER BY oc.data_desbloqueio DESC
      LIMIT 5
    `, [operadorId]);

    // Buscar estatísticas do dia
    const [statsHoje] = await pool.execute(`
      SELECT 
        COUNT(*) as chamadas_hoje,
        COALESCE(SUM(duracao_segundos), 0) as tempo_total_segundos,
        COALESCE(AVG(satisfacao_cliente), 0) as satisfacao_media,
        COALESCE(SUM(CASE WHEN resolvida = TRUE THEN 1 ELSE 0 END), 0) as resolucoes
      FROM chamadas 
      WHERE operador_id = ? AND DATE(inicio_chamada) = CURDATE()
    `, [operadorId]);

    const estatisticas = (statsHoje as any[])[0];

    res.json({
      success: true,
      data: {
        operador: {
          id: operador.id,
          nome: operador.nome,
          email: operador.email,
          tipo: 'operador',
          avatar: operador.avatar,
          nivel: operador.nivel,
          xp_atual: operador.xp_atual,
          xp_proximo_nivel: operador.xp_proximo_nivel,
          pontos_totais: operador.pontos_totais,
          status: operador.status,
          tempo_online: operador.tempo_online,
          data_criacao: operador.data_criacao,
          data_atualizacao: operador.data_atualizacao
        },
        metas: metas as any[],
        missoes: (missoes as any[]).map(m => ({
          ...m,
          progresso_atual: m.progresso_atual || 0,
          concluida: m.concluida || false
        })),
        conquistas: (conquistas as any[]).map(c => ({
          ...c,
          desbloqueada: true
        })),
        estatisticas: {
          chamadas_hoje: estatisticas.chamadas_hoje,
          tempo_total: Math.floor(estatisticas.tempo_total_segundos / 60), // em minutos
          satisfacao_media: Math.round(estatisticas.satisfacao_media * 10) / 10,
          resolucoes: estatisticas.resolucoes
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar status do operador
export const updateStatus = async (req: AuthRequest, res: Response<ApiResponse<{ status: string }>>): Promise<void> => {
  try {
    const { status } = req.body;

    const statusValidos = ['Aguardando Chamada', 'Em Chamada', 'Em Pausa', 'Offline'];
    if (!statusValidos.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Status inválido'
      });
      return;
    }

    await pool.execute(
      'UPDATE operadores SET status = ? WHERE id = ?',
      [status, req.operador.id]
    );

    res.json({
      success: true,
      message: 'Status atualizado com sucesso',
      data: { status }
    });

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter ranking de operadores
export const getRanking = async (req: AuthRequest, res: Response<ApiResponse<{ ranking: any[]; periodo: string }>>): Promise<void> => {
  try {
    const { periodo = 'semana' } = req.query;

    let campoPontos = 'pontos_semana';
    if (periodo === 'mes') {
      campoPontos = 'pontos_mes';
    }

    const [ranking] = await pool.execute(`
      SELECT 
        r.posicao,
        o.id,
        o.nome,
        o.avatar,
        o.nivel,
        r.${campoPontos} as pontos,
        r.chamadas_semana,
        r.chamadas_mes
      FROM ranking r
      INNER JOIN operadores o ON r.operador_id = o.id
      ORDER BY r.${campoPontos} DESC
      LIMIT 20
    `);

    res.json({
      success: true,
      data: {
        ranking: ranking as any[],
        periodo: periodo as string
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
