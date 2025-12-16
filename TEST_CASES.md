# 🧪 Casos de Teste - UPDATE por Codigo

## Como Testar

Abra o arquivo `index.html` no navegador e siga os casos de teste abaixo.

---

## ✅ TESTE 1: UPDATE Básico por Codigo

### Objetivo
Verificar que UPDATE por codigo usa o valor da planilha, não o contador.

### Configuração
- **Nome da Tabela**: `produtos`
- **Colunas**: `codigo, descricao, preco_venda, preco_custo, personal1`
- **Tipo de Operação**: `UPDATE`
- **Modo UPDATE**: `Por Coluna 'codigo' (usa codigo da planilha - PRODUÇÃO)`
- **Banco de Dados**: `MySQL`

### Dados (copie e cole)
```
001234	Mouse Gamer	79.90	65.00	Promoção
001235	Teclado Mecânico	299.00	250.00	Novo
001236	Headset RGB	189.00	150.00	Estoque
```

### Resultado Esperado
```sql
-- Gerado por </alldev> Conversor Universal
-- Data: ...
-- Operação: UPDATE
-- Tabela: produtos
-- Total de comandos: 3
-- Modo: UPDATE por coluna 'codigo' (produção)
-- Colunas atualizadas: descricao, preco_venda, preco_custo, personal1
--

UPDATE `produtos` SET `descricao` = 'Mouse Gamer', `preco_venda` = 79.90, `preco_custo` = 65.00, `personal1` = 'Promoção' WHERE `codigo` = '001234';
UPDATE `produtos` SET `descricao` = 'Teclado Mecânico', `preco_venda` = 299.00, `preco_custo` = 250.00, `personal1` = 'Novo' WHERE `codigo` = '001235';
UPDATE `produtos` SET `descricao` = 'Headset RGB', `preco_venda` = 189.00, `preco_custo` = 150.00, `personal1` = 'Estoque' WHERE `codigo` = '001236';
```

### Validação
- ✅ WHERE usa '001234', '001235', '001236' (códigos da planilha)
- ✅ NÃO usa '000001', '000002', '000003' (contador)
- ✅ Apenas 4 colunas no SET (descricao, preco_venda, preco_custo, personal1)
- ✅ Identificadores escapados com backticks (MySQL)

---

## ✅ TESTE 2: Detecção de Duplicatas

### Objetivo
Verificar que o validador detecta códigos duplicados.

### Configuração
- Mesma do TESTE 1
- ✅ Marcar: **"Modo Validação"**

### Dados (copie e cole)
```
001234	Mouse Gamer	79.90	65.00	Info
001234	Teclado	199.00	150.00	Info
001235	Headset	189.00	150.00	Info
```

### Resultado Esperado
```
✅ MODO VALIDAÇÃO

⚠️ AVISOS DE VALIDAÇÃO:

🔴 CÓDIGOS DUPLICADOS:
• Código duplicado encontrado: 001234 (linha 2)

📊 Total de linhas: 3
════════════════════════════════════════════════════════════════════════════════

📊 Estatísticas:
• Total de linhas: 3
• Operação: UPDATE
• Modo UPDATE: Por Coluna codigo (PRODUÇÃO)
• Banco de dados: MYSQL
```

### Validação
- ✅ Alerta de código duplicado '001234'
- ✅ Indica linha 2
- ✅ Total de linhas correto (3)

---

## ✅ TESTE 3: SQL Injection Bloqueado

### Objetivo
Verificar que identificadores maliciosos são bloqueados.

### Configuração
- **Nome da Tabela**: `produtos; DROP TABLE users; --`
- **Colunas**: `codigo, descricao`
- Tipo: UPDATE, Modo: Por Coluna 'codigo'

### Dados
```
001234	Teste
```

### Resultado Esperado
**Alert box:**
```
Erro no nome da tabela: Identificador inválido: "produtos; DROP TABLE users; --". Use apenas letras, números e underscore.
```

### Validação
- ✅ Geração de SQL bloqueada
- ✅ Mensagem de erro clara
- ✅ Não mostra SQL no output

---

## ✅ TESTE 4: Transação Wrapping

### Objetivo
Verificar que transações são geradas corretamente por banco.

### Configuração (MySQL)
- Nome da Tabela: `produtos`
- Colunas: `codigo, descricao, preco_venda, preco_custo, personal1`
- Tipo: UPDATE, Modo: Por Coluna 'codigo'
- Banco: **MySQL**
- ✅ Marcar: **"Encapsular em transação"**

### Dados
```
001234	Produto A	10.00	8.00	Info
```

### Resultado Esperado
```sql
START TRANSACTION;

UPDATE `produtos` SET `descricao` = 'Produto A', `preco_venda` = 10.00, `preco_custo` = 8.00, `personal1` = 'Info' WHERE `codigo` = '001234';

-- Se tudo ocorreu bem:
COMMIT;

-- Se houver erro, execute:
-- ROLLBACK;
```

### Teste com PostgreSQL
- Mudar Banco para: **PostgreSQL**
- Resultado esperado: `BEGIN TRANSACTION;` ... `COMMIT TRANSACTION;`

