# Migração para MongoDB - Backend TeleUp

Este documento descreve as mudanças realizadas na migração de PostgreSQL para MongoDB.

## ✅ Mudanças Realizadas

### 1. Dependências
- ❌ Removido: `pg` (PostgreSQL driver)
- ❌ Removido: `@types/pg`
- ✅ Adicionado: `mongoose` (MongoDB ODM)

### 2. Estrutura de Dados

#### Schemas Mongoose Criados:
- `Empresa` - Empresas do sistema
- `Gestor` - Gestores das empresas
- `Operador` - Operadores de call center
- `Sessao` - Sessões de autenticação
- `Chamada` - Chamadas atendidas
- `Recompensa` - Recompensas disponíveis
- `Meta` - Metas dos operadores
- `ProgressoMeta` - Progresso das metas

### 3. Configuração do Banco

**Arquivo:** `backend/src/config/database.ts`
- Substituído pool de conexões PostgreSQL por conexão Mongoose
- Função `connectDatabase()` para conectar ao MongoDB
- Função `testConnection()` atualizada para MongoDB

### 4. Controllers Atualizados

- ✅ `operadorController.ts` - Convertido para usar Mongoose
- ✅ `chamadaController.ts` - Convertido para usar Mongoose
- ✅ `empresaController.ts` - Convertido para usar Mongoose
- ✅ `gestorController.ts` - Convertido para usar Mongoose
- ✅ `gamificacaoController.ts` - Convertido para usar Mongoose
- ✅ `metaController.ts` - Convertido para usar Mongoose
- ✅ `recompensaController.ts` - Convertido para usar Mongoose
- ✅ `usuarioController.ts` - Convertido para usar Mongoose

### 5. Middleware de Autenticação

**Arquivo:** `backend/src/middleware/auth.ts`
- Atualizado para buscar usuários no MongoDB
- Usa `Gestor.findById()` e `Operador.findById()`

### 6. Tipos TypeScript

**Arquivo:** `backend/src/types/index.ts`
- Todos os IDs convertidos de `number` para `string` (ObjectId)
- Interfaces atualizadas para refletir estrutura MongoDB

### 7. Scripts de Inicialização

**Arquivo:** `backend/scripts/init-database.js`
- Reescrito para usar Mongoose
- Cria dados iniciais (empresas, gestores, operadores, recompensas)

## 📝 Variáveis de Ambiente

### Antes (PostgreSQL):
```env
DATABASE_URL=postgresql://user:password@host:port/database
```

### Agora (MongoDB):
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/teleup?retryWrites=true&w=majority
# ou
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/teleup
```

## ✅ Migração Completa

Todos os controllers, middlewares e rotas foram atualizados para usar MongoDB/Mongoose.

### Arquivos Atualizados:
- ✅ Todos os controllers (`operadorController`, `chamadaController`, `empresaController`, `gestorController`, `gamificacaoController`, `metaController`, `recompensaController`, `usuarioController`)
- ✅ Middlewares (`auth.ts`, `empresaAuth.ts`)
- ✅ Rotas (`gestor.ts`)
- ✅ Scripts (`init-database.js`, `create-user-endpoint.ts`)
- ✅ Configuração do banco (`database.ts`)

## 🔄 Próximos Passos

1. **Testes:**
   - Testar todas as rotas da API
   - Verificar autenticação e autorização
   - Validar operações CRUD

2. **Migração de Dados (se necessário):**
   - Se houver dados em PostgreSQL, criar script de migração
   - Validar integridade dos dados migrados

3. **Otimizações:**
   - Adicionar índices adicionais conforme necessário
   - Otimizar queries complexas com agregações do MongoDB

## ⚠️ Observações Importantes

1. **IDs são agora strings (ObjectId):**
   - Todos os IDs que eram números agora são strings
   - Use `new mongoose.Types.ObjectId(id)` para converter

2. **Relacionamentos:**
   - Use `ref` nos schemas para referências
   - Use `.populate()` para buscar dados relacionados

3. **Queries:**
   - Substituir SQL por métodos Mongoose
   - Usar agregações do MongoDB para queries complexas

4. **Índices:**
   - Índices definidos nos schemas Mongoose
   - MongoDB cria índices automaticamente

## 📚 Recursos

- [Documentação Mongoose](https://mongoosejs.com/docs/)
- [MongoDB University](https://university.mongodb.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

