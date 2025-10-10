# 🔐 Credenciais Padrão - TeleUp

## 👤 Usuários de Teste

Após executar o schema do banco de dados, os seguintes usuários estarão disponíveis:

### 🏢 Empresas

#### TeleUp
```
Email: contato@teleup.com
Senha: password
```

#### TechCorp
```
Email: admin@techcorp.com
Senha: password
```

### 👨‍💼 Gestores

#### TeleUp - Hyttalo Costa
```
Email: hyttalo@teleup.com
Senha: password
```

#### TechCorp - Roberto Silva
```
Email: roberto.silva@techcorp.com
Senha: password
```

### 👨‍💻 Operadores de Teste

#### Mateus Silva
```
Email: mateus@teleup.com
Senha: password
PA: PA001
Carteira: C001
Nível: 1
XP: 0
Pontos: 0
```

#### Guilherme Santos
```
Email: guilherme@teleup.com
Senha: password
PA: PA002
Carteira: C002
Nível: 1
XP: 0
Pontos: 0
```

#### Vinicius Oliveira
```
Email: vinicius@teleup.com
Senha: password
PA: PA003
Carteira: C003
Nível: 1
XP: 0
Pontos: 0
```

## 🎁 Recompensas Disponíveis

O sistema vem com as seguintes recompensas pré-configuradas:

1. **Vale Presente R$ 10** - 100 pontos
2. **Vale Presente R$ 25** - 250 pontos  
3. **Vale Presente R$ 50** - 500 pontos
4. **Dia de Folga** - 1000 pontos

## 🔄 Como Alterar Senhas

### Via SQL (Banco de Dados)
```sql
-- Gerar hash bcrypt para nova senha
-- Use um gerador online ou biblioteca bcrypt

-- Atualizar empresa
UPDATE empresas SET senha = '$2a$10$novo_hash_aqui' WHERE email = 'admin@teleup.com';

-- Atualizar gestor
UPDATE gestores SET senha = '$2a$10$novo_hash_aqui' WHERE email = 'admin@teleup.com';

-- Atualizar operador
UPDATE operadores SET senha = '$2a$10$novo_hash_aqui' WHERE email = 'operador@teleup.com';
```

### Via API (Recomendado)
```bash
# Login como empresa/gestor
curl -X POST https://seu-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@teleup.com", "senha": "password"}'

# Usar o token retornado para alterar senhas via endpoints da API
```

## 🔒 Segurança

⚠️ **IMPORTANTE**: Altere as senhas padrão em produção!

- As senhas estão hashadas com bcrypt
- Use senhas fortes em produção
- Configure JWT_SECRET único
- Ative HTTPS em produção

## 📝 Notas

- Todos os usuários têm senha padrão: `password`
- Os hashes bcrypt são válidos para a senha `password`
- Para gerar novos hashes, use: `bcrypt.hash('nova_senha', 10)`
- O sistema suporta múltiplas empresas e gestores
