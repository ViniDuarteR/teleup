"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleDisponibilidade = exports.excluirRecompensa = exports.atualizarRecompensa = exports.criarRecompensa = exports.comprarRecompensa = exports.getCompras = exports.getRecompensas = void 0;
let recompensasMock = [];
let nextId = 1;
const getRecompensas = async (req, res) => {
    try {
        return res.json({
            success: true,
            data: recompensasMock
        });
    }
    catch (error) {
        console.error('Erro ao buscar recompensas:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.getRecompensas = getRecompensas;
const getCompras = async (req, res) => {
    try {
        return res.json({
            success: true,
            data: []
        });
    }
    catch (error) {
        console.error('Erro ao buscar compras:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.getCompras = getCompras;
const comprarRecompensa = async (req, res) => {
    try {
        const { recompensa_id } = req.body;
        const operadorId = req.user?.id;
        if (!operadorId) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }
        const recompensa = recompensasMock.find(r => r.id === recompensa_id);
        if (!recompensa) {
            return res.status(404).json({
                success: false,
                message: 'Recompensa não encontrada'
            });
        }
        return res.json({
            success: true,
            message: 'Compra realizada com sucesso!',
            data: {
                compra_id: Math.floor(Math.random() * 1000),
                pontos_gastos: recompensa.preco,
                pontos_restantes: 1000 - recompensa.preco
            }
        });
    }
    catch (error) {
        console.error('Erro ao comprar recompensa:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.comprarRecompensa = comprarRecompensa;
const criarRecompensa = async (req, res) => {
    try {
        const { nome, descricao, categoria, preco, tipo, raridade, imagem, disponivel, quantidade_restante } = req.body;
        const novaRecompensa = {
            id: nextId++,
            nome,
            descricao,
            categoria,
            preco: parseInt(preco),
            tipo,
            raridade,
            imagem: imagem || null,
            disponivel: disponivel !== false,
            quantidade_restante: quantidade_restante ? parseInt(quantidade_restante) : null
        };
        recompensasMock.push(novaRecompensa);
        return res.json({
            success: true,
            message: 'Recompensa criada com sucesso!',
            data: novaRecompensa
        });
    }
    catch (error) {
        console.error('Erro ao criar recompensa:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.criarRecompensa = criarRecompensa;
const atualizarRecompensa = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, categoria, preco, tipo, raridade, imagem, disponivel, quantidade_restante } = req.body;
        const index = recompensasMock.findIndex(r => r.id === parseInt(id));
        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Recompensa não encontrada'
            });
        }
        recompensasMock[index] = {
            ...recompensasMock[index],
            nome,
            descricao,
            categoria,
            preco: parseInt(preco),
            tipo,
            raridade,
            imagem: imagem || null,
            disponivel: disponivel !== false,
            quantidade_restante: quantidade_restante ? parseInt(quantidade_restante) : null
        };
        return res.json({
            success: true,
            message: 'Recompensa atualizada com sucesso!',
            data: recompensasMock[index]
        });
    }
    catch (error) {
        console.error('Erro ao atualizar recompensa:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.atualizarRecompensa = atualizarRecompensa;
const excluirRecompensa = async (req, res) => {
    try {
        const { id } = req.params;
        const index = recompensasMock.findIndex(r => r.id === parseInt(id));
        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Recompensa não encontrada'
            });
        }
        recompensasMock.splice(index, 1);
        return res.json({
            success: true,
            message: 'Recompensa excluída com sucesso!'
        });
    }
    catch (error) {
        console.error('Erro ao excluir recompensa:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.excluirRecompensa = excluirRecompensa;
const toggleDisponibilidade = async (req, res) => {
    try {
        const { id } = req.params;
        const { disponivel } = req.body;
        const index = recompensasMock.findIndex(r => r.id === parseInt(id));
        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Recompensa não encontrada'
            });
        }
        recompensasMock[index].disponivel = disponivel;
        return res.json({
            success: true,
            message: `Recompensa ${disponivel ? 'habilitada' : 'desabilitada'} com sucesso!`,
            data: recompensasMock[index]
        });
    }
    catch (error) {
        console.error('Erro ao alterar disponibilidade:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.toggleDisponibilidade = toggleDisponibilidade;
//# sourceMappingURL=lojaController.js.map