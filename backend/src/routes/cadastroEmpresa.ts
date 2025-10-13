import express from 'express';
import { cadastrarEmpresa } from '../controllers/empresaController';

const router = express.Router();

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Rota de cadastro funcionando' });
});

// Rota pública para cadastro de empresas
router.post('/', cadastrarEmpresa as any);

export default router;
