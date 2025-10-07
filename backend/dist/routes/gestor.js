"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.use(auth_1.requireGestor);
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Gestor route working' });
});
exports.default = router;
//# sourceMappingURL=gestor.js.map