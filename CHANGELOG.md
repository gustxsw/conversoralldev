# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2025-12-16

### 🎯 NOVO RECURSO PRINCIPAL

#### UPDATE por Coluna 'codigo' (PRODUÇÃO)
- **Adicionado**: Novo modo UPDATE que usa o código da primeira coluna da planilha como WHERE condition
- **Adicionado**: Whitelist de colunas permitidas (descricao, preco_venda, preco_custo, personal1)
- **Adicionado**: Proteção automática - codigo NUNCA é atualizado
- **Adicionado**: Seletor de modo UPDATE (Sequencial vs Por Coluna 'codigo')
- **Adicionado**: Explicação visual do modo UPDATE na interface

**Arquivos modificados**: `index.html` (linhas 328-338, 882-929)

---

### 🛡️ SEGURANÇA

#### SQL Injection Protection (CRÍTICO)
- **CORRIGIDO**: Vulnerabilidade de SQL injection via identificadores (tabelas/colunas)
- **Adicionado**: Função `escapeIdentifier()` para validar e escapar identificadores
- **Adicionado**: Validação regex: `^[a-zA-Z_][a-zA-Z0-9_]*$`
- **Adicionado**: Escaping database-specific:
  - MySQL: backticks `` `identificador` ``
  - SQL Server: brackets `[identificador]`
  - PostgreSQL: double quotes `"identificador"`
  - Firebird: sem quotes
- **Adicionado**: Mensagens de erro claras para identificadores inválidos

**Exemplo vulnerável anterior**:
```javascript
// ANTES (VULNERÁVEL)
sqlScript += `INSERT INTO ${tableName} ...`;
```

**Agora protegido**:
```javascript
// DEPOIS (SEGURO)
const escapedTable = escapeIdentifier(tableName, dbType);
sqlScript += `INSERT INTO ${escapedTable} ...`;
```

**Arquivos modificados**: `index.html` (linhas 465-488, 707-723, 871-929)

**Impacto**: 🔴 CRÍTICO - Previne execução de SQL malicioso

---

### 🔍 VALIDAÇÃO

#### Modo Validação (Dry-Run)
- **Adicionado**: Checkbox "Modo Validação (não gera SQL, apenas valida os dados)"
- **Adicionado**: Relatório detalhado de validação sem gerar SQL
- **Adicionado**: Estatísticas completas (linhas, operação, modo, banco)

**Arquivos modificados**: `index.html` (linhas 409-412, 778-791)

#### Detecção de Problemas
- **Adicionado**: Função `validateData()` completa
- **Adicionado**: Detecção de códigos duplicados
- **Adicionado**: Validação de coluna 'codigo' vazia
- **Adicionado**: Alerta de mais valores do que colunas definidas
- **Adicionado**: Alerta de menos valores do que colunas definidas
- **Adicionado**: Detecção de valores vazios que virarão NULL
- **Adicionado**: Separação entre erros críticos (bloqueiam) e warnings (alertam)

**Arquivos modificados**: `index.html` (linhas 490-535, 743-776)

#### Relatórios de Validação
- **Adicionado**: Seção "CÓDIGOS DUPLICADOS" em destaque
- **Adicionado**: Lista de avisos (limitado a 20 para não poluir)
- **Adicionado**: Contador de total de linhas
- **Adicionado**: Separador visual (linha de iguais)
- **Adicionado**: Validação report antes do SQL gerado

**Arquivos modificados**: `index.html` (linhas 756-776, 997)

**Impacto**: 🟠 ALTO - Previne erros antes de executar em produção

---

### 🔄 TRANSAÇÕES

#### Suporte a Transações
- **Adicionado**: Checkbox "Encapsular em transação (BEGIN/COMMIT/ROLLBACK)"
- **Adicionado**: Geração de BEGIN TRANSACTION antes dos comandos
- **Adicionado**: COMMIT comentado ao final
- **Adicionado**: ROLLBACK comentado como alternativa
- **Adicionado**: Tratamento específico por banco:
  - MySQL: `START TRANSACTION` / `COMMIT`
  - Outros: `BEGIN TRANSACTION` / `COMMIT TRANSACTION`

**Exemplo gerado**:
```sql
BEGIN TRANSACTION;

UPDATE produtos SET ...;
UPDATE produtos SET ...;

-- Se tudo ocorreu bem:
COMMIT TRANSACTION;

-- Se houver erro, execute:
-- ROLLBACK TRANSACTION;
```

