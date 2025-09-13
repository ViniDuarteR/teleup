"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const operadorController_1 = require("../controllers/operadorController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get('/dashboard', operadorController_1.getDashboard);
router.put('/status', auth_1.requireOnline, operadorController_1.updateStatus);
router.get('/ranking', operadorController_1.getRanking);
exports.default = router;
//# sourceMappingURL=operador.js.map