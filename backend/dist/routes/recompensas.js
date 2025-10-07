"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const lojaController_1 = require("../controllers/lojaController");
const router = express_1.default.Router();
router.get('/', lojaController_1.getRecompensas);
router.use(auth_1.authenticateToken);
router.get('/compras', lojaController_1.getCompras);
router.post('/comprar', lojaController_1.comprarRecompensa);
router.post('/', (req, res, next) => {
    if (req.user?.tipo !== 'gestor') {
        return res.status(403).json({
            success: false,
            message: 'Acesso negado. Apenas gestores podem criar recompensas.'
        });
    }
    return next();
}, lojaController_1.criarRecompensa);
router.put('/:id', (req, res, next) => {
    if (req.user?.tipo !== 'gestor') {
        return res.status(403).json({
            success: false,
            message: 'Acesso negado. Apenas gestores podem editar recompensas.'
        });
    }
    return next();
}, lojaController_1.atualizarRecompensa);
router.delete('/:id', (req, res, next) => {
    if (req.user?.tipo !== 'gestor') {
        return res.status(403).json({
            success: false,
            message: 'Acesso negado. Apenas gestores podem excluir recompensas.'
        });
    }
    return next();
}, lojaController_1.excluirRecompensa);
router.patch('/:id/toggle', (req, res, next) => {
    if (req.user?.tipo !== 'gestor') {
        return res.status(403).json({
            success: false,
            message: 'Acesso negado. Apenas gestores podem alterar disponibilidade.'
        });
    }
    return next();
}, lojaController_1.toggleDisponibilidade);
exports.default = router;
//# sourceMappingURL=recompensas.js.map