**Arquivos modificados**: `index.html` (linhas 404-407, 814-821, 981-995)

**Impacto**: 🟠 ALTO - Permite rollback em caso de erro

---

### 📊 INFORMAÇÃO E AUDITORIA

#### Cabeçalho Informativo
- **Adicionado**: Comentário com data/hora de geração
- **Adicionado**: Tipo de operação (INSERT/UPDATE)
- **Adicionado**: Nome da tabela
- **Adicionado**: Total de comandos
- **Adicionado**: Modo UPDATE (se aplicável)
- **Adicionado**: Colunas atualizadas (modo by codigo)
- **Adicionado**: Alerta de códigos duplicados no cabeçalho

**Exemplo**:
```sql
-- Gerado por </alldev> Conversor Universal
-- Data: 16/12/2025 14:30:22
-- Operação: UPDATE
-- Tabela: produtos
-- Total de comandos: 150
-- Modo: UPDATE por coluna 'codigo' (produção)
-- Colunas atualizadas: descricao, preco_venda, preco_custo, personal1
--
```

**Arquivos modificados**: `index.html` (linhas 797-812)

**Impacto**: 🟢 MÉDIO - Facilita auditoria e rastreamento

---

### 📝 INTERFACE E USABILIDADE

#### Instruções Atualizadas
- **Adicionado**: Novo passo 6 explicando UPDATE por codigo
- **Adicionado**: Aviso em destaque sobre modo produção
- **Adicionado**: Explicação das 4 colunas permitidas

**Arquivos modificados**: `index.html` (linhas 271-288)

#### Visual Feedback
- **Adicionado**: Seção UPDATE mode com fundo amarelo destaque
- **Adicionado**: Explicação inline dos dois modos UPDATE
- **Adicionado**: Checkbox com fundo verde para transações
- **Adicionado**: Checkbox com fundo laranja para validação
- **Adicionado**: Alert após gerar SQL se houver duplicatas

**Arquivos modificados**: `index.html` (linhas 328-338, 404-412, 1000-1002)

---

### 🔧 MELHORIAS TÉCNICAS

#### Código e Estrutura
- **Adicionado**: Constante `ALLOWED_UPDATE_COLUMNS` (linha 449)
- **Adicionado**: Função `toggleUpdateMode()` (linhas 455-463)
- **Adicionado**: Função `escapeIdentifier()` (linhas 465-488)
- **Adicionado**: Função `validateData()` (linhas 490-535)
- **Refatorado**: Função `generateSQL()` totalmente reescrita (linhas 683-1003)
  - Separação de lógica INSERT vs UPDATE
  - Separação de UPDATE sequencial vs by codigo
  - Validação integrada
  - Transações integradas
  - Relatórios integrados

#### LocalStorage
- **Atualizado**: Salvamento de configurações agora inclui:
  - `updateMode`
  - `wrapTransaction`
  - `validateOnly`

**Arquivos modificados**: `index.html` (linhas 1041, 1046-1047)

---

### 📚 DOCUMENTAÇÃO

#### Novos Arquivos
- **Adicionado**: `README.md` - Documentação principal
- **Adicionado**: `QUICK_START_UPDATE_BY_CODIGO.md` - Guia rápido de uso
- **Adicionado**: `IMPROVEMENTS.md` - Lista completa de melhorias
- **Adicionado**: `SENIOR_ANALYSIS_REPORT.md` - Análise técnica detalhada
- **Adicionado**: `TEST_CASES.md` - Casos de teste completos
- **Adicionado**: `CHANGELOG.md` - Este arquivo

**Total de documentação**: ~3500 linhas

---

### ✅ COMPATIBILIDADE

#### 100% Retrocompatível
- ✅ INSERT com código sequencial - **PRESERVADO**
- ✅ UPDATE sequencial - **PRESERVADO**
- ✅ Colunas fixas - **PRESERVADO**
- ✅ Colunas como string - **PRESERVADO**
- ✅ Separadores personalizados - **PRESERVADO**
- ✅ 4 bancos de dados - **PRESERVADO**
- ✅ Import de colunas fixas - **PRESERVADO**
- ✅ Download/cópia SQL - **PRESERVADO**
- ✅ Link página sequencial - **PRESERVADO**

#### Breaking Changes
- ❌ **NENHUM** - Todos os recursos novos são opt-in (checkboxes ou novo modo)

