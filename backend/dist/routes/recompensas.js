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
exports.default = router;
//# sourceMappingURL=recompensas.js.map