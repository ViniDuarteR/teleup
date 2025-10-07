"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removerOperador = exports.atribuirOperador = exports.getOperadoresGerenciados = exports.logoutGestor = exports.excluirGestor = exports.atualizarGestor = exports.criarGestor = exports.listarGestores = exports.loginGestor = void 0;
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
const listarGestores = async (req, res) => {
    try {
        const gestorId = req.operador.id;
        const [empresaResult] = await database_1.pool.execute('SELECT empresa_id FROM gestores WHERE id = ?', [gestorId]);
        const empresa = empresaResult;
        if (empresa.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Gestor não encontrado'
            });
            return;
        }
        const empresaId = empresa[0].empresa_id;
        const [gestores] = await database_1.pool.execute(`SELECT id, nome, email, status, avatar, data_criacao, data_atualizacao
       FROM gestores 
       WHERE empresa_id = ? 
       ORDER BY nome`, [empresaId]);
        res.json({
            success: true,
            data: gestores
        });
    }
    catch (error) {
        console.error('Erro ao listar gestores:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.listarGestores = listarGestores;
const criarGestor = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        const gestorId = req.operador.id;
        const [empresaResult] = await database_1.pool.execute('SELECT empresa_id FROM gestores WHERE id = ?', [gestorId]);
        const empresa = empresaResult;
        if (empresa.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Gestor não encontrado'
            });
            return;
        }
        const empresaId = empresa[0].empresa_id;
        const [emailExists] = await database_1.pool.execute('SELECT id FROM gestores WHERE email = ? AND empresa_id = ?', [email, empresaId]);
        if (emailExists.length > 0) {
            res.status(400).json({
                success: false,
                message: 'Email já cadastrado nesta empresa'
            });
            return;
        }
        const senhaHash = await bcryptjs_1.default.hash(senha, 10);
        const [result] = await database_1.pool.execute(`INSERT INTO gestores (nome, email, senha, status, avatar, empresa_id)
       VALUES (?, ?, ?, 'Ativo', 'avatar1.png', ?)`, [nome, email, senhaHash, empresaId]);
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
exports.criarGestor = criarGestor;
const atualizarGestor = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, status } = req.body;
        const gestorId = req.operador.id;
        const [gestorResult] = await database_1.pool.execute('SELECT empresa_id FROM gestores WHERE id = ?', [id]);
        const [currentGestorResult] = await database_1.pool.execute('SELECT empresa_id FROM gestores WHERE id = ?', [gestorId]);
        const gestor = gestorResult;
        const currentGestor = currentGestorResult;
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
        await database_1.pool.execute('UPDATE gestores SET nome = ?, email = ?, status = ? WHERE id = ?', [nome, email, status, id]);
        res.json({
            success: true,
            message: 'Gestor atualizado com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao atualizar gestor:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.atualizarGestor = atualizarGestor;
const excluirGestor = async (req, res) => {
    try {
        const { id } = req.params;
        const gestorId = req.operador.id;
        if (parseInt(id) === gestorId) {
            res.status(400).json({
                success: false,
                message: 'Não é possível excluir seu próprio usuário'
            });
            return;
        }
        const [gestorResult] = await database_1.pool.execute('SELECT empresa_id FROM gestores WHERE id = ?', [id]);
        const [currentGestorResult] = await database_1.pool.execute('SELECT empresa_id FROM gestores WHERE id = ?', [gestorId]);
        const gestor = gestorResult;
        const currentGestor = currentGestorResult;
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
        await database_1.pool.execute('DELETE FROM gestores WHERE id = ?', [id]);
        res.json({
            success: true,
            message: 'Gestor excluído com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao excluir gestor:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.excluirGestor = excluirGestor;
const logoutGestor = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
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
        const gestorId = req.operador.id;
        const [operadores] = await database_1.pool.execute(`SELECT o.id, o.nome, o.email, o.nivel, o.xp_atual, o.xp_proximo_nivel, 
              o.pontos_totais, o.status, o.avatar, o.tempo_online, o.pa, o.carteira,
              o.data_criacao, o.data_atualizacao
       FROM operadores o
       INNER JOIN operador_gestor og ON o.id = og.operador_id
       WHERE og.gestor_id = ? AND og.ativo = TRUE
       ORDER BY o.pontos_totais DESC`, [gestorId]);
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
        const { operadorId } = req.body;
        const gestorId = req.operador.id;
        const [operadorResult] = await database_1.pool.execute('SELECT id FROM operadores WHERE id = ?', [operadorId]);
        if (operadorResult.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Operador não encontrado'
            });
            return;
        }
        const [atribuicaoResult] = await database_1.pool.execute('SELECT id FROM operador_gestor WHERE operador_id = ? AND gestor_id = ? AND ativo = TRUE', [operadorId, gestorId]);
        if (atribuicaoResult.length > 0) {
            res.status(400).json({
                success: false,
                message: 'Operador já está atribuído a este gestor'
            });
            return;
        }
        await database_1.pool.execute('INSERT INTO operador_gestor (operador_id, gestor_id, data_atribuicao, ativo) VALUES (?, ?, NOW(), TRUE)', [operadorId, gestorId]);
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
        const { operadorId } = req.body;
        const gestorId = req.operador.id;
        await database_1.pool.execute('UPDATE operador_gestor SET ativo = FALSE WHERE operador_id = ? AND gestor_id = ?', [operadorId, gestorId]);
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