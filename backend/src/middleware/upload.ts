import multer from 'multer';
import path from 'path';

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/recompensas');
    // Criar diretório se não existir
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
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
