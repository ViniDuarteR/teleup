import { Router, Request, Response } from 'express';
import { createUserHandler } from '../scripts/create-user-endpoint';

const router = Router();

// Endpoint temporário para criar usuário em produção
router.post('/create-user', async (req: Request, res: Response) => {
  try {
    console.log('🔧 Executando criação de usuário...');
    const result = await createUserHandler();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Usuário criado com sucesso',
        credentials: result.credentials
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro ao criar usuário',
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Erro no endpoint de criação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

export default router;
