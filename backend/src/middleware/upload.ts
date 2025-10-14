import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      // Usar diretório temporário para produção (Vercel)
      const isProduction = process.env.NODE_ENV === 'production';
      const uploadDir = isProduction 
        ? '/tmp' 
        : path.join(__dirname, '../../uploads/recompensas');
      
      console.log('🔍 [UPLOAD] Ambiente:', process.env.NODE_ENV);
      console.log('🔍 [UPLOAD] Tentando salvar em:', uploadDir);
      
      // Criar diretório se não existir (apenas em desenvolvimento)
      if (!isProduction && !fs.existsSync(uploadDir)) {
        console.log('🔧 [UPLOAD] Criando diretório:', uploadDir);
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    } catch (error) {
      console.error('❌ [UPLOAD] Erro ao configurar destino:', error);
      // Sempre usar /tmp como fallback
      cb(null, '/tmp');
    }
  },
  filename: (req, file, cb) => {
    try {
      // Gerar nome único para o arquivo
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname) || '.jpg';
      const filename = `imagem-${uniqueSuffix}${extension}`;
      console.log('🔍 [UPLOAD] Nome do arquivo gerado:', filename);
      cb(null, filename);
    } catch (error) {
      console.error('❌ [UPLOAD] Erro ao gerar nome do arquivo:', error);
      cb(error as Error, '');
    }
  }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  console.log('🔍 [UPLOAD] Verificando arquivo:', file.originalname, 'MIME:', file.mimetype);
  if (file.mimetype.startsWith('image/')) {
    console.log('✅ [UPLOAD] Arquivo aceito');
    cb(null, true);
  } else {
    console.log('❌ [UPLOAD] Arquivo rejeitado - não é imagem');
    cb(new Error('Apenas arquivos de imagem são permitidos!'));
  }
};

// Configuração do multer
export const uploadImagem = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

// Middleware para criar diretório se não existir
export const createUploadDir = () => {
  const fs = require('fs');
  const path = require('path');
  const uploadDir = path.join(__dirname, '../../uploads/recompensas');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};
