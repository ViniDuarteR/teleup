"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const empresaController_1 = require("../controllers/empresaController");
const empresaAuth_1 = require("../middleware/empresaAuth");
const router = express_1.default.Router();
router.use(empresaAuth_1.authenticateEmpresa);
router.use(empresaAuth_1.requireEmpresa);
router.get('/dashboard', empresaController_1.getDashboardEmpresa);
router.get('/gestores', empresaController_1.listarGestoresEmpresa);
router.post('/gestores', empresaController_1.criarGestorEmpresa);
router.put('/gestores/:id', empresaController_1.atualizarGestorEmpresa);
router.delete('/gestores/:id', empresaController_1.excluirGestorEmpresa);
router.get('/operadores', empresaController_1.listarOperadoresEmpresa);
exports.default = router;
//# sourceMappingURL=empresas.js.map