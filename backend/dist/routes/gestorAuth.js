"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gestorController_1 = require("../controllers/gestorController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/login', gestorController_1.loginGestor);
router.post('/logout', auth_1.authenticateToken, gestorController_1.logoutGestor);
router.get('/operadores', auth_1.authenticateToken, gestorController_1.getOperadoresGerenciados);
router.post('/operadores/atribuir', auth_1.authenticateToken, gestorController_1.atribuirOperador);
router.post('/operadores/remover', auth_1.authenticateToken, gestorController_1.removerOperador);
exports.default = router;
//# sourceMappingURL=gestorAuth.js.map