import express from 'express';
import { cadastrarEmpresa } from '../controllers/empresaController';

const router = express.Router();

// Rota de teste simples
router.get('/test', (req, res) => {
  console.log('🧪 [CADASTRO TEST] Rota de teste acessada');
  res.json({ success: true, message: 'Rota de cadastro funcionando sem autenticação', timestamp: new Date().toISOString() });
});

// Rota pública para cadastro de empresas
router.post('/', cadastrarEmpresa as any);

export default router;
