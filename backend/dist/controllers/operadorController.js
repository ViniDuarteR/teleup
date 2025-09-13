"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRanking = exports.updateStatus = exports.getDashboard = exports.logout = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const login = async (req, res) => {
    try {
        const { email, senha } = req.body;
        if (!email || !senha) {
            res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
            return;
        }
        const [operadores] = await database_1.pool.execute('SELECT * FROM operadores WHERE email = ?', [email]);
        if (operadores.length === 0) {
            res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
            return;
        }
        const operador = operadores[0];
        const senhaValida = await bcryptjs_1.default.compare(senha, operador.senha);
        if (!senhaValida) {
            res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ operadorId: operador.id, email: operador.email }, process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro_aqui', { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
        const dataExpiracao = new Date();
        dataExpiracao.setHours(dataExpiracao.getHours() + 24);
        await database_1.pool.execute('INSERT INTO sessoes (operador_id, token, expiracao) VALUES (?, ?, ?)', [operador.id, token, dataExpiracao]);
        await database_1.pool.execute('UPDATE operadores SET status = ? WHERE id = ?', ['Aguardando Chamada', operador.id]);
        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            data: {
                token,
                operador: {
                    id: operador.id,
                    nome: operador.nome,
                    email: operador.email,
                    nivel: operador.nivel,
                    xp_atual: operador.xp_atual,
                    xp_proximo_nivel: operador.xp_proximo_nivel,
                    pontos_totais: operador.pontos_totais,
                    status: 'Aguardando Chamada',
                    avatar: operador.avatar,
                    tempo_online: operador.tempo_online,
                    data_criacao: operador.data_criacao,
                    data_atualizacao: operador.data_atualizacao
                }
            }
        });
    }
    catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        const { token } = req;
        await database_1.pool.execute('UPDATE sessoes SET ativo = FALSE WHERE token = ?', [token]);
        await database_1.pool.execute('UPDATE operadores SET status = ? WHERE id = ?', ['Offline', req.operador.id]);
        res.json({
            success: true,
            message: 'Logout realizado com sucesso'
        });
    }
    catch (error) {
        console.error('Erro no logout:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.logout = logout;
const getDashboard = async (req, res) => {
    try {
        const operadorId = req.operador.id;
        const [operadores] = await database_1.pool.execute('SELECT * FROM operadores WHERE id = ?', [operadorId]);
        if (operadores.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Operador não encontrado'
            });
            return;
        }
        const operador = operadores[0];
        const [metas] = await database_1.pool.execute(`
      SELECT * FROM metas 
      WHERE operador_id = ? AND concluida = FALSE 
      AND data_inicio <= CURDATE() AND data_fim >= CURDATE()
      ORDER BY data_inicio DESC
    `, [operadorId]);
        const [missoes] = await database_1.pool.execute(`
      SELECT m.*, om.progresso_atual, om.concluida
      FROM missoes m
      LEFT JOIN operador_missoes om ON m.id = om.missao_id AND om.operador_id = ?
      WHERE m.ativa = TRUE AND (om.concluida = FALSE OR om.concluida IS NULL)
      ORDER BY m.tipo, m.data_criacao
    `, [operadorId]);
        const [conquistas] = await database_1.pool.execute(`
      SELECT c.*, oc.data_desbloqueio
      FROM conquistas c
      INNER JOIN operador_conquistas oc ON c.id = oc.conquista_id
      WHERE oc.operador_id = ?
      ORDER BY oc.data_desbloqueio DESC
      LIMIT 5
    `, [operadorId]);
        const [statsHoje] = await database_1.pool.execute(`
      SELECT 
        COUNT(*) as chamadas_hoje,
        COALESCE(SUM(duracao_segundos), 0) as tempo_total_segundos,
        COALESCE(AVG(satisfacao_cliente), 0) as satisfacao_media,
        COALESCE(SUM(CASE WHEN resolvida = TRUE THEN 1 ELSE 0 END), 0) as resolucoes
      FROM chamadas 
      WHERE operador_id = ? AND DATE(inicio_chamada) = CURDATE()
    `, [operadorId]);
        const estatisticas = statsHoje[0];
        res.json({
            success: true,
            data: {
                operador: {
                    id: operador.id,
                    nome: operador.nome,
                    email: operador.email,
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
                metas: metas,
                missoes: missoes.map(m => ({
                    ...m,
                    progresso_atual: m.progresso_atual || 0,
                    concluida: m.concluida || false
                })),
                conquistas: conquistas.map(c => ({
                    ...c,
                    desbloqueada: true
                })),
                estatisticas: {
                    chamadas_hoje: estatisticas.chamadas_hoje,
                    tempo_total: Math.floor(estatisticas.tempo_total_segundos / 60),
                    satisfacao_media: Math.round(estatisticas.satisfacao_media * 10) / 10,
                    resolucoes: estatisticas.resolucoes
                }
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.getDashboard = getDashboard;
const updateStatus = async (req, res) => {
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
        await database_1.pool.execute('UPDATE operadores SET status = ? WHERE id = ?', [status, req.operador.id]);
        res.json({
            success: true,
            message: 'Status atualizado com sucesso',
            data: { status }
        });
    }
    catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.updateStatus = updateStatus;
const getRanking = async (req, res) => {
    try {
        const { periodo = 'semana' } = req.query;
        let campoPontos = 'pontos_semana';
        if (periodo === 'mes') {
            campoPontos = 'pontos_mes';
        }
        const [ranking] = await database_1.pool.execute(`
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
                ranking: ranking,
                periodo: periodo
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar ranking:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.getRanking = getRanking;
//# sourceMappingURL=operadorController.js.map