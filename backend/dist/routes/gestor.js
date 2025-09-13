"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gestorController_1 = require("../controllers/gestorController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.use(auth_1.requireGestor);
router.get('/metricas-equipe', gestorController_1.getMetricasEquipe);
router.get('/ranking-operadores', gestorController_1.getRankingOperadores);
router.get('/desempenho-detalhado', gestorController_1.getDesempenhoDetalhado);
router.get('/operadores', gestorController_1.getOperadores);
router.post('/missoes', gestorController_1.criarMissao);
router.post('/atribuir-missao', gestorController_1.atribuirMissao);
exports.default = router;
//# sourceMappingURL=gestor.js.map