---

### 🐛 BUGS CORRIGIDOS

#### Bug #1: SQL Injection via Identificadores (CRÍTICO)
**Antes**: `INSERT INTO ${tableName} ...`
**Depois**: `INSERT INTO ${escapeIdentifier(tableName, dbType)} ...`
**Impacto**: 🔴 CRÍTICO

#### Bug #2: UPDATE usando contador ao invés de codigo real (BLOQUEADOR)
**Antes**: `WHERE codigo = '${formatCode(currentCode)}'` (sempre sequencial)
**Depois**: Novo modo `WHERE codigo = '${codigoValue}'` (da planilha)
**Impacto**: 🔴 BLOQUEADOR para uso em produção

#### Bug #3: Zero validação de dados
**Antes**: Nenhuma validação, aceitava qualquer input
**Depois**: Validação completa com erros e warnings
**Impacto**: 🟠 ALTO

---

### 📊 ESTATÍSTICAS

#### Código
- **Linhas de código antes**: 742
- **Linhas de código depois**: 1056
- **Aumento**: +314 linhas (+42%)
- **Funções novas**: 3 (toggleUpdateMode, escapeIdentifier, validateData)
- **Funções modificadas**: 1 (generateSQL)

#### Segurança
- **Vulnerabilidades críticas corrigidas**: 1
- **Validações adicionadas**: 8
- **Edge cases cobertos**: 10

#### Documentação
- **Arquivos de documentação**: 6
- **Linhas de documentação**: ~3500
- **Casos de teste**: 10 principais + 3 edge cases

---

### 🎯 IMPACTO

#### Alta Prioridade (Crítico)
- 🔴 SQL Injection Protection - **RESOLVIDO**
- 🔴 UPDATE por codigo real - **RESOLVIDO**
- 🔴 Validação de dados - **RESOLVIDO**

#### Média Prioridade (Importante)
- 🟠 Transações - **RESOLVIDO**
- 🟠 Preview/Validação - **RESOLVIDO**
- 🟠 Detecção de duplicatas - **RESOLVIDO**

#### Baixa Prioridade (Nice-to-have)
- 🟢 Cabeçalho informativo - **RESOLVIDO**
- 🟢 Avisos de validação - **RESOLVIDO**
- 🟢 Documentação completa - **RESOLVIDO**

**Status final**: ✅ **Production-Ready** (com boas práticas)

---

### 🔮 PRÓXIMAS VERSÕES (Planejado)

#### [2.1.0] - Futuro
- [ ] Backup automático (SELECT antes de UPDATE)
- [ ] Validação de existência no banco
- [ ] Preview visual em tabela HTML

#### [2.2.0] - Futuro
- [ ] Batching inteligente (performance)
- [ ] Templates salvos
- [ ] Export CSV reverso

#### [3.0.0] - Futuro
- [ ] Refatoração modular
- [ ] TypeScript
- [ ] Testes automatizados

---

### 🤝 CONTRIBUIDORES

**Senior SQL Engineer** - Análise, design e implementação
- Identificação de vulnerabilidades críticas
- Design de solução production-ready
- Implementação de validações e segurança
- Documentação completa

---

### 📞 SUPORTE

Para dúvidas sobre:
- **Uso básico**: Consulte `QUICK_START_UPDATE_BY_CODIGO.md`
- **Recursos completos**: Consulte `IMPROVEMENTS.md`
- **Análise técnica**: Consulte `SENIOR_ANALYSIS_REPORT.md`
- **Testes**: Consulte `TEST_CASES.md`

---

## [1.0.0] - Anterior

### Recursos Originais
- INSERT com código sequencial
- UPDATE sequencial (contador)
- Colunas fixas com valores padrão
- Colunas tratadas como string
- Suporte a 4 bancos de dados
- Separadores personalizados
- Import de colunas fixas
- Download/cópia de SQL

### Limitações Conhecidas
- ⚠️ Vulnerável a SQL injection via identificadores
- ⚠️ UPDATE não usava código real da planilha
- ⚠️ Sem validação de dados
- ⚠️ Sem suporte a transações
- ⚠️ Sem modo preview/validação
- ⚠️ Sem detecção de duplicatas
- ⚠️ Sem informações de auditoria

**Status**: ✅ Funcional mas não recomendado para produção

---

*Changelog mantido em formato [Keep a Changelog](https://keepachangelog.com/)*