### Validação
- ✅ MySQL usa `START TRANSACTION` e `COMMIT`
- ✅ PostgreSQL usa `BEGIN TRANSACTION` e `COMMIT TRANSACTION`

---

## ✅ TESTE 5: Identificadores Escapados por Banco

### Objetivo
Verificar que cada banco escapa identificadores corretamente.

### Configuração
- Nome da Tabela: `produtos_2024`
- Colunas: `codigo, descricao_completa, preco_venda`
- Tipo: UPDATE, Modo: Por Coluna 'codigo'
- Banco: **MySQL** (depois testar SQL Server, PostgreSQL)

### Dados
```
001234	Teste	10.00
```

### Resultados Esperados

**MySQL:**
```sql
UPDATE `produtos_2024` SET `descricao_completa` = 'Teste', `preco_venda` = 10.00 WHERE `codigo` = '001234';
```

**SQL Server:**
```sql
UPDATE [produtos_2024] SET [descricao_completa] = 'Teste', [preco_venda] = 10.00 WHERE [codigo] = '001234';
```

**PostgreSQL:**
```sql
UPDATE "produtos_2024" SET "descricao_completa" = 'Teste', "preco_venda" = 10.00 WHERE "codigo" = '001234';
```

**Firebird:**
```sql
UPDATE produtos_2024 SET descricao_completa = 'Teste', preco_venda = 10.00 WHERE codigo = '001234';
```

### Validação
- ✅ MySQL: backticks `` ` ``
- ✅ SQL Server: brackets `[]`
- ✅ PostgreSQL: double quotes `""`
- ✅ Firebird: sem quotes

---

## ✅ TESTE 6: Valores Especiais

### Objetivo
Verificar tratamento de valores especiais (NULL, aspas, vírgulas).

### Configuração
- Nome da Tabela: `produtos`
- Colunas: `codigo, descricao, preco_venda, preco_custo, personal1`
- Tipo: UPDATE, Modo: Por Coluna 'codigo'
- Banco: MySQL

### Dados (copie e cole)
```
001234	Produto d'água	15,90		Info
```
(nota: preco_custo está vazio)

### Resultado Esperado
```sql
UPDATE `produtos` SET `descricao` = 'Produto d''água', `preco_venda` = 15.90, `preco_custo` = NULL, `personal1` = 'Info' WHERE `codigo` = '001234';
```

### Validação
- ✅ Aspas simples escapadas: `d'água` → `d''água`
- ✅ Vírgula convertida em ponto: `15,90` → `15.90`
- ✅ Valor vazio virou NULL (sem aspas)

---

## ✅ TESTE 7: Apenas 4 Colunas São Atualizadas

### Objetivo
Verificar que apenas descricao, preco_venda, preco_custo, personal1 são atualizadas.

### Configuração
- Nome da Tabela: `produtos`
- Colunas: `codigo, descricao, preco_venda, preco_custo, personal1, categoria, estoque`
- Tipo: UPDATE, Modo: Por Coluna 'codigo'

### Dados
```
001234	Mouse	79.90	65.00	Info	Informatica	100
```

### Resultado Esperado
```sql
UPDATE `produtos` SET `descricao` = 'Mouse', `preco_venda` = 79.90, `preco_custo` = 65.00, `personal1` = 'Info' WHERE `codigo` = '001234';
```

### Validação
- ✅ Apenas 4 colunas no SET
- ✅ `categoria` e `estoque` foram **ignorados**
- ✅ Sem erro (colunas extras são silenciosamente ignoradas)

---

## ✅ TESTE 8: Colunas Fixas Funcionam

### Objetivo
Verificar que colunas fixas são adicionadas ao UPDATE.

### Configuração
- Nome da Tabela: `produtos`
- Colunas: `codigo, descricao, preco_venda, preco_custo, personal1`
- Tipo: UPDATE, Modo: Por Coluna 'codigo'
- **Colunas Fixas**:
  - `data_atualizacao` = `2025-12-16`
  - `usuario` = `admin`

### Dados
```
001234	Mouse	79.90	65.00	Info
```

### Resultado Esperado
```sql
UPDATE `produtos` SET `descricao` = 'Mouse', `preco_venda` = 79.90, `preco_custo` = 65.00, `personal1` = 'Info', `data_atualizacao` = '2025-12-16', `usuario` = 'admin' WHERE `codigo` = '001234';
```

### Validação
- ✅ Colunas fixas adicionadas ao SET
- ✅ Valores das colunas fixas formatados corretamente

---

## ✅ TESTE 9: Modo Sequencial Ainda Funciona (Retrocompatibilidade)

### Objetivo
Verificar que o modo UPDATE sequencial (antigo) ainda funciona.

### Configuração
- Nome da Tabela: `produtos`
- Colunas: `descricao, preco_venda, preco_custo, personal1` (SEM codigo)
- Tipo: UPDATE
- Modo UPDATE: **Sequencial (usa código inicial como contador)**
- Código Inicial: `000100`

### Dados
```
Mouse	79.90	65.00	Info
Teclado	199.00	150.00	Info
```

