import express from 'express';
import { cadastrarEmpresa } from '../controllers/empresaController';

const router = express.Router();

// Rota pública para cadastro de empresas
router.post('/', cadastrarEmpresa as any);

export default router;
