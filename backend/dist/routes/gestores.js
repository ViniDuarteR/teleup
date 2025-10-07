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
router.get('/', gestorController_1.listarGestores);
router.post('/', gestorController_1.criarGestor);
router.put('/:id', gestorController_1.atualizarGestor);
router.delete('/:id', gestorController_1.excluirGestor);
exports.default = router;
//# sourceMappingURL=gestores.js.map