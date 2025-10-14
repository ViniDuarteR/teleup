import express from 'express';
import { authenticateToken, requireGestor } from '../middleware/auth';
import { pool } from '../config/database';
import { AuthRequest } from '../types';

const router = express.Router();

// Todas as rotas precisam de autenticação e nível de gestor
router.use(authenticateToken as any);
router.use(requireGestor as any);

// Rota para métricas da equipe
router.get('/metricas-equipe', async (req: AuthRequest, res) => {
  try {
    const gestorId = req.operador?.id;
    
    if (!gestorId) {
      return res.status(401).json({ success: false, message: 'Gestor não autenticado' });
    }

    // Buscar empresa do gestor
    const [gestorEmpresa] = await pool.execute(
      'SELECT empresa_id FROM gestores WHERE id = $1',
      [gestorId]
    );
    
    const empresa = gestorEmpresa as any[];
    if (empresa.length === 0) {
      return res.status(404).json({ success: false, message: 'Empresa do gestor não encontrada' });
    }

    const empresaId = empresa[0].empresa_id;

    // Buscar métricas da equipe
    const [operadores] = await pool.execute(
      'SELECT COUNT(*) as total_operadores FROM operadores WHERE empresa_id = $1',
      [empresaId]
    );

    const [operadoresOnline] = await pool.execute(
      'SELECT COUNT(*) as online FROM operadores WHERE empresa_id = $1 AND status = $2',
      [empresaId, 'Online']
    );

    const [operadoresEmChamada] = await pool.execute(
      'SELECT COUNT(*) as em_chamada FROM operadores WHERE empresa_id = $1 AND status = $2',
      [empresaId, 'Em Chamada']
    );

    const [operadoresEmPausa] = await pool.execute(
      'SELECT COUNT(*) as em_pausa FROM operadores WHERE empresa_id = $1 AND status = $2',
      [empresaId, 'Em Pausa']
    );

    const [operadoresOffline] = await pool.execute(
      'SELECT COUNT(*) as offline FROM operadores WHERE empresa_id = $1 AND status = $2',
      [empresaId, 'Offline']
    );

    const [chamadasAtivas] = await pool.execute(
      'SELECT COUNT(*) as ativas FROM chamadas WHERE status = $1',
      ['Ativa']
    );

    const [chamadasHoje] = await pool.execute(
      'SELECT COUNT(*) as hoje FROM chamadas WHERE DATE(data_inicio) = CURRENT_DATE',
      []
    );

    const [satisfacaoMedia] = await pool.execute(
      'SELECT COALESCE(AVG(nota_satisfacao), 0) as media FROM chamadas WHERE nota_satisfacao IS NOT NULL',
      []
    );

    return res.json({
      success: true,
      data: {
        total_operadores: (operadores as any[])[0].total_operadores,
        operadores_online: (operadoresOnline as any[])[0].online,
        operadores_em_chamada: (operadoresEmChamada as any[])[0].em_chamada,
        operadores_em_pausa: (operadoresEmPausa as any[])[0].em_pausa,
        operadores_offline: (operadoresOffline as any[])[0].offline,
        chamadas_ativas: (chamadasAtivas as any[])[0].ativas,
        chamadas_hoje: (chamadasHoje as any[])[0].hoje,
        satisfacao_media_geral: parseFloat((satisfacaoMedia as any[])[0].media) || 0,
        meta_diaria_chamadas: 50, // Valor padrão
        meta_atingida: (chamadasHoje as any[])[0].hoje,
        tempo_medio_atendimento: 5.2, // Valor padrão
        taxa_resolucao: 87.5 // Valor padrão
      }
    });
  } catch (error) {
    console.error('Erro ao buscar métricas da equipe:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Rota para listar operadores
router.get('/operadores', async (req: AuthRequest, res) => {
  try {
    const gestorId = req.operador?.id;
    
    if (!gestorId) {
      return res.status(401).json({ success: false, message: 'Gestor não autenticado' });
    }

    // Buscar empresa do gestor
    const [gestorEmpresa] = await pool.execute(
      'SELECT empresa_id FROM gestores WHERE id = $1',
      [gestorId]
    );
    
    const empresa = gestorEmpresa as any[];
    if (empresa.length === 0) {
      return res.status(404).json({ success: false, message: 'Empresa do gestor não encontrada' });
    }

    const empresaId = empresa[0].empresa_id;

    // Buscar operadores da empresa com métricas
    const [operadores] = await pool.execute(
      `SELECT 
         o.id, 
         o.nome, 
         o.email, 
         o.nivel, 
         o.pontos_totais, 
         o.status, 
         o.avatar, 
         COALESCE(o.tempo_online, 0) as tempo_online_minutos,
         COALESCE(c.chamadas_hoje, 0) as chamadas_hoje,
         COALESCE(c.satisfacao_media, 0) as satisfacao_media
       FROM operadores o
       LEFT JOIN (
         SELECT 
           operador_id,
           COUNT(*) as chamadas_hoje,
           AVG(nota_satisfacao) as satisfacao_media
         FROM chamadas 
         WHERE DATE(data_inicio) = CURRENT_DATE
         GROUP BY operador_id
       ) c ON o.id = c.operador_id
       WHERE o.empresa_id = $1
       ORDER BY o.pontos_totais DESC`,
      [empresaId]
    );

    return res.json({
      success: true,
      data: operadores as any[]
    });
  } catch (error) {
    console.error('Erro ao buscar operadores:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Rota para criar novo operador
router.post('/operadores', async (req: AuthRequest, res) => {
  try {
    const { nome, email, senha, nivel = 1, pa = '', carteira = '' } = req.body;
    const gestorId = req.operador?.id;
    
    if (!gestorId) {
      return res.status(401).json({ success: false, message: 'Gestor não autenticado' });
    }

    if (!nome || !email || !senha) {
      return res.status(400).json({ success: false, message: 'Nome, email e senha são obrigatórios' });
    }

    // Buscar empresa do gestor
    const [gestorEmpresa] = await pool.execute(
      'SELECT empresa_id FROM gestores WHERE id = $1',
      [gestorId]
    );
    
    const empresa = gestorEmpresa as any[];
    if (empresa.length === 0) {
      return res.status(404).json({ success: false, message: 'Empresa do gestor não encontrada' });
    }

    const empresaId = empresa[0].empresa_id;

    // Verificar se email já existe
    const [emailExists] = await pool.execute(
      'SELECT id FROM operadores WHERE email = $1 AND empresa_id = $2',
      [email, empresaId]
    );

    if ((emailExists as any[]).length > 0) {
      return res.status(400).json({ success: false, message: 'Email já cadastrado nesta empresa' });
    }

    // Hash da senha
    const bcrypt = require('bcryptjs');
    const senhaHash = await bcrypt.hash(senha, 10);

    // Calcular XP necessário para o próximo nível
    const xpProximoNivel = nivel * 100;

    // Inserir novo operador
    const [result] = await pool.execute(
      `INSERT INTO operadores (nome, email, senha, nivel, xp_atual, xp_proximo_nivel, 
                              pontos_totais, status, avatar, tempo_online, empresa_id, pa, carteira)
       VALUES ($1, $2, $3, $4, 0, $5, 0, 'Aguardando Chamada', 'avatar1.png', 0, $6, $7, $8)`,
      [nome, email, senhaHash, nivel, xpProximoNivel, empresaId, pa, carteira]
    );

    const insertResult = result as any;
    return res.status(201).json({
      success: true,
      message: 'Operador criado com sucesso',
      data: { id: insertResult.insertId }
    });
  } catch (error) {
    console.error('Erro ao criar operador:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Rota para alterar status do operador
router.patch('/operador/:id/status', async (req: AuthRequest, res) => {
  try {
    const operadorId = req.params.id;
    const { status } = req.body;
    const gestorId = req.operador?.id;
    
    if (!gestorId) {
      return res.status(401).json({ success: false, message: 'Gestor não autenticado' });
    }

    // Buscar empresa do gestor
    const [gestorEmpresa] = await pool.execute(
      'SELECT empresa_id FROM gestores WHERE id = $1',
      [gestorId]
    );
    
    const empresa = gestorEmpresa as any[];
    if (empresa.length === 0) {
      return res.status(404).json({ success: false, message: 'Empresa do gestor não encontrada' });
    }

    const empresaId = empresa[0].empresa_id;

    // Verificar se o operador pertence à mesma empresa
    const [operadorResult] = await pool.execute(
      'SELECT id FROM operadores WHERE id = $1 AND empresa_id = $2',
      [operadorId, empresaId]
    );

    if ((operadorResult as any[]).length === 0) {
      return res.status(404).json({ success: false, message: 'Operador não encontrado' });
    }

    // Atualizar status do operador
    await pool.execute(
      'UPDATE operadores SET status = $1 WHERE id = $2',
      [status, operadorId]
    );

    return res.json({
      success: true,
      message: 'Status do operador atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar status do operador:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

export default router;
