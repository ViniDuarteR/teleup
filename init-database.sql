-- Script de inicialização do banco de dados TeleUp
-- Este script é executado automaticamente pelo container MySQL

-- Criar banco de dados se não existir
CREATE DATABASE IF NOT EXISTS teleup_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar o banco de dados
USE teleup_db;

-- Executar scripts na ordem correta
SOURCE /docker-entrypoint-initdb.d/schema.sql;
SOURCE /docker-entrypoint-initdb.d/migration-gestores-separados.sql;
SOURCE /docker-entrypoint-initdb.d/company-login-structure.sql;

-- Inserir dados de teste (opcional)
SOURCE /docker-entrypoint-initdb.d/mock-data.sql;

-- Mostrar status
SHOW TABLES;
SELECT 'Banco de dados TeleUp inicializado com sucesso!' as Status;
