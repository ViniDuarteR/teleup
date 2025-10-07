"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const database_1 = require("../config/database");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.use(auth_1.requireGestor);
router.get('/metricas-equipe', async (req, res) => {
    try {
        const gestorId = req.operador?.id;
        if (!gestorId) {
            return res.status(401).json({ success: false, message: 'Gestor não autenticado' });
        }
        const [gestorEmpresa] = await database_1.pool.execute('SELECT empresa_id FROM gestores WHERE id = ?', [gestorId]);
        const empresa = gestorEmpresa;
        if (empresa.length === 0) {
            return res.status(404).json({ success: false, message: 'Empresa do gestor não encontrada' });
        }
        const empresaId = empresa[0].empresa_id;
        const [operadores] = await database_1.pool.execute('SELECT COUNT(*) as total_operadores FROM operadores WHERE empresa_id = ?', [empresaId]);
        const [operadoresAtivos] = await database_1.pool.execute('SELECT COUNT(*) as ativos FROM operadores WHERE empresa_id = ? AND status IN ("Dispon??vel", "Em Chamada")', [empresaId]);
        const [totalPontos] = await database_1.pool.execute('SELECT COALESCE(SUM(pontos_totais), 0) as total FROM operadores WHERE empresa_id = ?', [empresaId]);
        return res.json({
            success: true,
            data: {
                totalOperadores: operadores[0].total_operadores,
                operadoresAtivos: operadoresAtivos[0].ativos,
                totalPontos: totalPontos[0].total,
                eficiencia: 85.5,
                satisfacaoMedia: 4.7
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar métricas da equipe:', error);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});
router.get('/operadores', async (req, res) => {
    try {
        const gestorId = req.operador?.id;
        if (!gestorId) {
            return res.status(401).json({ success: false, message: 'Gestor não autenticado' });
        }
        const [gestorEmpresa] = await database_1.pool.execute('SELECT empresa_id FROM gestores WHERE id = ?', [gestorId]);
        const empresa = gestorEmpresa;
        if (empresa.length === 0) {
            return res.status(404).json({ success: false, message: 'Empresa do gestor não encontrada' });
        }
        const empresaId = empresa[0].empresa_id;
        const [operadores] = await database_1.pool.execute(`SELECT id, nome, email, nivel, xp_atual, xp_proximo_nivel, pontos_totais, 
              status, avatar, tempo_online, pa, carteira, data_criacao
       FROM operadores 
       WHERE empresa_id = ?
       ORDER BY pontos_totais DESC`, [empresaId]);
        return res.json({
            success: true,
            data: operadores
        });
    }
    catch (error) {
        console.error('Erro ao buscar operadores:', error);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Gestor route working' });
});
exports.default = router;
//# sourceMappingURL=gestor.js.map