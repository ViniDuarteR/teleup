"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removerOperador = exports.atribuirOperador = exports.getOperadoresGerenciados = exports.logoutGestor = exports.loginGestor = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const loginGestor = async (req, res) => {
    try {
        const { email, senha } = req.body;
        if (!email || !senha) {
            res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
            return;
        }
        const [gestores] = await database_1.pool.execute('SELECT * FROM gestores WHERE email = ? AND status = "Ativo"', [email]);
        if (gestores.length === 0) {
            res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
            return;
        }
        const gestor = gestores[0];
        const senhaValida = await bcryptjs_1.default.compare(senha, gestor.senha);
        if (!senhaValida) {
            res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ gestorId: gestor.id, email: gestor.email, tipo: 'gestor' }, process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro_aqui', { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
        const dataExpiracao = new Date();
        dataExpiracao.setHours(dataExpiracao.getHours() + 24);
        await database_1.pool.execute('INSERT INTO sessoes (operador_id, token, expiracao) VALUES (?, ?, ?)', [gestor.id, token, dataExpiracao]);
        const gestorData = {
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
    }
    catch (error) {
        console.error('Erro no login do gestor:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.loginGestor = loginGestor;
const logoutGestor = async (req, res) => {
    try {
        const token = req.token;
        if (token) {
            await database_1.pool.execute('UPDATE sessoes SET ativo = FALSE WHERE token = ?', [token]);
        }
        res.json({
            success: true,
            message: 'Logout realizado com sucesso'
        });
    }
    catch (error) {
        console.error('Erro no logout do gestor:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.logoutGestor = logoutGestor;
const getOperadoresGerenciados = async (req, res) => {
    try {
        const gestorId = req.user?.id;
        const [operadores] = await database_1.pool.execute(`
      SELECT 
        o.id, o.nome, o.email, o.nivel, o.xp_atual, o.xp_proximo_nivel, 
        o.pontos_totais, o.status, o.avatar, o.tempo_online,
        og.data_atribuicao
      FROM operadores o
      INNER JOIN operador_gestor og ON o.id = og.operador_id
      WHERE og.gestor_id = ? AND og.ativo = TRUE
      ORDER BY o.nome
    `, [gestorId]);
        res.json({
            success: true,
            data: operadores
        });
    }
    catch (error) {
        console.error('Erro ao buscar operadores gerenciados:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.getOperadoresGerenciados = getOperadoresGerenciados;
const atribuirOperador = async (req, res) => {
    try {
        const { operador_id } = req.body;
        const gestorId = req.user?.id;
        if (!operador_id) {
            res.status(400).json({
                success: false,
                message: 'ID do operador é obrigatório'
            });
            return;
        }
        const [operadores] = await database_1.pool.execute('SELECT id FROM operadores WHERE id = ?', [operador_id]);
        if (operadores.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Operador não encontrado'
            });
            return;
        }
        await database_1.pool.execute(`
      INSERT INTO operador_gestor (operador_id, gestor_id, ativo)
      VALUES (?, ?, TRUE)
      ON DUPLICATE KEY UPDATE ativo = TRUE, data_atribuicao = CURRENT_TIMESTAMP
    `, [operador_id, gestorId]);
        res.json({
            success: true,
            message: 'Operador atribuído com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao atribuir operador:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.atribuirOperador = atribuirOperador;
const removerOperador = async (req, res) => {
    try {
        const { operador_id } = req.body;
        const gestorId = req.user?.id;
        if (!operador_id) {
            res.status(400).json({
                success: false,
                message: 'ID do operador é obrigatório'
            });
            return;
        }
        await database_1.pool.execute('UPDATE operador_gestor SET ativo = FALSE WHERE operador_id = ? AND gestor_id = ?', [operador_id, gestorId]);
        res.json({
            success: true,
            message: 'Operador removido com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao remover operador:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.removerOperador = removerOperador;
//# sourceMappingURL=gestorController.js.map