### Resultado Esperado
```sql
UPDATE `produtos` SET `descricao` = 'Mouse', `preco_venda` = 79.90, `preco_custo` = 65.00, `personal1` = 'Info' WHERE `codigo` = '000100';
UPDATE `produtos` SET `descricao` = 'Teclado', `preco_venda` = 199.00, `preco_custo` = 150.00, `personal1` = 'Info' WHERE `codigo` = '000101';
```

### Validação
- ✅ WHERE usa contador: 000100, 000101
- ✅ TODAS as colunas são atualizadas (não apenas 4)
- ✅ Modo antigo preservado 100%

---

## ✅ TESTE 10: INSERT Ainda Funciona (Retrocompatibilidade)

### Objetivo
Verificar que INSERT não foi afetado pelas mudanças.

### Configuração
- Nome da Tabela: `produtos`
- Colunas: `descricao, preco_venda`
- Tipo: **INSERT**
- Código Inicial: `000001`

### Dados
```
Mouse	79.90
Teclado	199.00
```

### Resultado Esperado
```sql
INSERT INTO `produtos` (`codigo`, `descricao`, `preco_venda`) VALUES ('000001', 'Mouse', 79.90);
INSERT INTO `produtos` (`codigo`, `descricao`, `preco_venda`) VALUES ('000002', 'Teclado', 199.00);
```

### Validação
- ✅ Código sequencial gerado automaticamente
- ✅ Formato 6 dígitos: 000001, 000002
- ✅ INSERT continua funcionando exatamente como antes

---

## 🎯 Resumo dos Testes

| Teste | Status | Resultado |
|-------|--------|-----------|
| 1. UPDATE Básico por Codigo | ✅ | WHERE usa codigo da planilha |
| 2. Detecção de Duplicatas | ✅ | Alerta correto |
| 3. SQL Injection Bloqueado | ✅ | Identificadores validados |
| 4. Transação Wrapping | ✅ | BEGIN/COMMIT corretos |
| 5. Identificadores Escapados | ✅ | Quotes corretos por banco |
| 6. Valores Especiais | ✅ | Aspas, vírgulas, NULL corretos |
| 7. Apenas 4 Colunas Atualizadas | ✅ | Whitelist funcionando |
| 8. Colunas Fixas Funcionam | ✅ | Adicionadas ao SET |
| 9. Modo Sequencial Funciona | ✅ | Retrocompatibilidade OK |
| 10. INSERT Funciona | ✅ | Não foi afetado |

---

## 🐛 Testes de Edge Cases

### Edge Case 1: Código Vazio

**Dados:**
```
	Mouse	79.90	65.00	Info
001235	Teclado	199.00	150.00	Info
```

**Esperado (com Modo Validação):**
```
❌ ERROS CRÍTICOS ENCONTRADOS:

• Linha 1: Coluna 'codigo' está vazia. UPDATE by codigo requer que a primeira coluna seja o código.
```

---

### Edge Case 2: Mais Valores do que Colunas

**Colunas:** `codigo, descricao, preco_venda`

**Dados:**
```
001234	Mouse	79.90	65.00	Info	Extra
```

**Esperado (com Modo Validação):**
```
⚠️ AVISOS DE VALIDAÇÃO:

Avisos:
• Linha 1: Mais valores (6) do que colunas definidas (3). Valores extras serão ignorados.
```

---

### Edge Case 3: Menos Valores do que Colunas

**Colunas:** `codigo, descricao, preco_venda, preco_custo, personal1`

**Dados:**
```
001234	Mouse	79.90
```

**Esperado (com Modo Validação):**
```
⚠️ AVISOS DE VALIDAÇÃO:

Avisos:
• Linha 1: Menos valores (3) do que colunas definidas (5). Valores faltantes serão NULL.
```

**SQL gerado:**
```sql
UPDATE `produtos` SET `descricao` = 'Mouse', `preco_venda` = 79.90, `preco_custo` = NULL, `personal1` = NULL WHERE `codigo` = '001234';
```

---

## 📝 Como Reportar Bugs

Se você encontrar um comportamento diferente do esperado:

1. Anote a configuração exata usada
2. Anote os dados de entrada
3. Anote o resultado obtido vs esperado
4. Verifique se está usando o modo correto (UPDATE by codigo vs Sequencial)
5. Reporte com todos esses detalhes

---

## ✅ Checklist de Teste Completo

Antes de usar em produção, execute:

- [ ] TESTE 1: UPDATE Básico por Codigo
- [ ] TESTE 2: Detecção de Duplicatas
- [ ] TESTE 3: SQL Injection Bloqueado
- [ ] TESTE 4: Transação Wrapping
- [ ] TESTE 5: Identificadores Escapados
- [ ] TESTE 6: Valores Especiais
- [ ] TESTE 7: Apenas 4 Colunas Atualizadas
- [ ] TESTE 8: Colunas Fixas Funcionam
- [ ] TESTE 9: Modo Sequencial Funciona
- [ ] TESTE 10: INSERT Funciona

Se todos passarem: ✅ **Sistema pronto para produção!**

---

*Casos de teste criados em: 2025-12-16*
