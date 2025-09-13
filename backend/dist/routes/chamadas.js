"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chamadaController_1 = require("../controllers/chamadaController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.post('/iniciar', auth_1.requireOnline, chamadaController_1.iniciarChamada);
router.post('/finalizar', auth_1.requireOnline, chamadaController_1.finalizarChamada);
router.get('/historico', chamadaController_1.getHistorico);
router.get('/estatisticas', chamadaController_1.getEstatisticas);
exports.default = router;
//# sourceMappingURL=chamadas.js.map