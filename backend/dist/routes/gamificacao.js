"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gamificacaoController_1 = require("../controllers/gamificacaoController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get('/missoes', gamificacaoController_1.getMissoes);
router.get('/conquistas', gamificacaoController_1.getConquistas);
router.post('/verificar-conquistas', gamificacaoController_1.verificarConquistas);
router.get('/ranking', gamificacaoController_1.getRankingGeral);
router.get('/estatisticas', gamificacaoController_1.getEstatisticasGamificacao);
exports.default = router;
//# sourceMappingURL=gamificacao.js.map