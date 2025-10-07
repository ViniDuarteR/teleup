-- Adicionar campo tipo na tabela operadores
ALTER TABLE operadores 
ADD COLUMN tipo ENUM('operador', 'gestor') DEFAULT 'operador';

-- Atualizar o usuário hyttalo para ser gestor
UPDATE operadores 
SET tipo = 'gestor' 
WHERE email = 'hyttalo@teleup.com';

-- Verificar se o usuário foi atualizado
SELECT id, nome, email, tipo FROM operadores WHERE email = 'hyttalo@teleup.com';
