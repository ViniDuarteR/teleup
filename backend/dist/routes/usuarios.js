"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usuarioController_1 = require("../controllers/usuarioController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get('/', usuarioController_1.listarUsuarios);
router.post('/', usuarioController_1.criarUsuario);
router.put('/:id', usuarioController_1.atualizarUsuario);
router.delete('/:id', usuarioController_1.excluirUsuario);
router.put('/:id/redefinir-senha', usuarioController_1.redefinirSenha);
exports.default = router;
//# sourceMappingURL=usuarios.js.map