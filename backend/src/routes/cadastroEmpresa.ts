import express from 'express';
import { cadastrarEmpresa } from '../controllers/empresaController';

const router = express.Router();

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Rota de cadastro funcionando', timestamp: new Date().toISOString() });
});

// Rota de teste POST
router.post('/test', (req, res) => {
  res.json({ success: true, message: 'POST funcionando', data: req.body });
});

// Rota pública para cadastro de empresas
router.post('/', cadastrarEmpresa as any);

export default router;
