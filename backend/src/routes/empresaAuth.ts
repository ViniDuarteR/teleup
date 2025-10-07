import express from 'express';
import { loginEmpresa } from '../controllers/empresaController';

const router = express.Router();

router.post('/login', loginEmpresa as any);

export default router;
