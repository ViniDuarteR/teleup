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
      'SELECT empresa_id FROM gestores WHERE id = ?',
      [gestorId]
    );
    
    const empresa = gestorEmpresa as any[];
    if (empresa.length === 0) {
      return res.status(404).json({ success: false, message: 'Empresa do gestor não encontrada' });
    }

    const empresaId = empresa[0].empresa_id;

    // Buscar métricas da equipe
    const [operadores] = await pool.execute(
      'SELECT COUNT(*) as total_operadores FROM operadores WHERE empresa_id = ?',
      [empresaId]
    );

    const [operadoresAtivos] = await pool.execute(
      'SELECT COUNT(*) as ativos FROM operadores WHERE empresa_id = ? AND status IN ("Dispon??vel", "Em Chamada")',
      [empresaId]
    );

    const [totalPontos] = await pool.execute(
      'SELECT COALESCE(SUM(pontos_totais), 0) as total FROM operadores WHERE empresa_id = ?',
      [empresaId]
    );

    return res.json({
      success: true,
      data: {
        totalOperadores: (operadores as any[])[0].total_operadores,
        operadoresAtivos: (operadoresAtivos as any[])[0].ativos,
        totalPontos: (totalPontos as any[])[0].total,
        eficiencia: 85.5,
        satisfacaoMedia: 4.7
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
      'SELECT empresa_id FROM gestores WHERE id = ?',
      [gestorId]
    );
    
    const empresa = gestorEmpresa as any[];
    if (empresa.length === 0) {
      return res.status(404).json({ success: false, message: 'Empresa do gestor não encontrada' });
    }

    const empresaId = empresa[0].empresa_id;

    // Buscar operadores da empresa
    const [operadores] = await pool.execute(
      `SELECT id, nome, email, nivel, xp_atual, xp_proximo_nivel, pontos_totais, 
              status, avatar, tempo_online, pa, carteira, data_criacao
       FROM operadores 
       WHERE empresa_id = ?
       ORDER BY pontos_totais DESC`,
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

// Rota temporária para teste
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Gestor route working' });
});

export default router;
