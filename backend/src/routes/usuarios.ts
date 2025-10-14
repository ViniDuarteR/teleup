import express from 'express';
import { 
  listarUsuarios, 
  criarUsuario, 
  atualizarUsuario, 
  excluirUsuario, 
  redefinirSenha 
} from '../controllers/usuarioController';
import { authenticateToken, requireGestor } from '../middleware/auth';

const router = express.Router();

// Criar novo usuário (SEM autenticação - para cadastro inicial)
router.post('/', criarUsuario as any);

// Todas as outras rotas precisam de autenticação
router.use(authenticateToken as any);

// Rotas que precisam de permissão de gestor
router.use(requireGestor as any);

// Listar usuários da empresa
router.get('/', listarUsuarios as any);

// Atualizar usuário
router.put('/:id', atualizarUsuario as any);

// Excluir usuário
router.delete('/:id', excluirUsuario as any);

// Redefinir senha
router.put('/:id/redefinir-senha', redefinirSenha as any);

export default router;
