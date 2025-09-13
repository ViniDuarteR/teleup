"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const operadorController_1 = require("../controllers/operadorController");
const router = express_1.default.Router();
router.post('/login', operadorController_1.login);
router.post('/logout', operadorController_1.logout);
exports.default = router;
//# sourceMappingURL=auth.js.map