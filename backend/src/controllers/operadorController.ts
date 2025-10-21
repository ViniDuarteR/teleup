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
      'SELECT * FROM operadores WHERE email = $1',
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
      { operadorId: operador.id, email: operador.email, tipo: 'operador' },
      process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro_aqui',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
    );

    // Salvar sessão no banco
    const dataExpiracao = new Date();
    dataExpiracao.setHours(dataExpiracao.getHours() + 24);
    console.log(`💾 [OPERADOR LOGIN] Tentando salvar sessão para operador ID: ${operador.id}`);

    // Verificar se a tabela sessoes existe, se não, usar sessoes_empresa
    try {
      console.log(`💾 [OPERADOR LOGIN] Tentando inserir na tabela 'sessoes'`);
      await pool.execute(
        'INSERT INTO sessoes (operador_id, token, expiracao) VALUES ($1, $2, $3)',
        [operador.id, token, dataExpiracao]
      );
      console.log(`✅ [OPERADOR LOGIN] Sessão salva na tabela 'sessoes' com sucesso`);
    } catch (error: any) {
      console.log(`⚠️ [OPERADOR LOGIN] Erro ao salvar na tabela 'sessoes': ${error.code} - ${error.message}`);
      // Se a tabela sessoes não existir, usar sessoes_empresa
      if (error.code === '42P01') { // Tabela não existe
        console.log(`💾 [OPERADOR LOGIN] Tentando inserir na tabela 'sessoes_empresa' como fallback`);
        await pool.execute(
          'INSERT INTO sessoes_empresa (empresa_id, token, expiracao) VALUES ($1, $2, $3)',
          [operador.empresa_id, token, dataExpiracao]
        );
        console.log(`✅ [OPERADOR LOGIN] Sessão salva na tabela 'sessoes_empresa' com sucesso`);
      } else {
        console.log(`❌ [OPERADOR LOGIN] Erro não relacionado à tabela: ${error.message}`);
        throw error;
      }
    }

    // Atualizar status para online
    console.log(`📊 [OPERADOR LOGIN] Atualizando status do operador para 'Aguardando Chamada'`);
    await pool.execute(
      'UPDATE operadores SET status_operacional = $1 WHERE id = $2',
      ['Aguardando Chamada', operador.id]
    );
    console.log(`✅ [OPERADOR LOGIN] Status atualizado com sucesso`);

    // Preparar dados do operador
    console.log(`📋 [OPERADOR LOGIN] Preparando dados do operador para resposta`);
    let operadorData: any = {
      id: operador.id,
      nome: operador.nome,
      email: operador.email,
      tipo: 'operador', // Todos os usuários da tabela operadores são operadores
      status: operador.status,
      status_operacional: 'Aguardando Chamada' as const,
      avatar: operador.avatar,
      data_criacao: operador.data_criacao,
      data_atualizacao: operador.data_atualizacao
    };

    // Adicionar campos de gamificação para operadores
    operadorData.nivel = operador.nivel;
    operadorData.xp_atual = operador.xp;
    operadorData.xp_proximo_nivel = operador.nivel * 100; // Calcular baseado no nível
    operadorData.pontos_totais = operador.pontos_totais;
    operadorData.tempo_online = operador.tempo_online;

    console.log(`🎉 [OPERADOR LOGIN] Login realizado com sucesso para: ${email}`);
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        operador: operadorData
      }
    });

  } catch (error: any) {
    console.error(`❌ [OPERADOR LOGIN] Erro no login do operador ${req.body?.email}:`, error);
    console.error(`❌ [OPERADOR LOGIN] Stack trace:`, error.stack);
    
    // Verificar se é erro de conexão com banco
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
      console.log(`❌ [OPERADOR LOGIN] Erro de conexão com banco de dados`);
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

// Logout do operador
export const logout = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { token } = req;

    // Desativar sessão
    await pool.execute(
      'UPDATE sessoes SET ativo = FALSE WHERE token = $1',
      [token]
    );

    // Atualizar status para offline
    await pool.execute(
      'UPDATE operadores SET status_operacional = $1 WHERE id = $2',
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
      'SELECT id, nome, email, nivel, xp, pontos_totais, status, status_operacional, avatar, tempo_online, data_criacao, data_atualizacao FROM operadores WHERE id = $1',
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
      WHERE operador_id = $1 AND concluida = FALSE 
      AND data_inicio <= CURDATE() AND data_fim >= CURDATE()
      ORDER BY data_inicio DESC
    `, [operadorId]);

    // Buscar missões ativas
    const [missoes] = await pool.execute(`
      SELECT m.*, pm.progresso_atual, pm.concluida
      FROM missoes m
      LEFT JOIN progresso_missoes pm ON m.id = pm.missao_id AND pm.operador_id = $1
      WHERE m.ativa = TRUE AND (pm.concluida = FALSE OR pm.concluida IS NULL)
      ORDER BY m.tipo, m.data_inicio
    `, [operadorId]);

    // Buscar conquistas desbloqueadas
    const [conquistas] = await pool.execute(`
      SELECT c.*, oc.data_desbloqueio
      FROM conquistas c
      INNER JOIN operador_conquistas oc ON c.id = oc.conquista_id
      WHERE oc.operador_id = $1
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
      WHERE operador_id = $1 AND DATE(inicio_chamada) = CURDATE()
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
          status_operacional: operador.status_operacional,
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
    
    // Atualizar status operacional
    await pool.execute(
      'UPDATE operadores SET status_operacional = $1 WHERE id = $2',
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
