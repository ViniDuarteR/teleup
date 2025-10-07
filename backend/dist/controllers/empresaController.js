"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardEmpresa = exports.listarOperadoresEmpresa = exports.criarGestorEmpresa = exports.listarGestoresEmpresa = exports.loginEmpresa = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const loginEmpresa = async (req, res) => {
    try {
        const { email, senha } = req.body;
        if (!email || !senha) {
            res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
            return;
        }
        const [empresas] = await database_1.pool.execute('SELECT id, nome, email, senha, status FROM empresas WHERE email = ? AND status = "Ativo"', [email]);
        const empresa = empresas[0];
        if (!empresa) {
            res.status(401).json({
                success: false,
                message: 'Empresa não encontrada ou inativa'
            });
            return;
        }
        const senhaValida = await bcryptjs_1.default.compare(senha, empresa.senha);
        if (!senhaValida) {
            res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            empresaId: empresa.id,
            tipo: 'empresa',
            email: empresa.email
        }, process.env.JWT_SECRET || 'teleup_secret', { expiresIn: '24h' });
        const expiracao = new Date();
        expiracao.setHours(expiracao.getHours() + 24);
        await database_1.pool.execute('INSERT INTO sessoes_empresa (empresa_id, token, expiracao) VALUES (?, ?, ?)', [empresa.id, token, expiracao]);
        await database_1.pool.execute('UPDATE empresas SET data_ultimo_login = NOW() WHERE id = ?', [empresa.id]);
        const empresaData = {
            id: empresa.id,
            nome: empresa.nome,
            email: empresa.email,
            status: empresa.status
        };
        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            data: {
                token,
                empresa: empresaData
            }
        });
    }
    catch (error) {
        console.error('Erro no login da empresa:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.loginEmpresa = loginEmpresa;
const listarGestoresEmpresa = async (req, res) => {
    try {
        const empresaId = req.empresa?.id;
        if (!empresaId) {
            res.status(401).json({
                success: false,
                message: 'Empresa não autenticada'
            });
            return;
        }
        const [gestores] = await database_1.pool.execute('SELECT id, nome, email, status, avatar, data_criacao, data_atualizacao FROM gestores WHERE empresa_id = ?', [empresaId]);
        res.json({
            success: true,
            data: gestores
        });
    }
    catch (error) {
        console.error('Erro ao listar gestores da empresa:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.listarGestoresEmpresa = listarGestoresEmpresa;
const criarGestorEmpresa = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        const empresaId = req.empresa?.id;
        if (!empresaId) {
            res.status(401).json({
                success: false,
                message: 'Empresa não autenticada'
            });
            return;
        }
        const [emailExists] = await database_1.pool.execute('SELECT id FROM gestores WHERE email = ?', [email]);
        if (emailExists.length > 0) {
            res.status(400).json({
                success: false,
                message: 'Email já cadastrado'
            });
            return;
        }
        const senhaHash = await bcryptjs_1.default.hash(senha, 10);
        const [result] = await database_1.pool.execute('INSERT INTO gestores (nome, email, senha, status, avatar, empresa_id) VALUES (?, ?, ?, "Ativo", "avatar_gestor.png", ?)', [nome, email, senhaHash, empresaId]);
        const insertResult = result;
        res.status(201).json({
            success: true,
            message: 'Gestor criado com sucesso',
            data: { id: insertResult.insertId }
        });
    }
    catch (error) {
        console.error('Erro ao criar gestor:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.criarGestorEmpresa = criarGestorEmpresa;
const listarOperadoresEmpresa = async (req, res) => {
    try {
        const empresaId = req.empresa?.id;
        if (!empresaId) {
            res.status(401).json({
                success: false,
                message: 'Empresa não autenticada'
            });
            return;
        }
        const [operadores] = await database_1.pool.execute(`SELECT o.id, o.nome, o.email, o.nivel, o.xp_atual, o.xp_proximo_nivel, o.pontos_totais, 
              o.status, o.avatar, o.tempo_online, o.pa, o.carteira, o.data_criacao,
              g.nome as gestor_nome, g.email as gestor_email
       FROM operadores o
       LEFT JOIN operador_gestor og ON o.id = og.operador_id
       LEFT JOIN gestores g ON og.gestor_id = g.id
       WHERE o.empresa_id = ?
       ORDER BY o.pontos_totais DESC`, [empresaId]);
        res.json({
            success: true,
            data: operadores
        });
    }
    catch (error) {
        console.error('Erro ao listar operadores da empresa:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.listarOperadoresEmpresa = listarOperadoresEmpresa;
const getDashboardEmpresa = async (req, res) => {
    try {
        const empresaId = req.empresa?.id;
        if (!empresaId) {
            res.status(401).json({
                success: false,
                message: 'Empresa não autenticada'
            });
            return;
        }
        const [totalGestores] = await database_1.pool.execute('SELECT COUNT(*) as total FROM gestores WHERE empresa_id = ?', [empresaId]);
        const [totalOperadores] = await database_1.pool.execute('SELECT COUNT(*) as total FROM operadores WHERE empresa_id = ?', [empresaId]);
        const [operadoresAtivos] = await database_1.pool.execute('SELECT COUNT(*) as total FROM operadores WHERE empresa_id = ? AND status IN ("Dispon??vel", "Em Chamada")', [empresaId]);
        const [totalPontos] = await database_1.pool.execute('SELECT COALESCE(SUM(pontos_totais), 0) as total FROM operadores WHERE empresa_id = ?', [empresaId]);
        res.json({
            success: true,
            data: {
                totalGestores: totalGestores[0].total,
                totalOperadores: totalOperadores[0].total,
                operadoresAtivos: operadoresAtivos[0].total,
                totalPontos: totalPontos[0].total
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar dashboard da empresa:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.getDashboardEmpresa = getDashboardEmpresa;
//# sourceMappingURL=empresaController.js.map