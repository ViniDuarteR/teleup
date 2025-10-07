"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const empresaController_1 = require("../controllers/empresaController");
const router = express_1.default.Router();
router.post('/login', empresaController_1.loginEmpresa);
exports.default = router;
//# sourceMappingURL=empresaAuth.js.map