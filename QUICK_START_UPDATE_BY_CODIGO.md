# 🚀 Guia Rápido: UPDATE por Código (Produção)

## ✅ O que você precisa saber

Agora você pode atualizar registros usando o **código da planilha** ao invés de um contador sequencial.

---

## 📋 Passo a Passo

### 1. Prepare sua planilha Excel

**A primeira coluna DEVE ser o código** que você quer usar no WHERE:

```
001234    Produto A    15.90    12.00    Informação 1
001235    Produto B    25.00    20.00    Informação 2
001236    Produto C    35.50    28.00    Informação 3
```

### 2. Configure o conversor

**Passo 1 - Configurações Iniciais:**
- **Nome da Tabela**: `produtos`
- **Colunas**: `codigo, descricao, preco_venda, preco_custo, personal1`
- **Tipo de Operação**: `UPDATE`
- **Modo UPDATE**: `Por Coluna 'codigo' (usa codigo da planilha - PRODUÇÃO)` ⬅️ **IMPORTANTE!**

### 3. Cole os dados (Passo 4)

Cole seus dados do Excel normalmente.

### 4. SEMPRE valide primeiro

✅ Marque: **"Modo Validação (não gera SQL, apenas valida os dados)"**

Clique em **"Gerar Script SQL"**

Revise:
- ❌ Erros críticos (se houver, corrija antes de continuar)
- ⚠️ Códigos duplicados (MUITO IMPORTANTE!)
- ⚠️ Valores vazios que virarão NULL

### 5. Gere o SQL final

❌ Desmarque: "Modo Validação"
✅ Marque: **"Encapsular em transação"** (recomendado!)

Clique em **"Gerar Script SQL"** novamente.

### 6. Execute no banco

```sql
BEGIN TRANSACTION;

UPDATE produtos SET descricao = 'Produto A', preco_venda = 15.90, preco_custo = 12.00, personal1 = 'Informação 1' WHERE codigo = '001234';
UPDATE produtos SET descricao = 'Produto B', preco_venda = 25.00, preco_custo = 20.00, personal1 = 'Informação 2' WHERE codigo = '001235';
UPDATE produtos SET descricao = 'Produto C', preco_venda = 35.50, preco_custo = 28.00, personal1 = 'Informação 3' WHERE codigo = '001236';

-- Se tudo ocorreu bem:
COMMIT TRANSACTION;

-- Se houver erro, execute:
-- ROLLBACK TRANSACTION;
```

**IMPORTANTE**: Se algo der errado, execute: `ROLLBACK TRANSACTION;`

---

## 🎯 Apenas 4 Colunas São Atualizadas

No modo **"Por Coluna 'codigo'"**, apenas estas colunas são permitidas:

1. ✅ `descricao`
2. ✅ `preco_venda`
3. ✅ `preco_custo`
4. ✅ `personal1`

**O `codigo` NUNCA é atualizado** (proteção automática).

Se você definir outras colunas na planilha, elas serão ignoradas.

---

## ⚠️ Avisos Importantes

### ❌ NÃO faça isso:

```
Planilha com códigos duplicados:
001234    Produto A    ...
001234    Produto B    ...  ⬅️ DUPLICADO! O validador vai alertar
```

### ❌ NÃO faça isso:

```
Planilha sem codigo na primeira coluna:
Produto A    001234    15.90    ...  ⬅️ ERRADO! Codigo deve ser a primeira coluna
```

### ✅ FAÇA isso:

```
Planilha correta:
001234    Produto A    15.90    12.00    Info  ⬅️ CORRETO!
001235    Produto B    25.00    20.00    Info
```

---

## 🔄 Diferença entre os Modos UPDATE

| Característica | Sequencial (antigo) | Por Coluna 'codigo' (novo) |
|----------------|---------------------|----------------------------|
| **WHERE usa** | Contador sequencial | Codigo da planilha |
| **Colunas atualizadas** | Todas | Apenas 4 permitidas |
| **Uso ideal** | Testes, desenvolvimento | **PRODUÇÃO** |
| **Primeira coluna** | Qualquer | **Deve ser codigo** |

---

## 💡 Exemplo Completo

### Cenário Real:
Você precisa atualizar os preços de 500 produtos no sistema.

### Excel original:
```
Código    Descrição         Preço Venda    Preço Custo    Info
001234    Mouse Gamer       79.90          65.00          Promoção
001235    Teclado Mecânico  299.00         250.00         Novo
001236    Headset RGB       189.00         150.00         Estoque
```

### Configuração:
- Colunas: `codigo, descricao, preco_venda, preco_custo, personal1`
- Modo: `UPDATE` → `Por Coluna 'codigo'`
- ✅ Modo Validação (primeiro)
- ✅ Encapsular em transação

### SQL Gerado:
```sql
-- Gerado por </alldev> Conversor Universal
-- Data: 16/12/2025 14:30:22
-- Operação: UPDATE
-- Tabela: produtos
-- Total de comandos: 3
-- Modo: UPDATE por coluna 'codigo' (produção)
-- Colunas atualizadas: descricao, preco_venda, preco_custo, personal1
--

BEGIN TRANSACTION;

UPDATE produtos SET descricao = 'Mouse Gamer', preco_venda = 79.90, preco_custo = 65.00, personal1 = 'Promoção' WHERE codigo = '001234';
UPDATE produtos SET descricao = 'Teclado Mecânico', preco_venda = 299.00, preco_custo = 250.00, personal1 = 'Novo' WHERE codigo = '001236';
UPDATE produtos SET descricao = 'Headset RGB', preco_venda = 189.00, preco_custo = 150.00, personal1 = 'Estoque' WHERE codigo = '001236';

-- Se tudo ocorreu bem:
COMMIT TRANSACTION;

-- Se houver erro, execute:
-- ROLLBACK TRANSACTION;
```

---

## 🛡️ Checklist de Segurança

Antes de executar em produção, confirme:

- [ ] ✅ Usei o **Modo Validação** primeiro
- [ ] ✅ Não há **códigos duplicados**
- [ ] ✅ Revisei os **avisos** (valores NULL, etc)
- [ ] ✅ A primeira coluna é o **codigo**
- [ ] ✅ Marquei **"Encapsular em transação"**
- [ ] ✅ Tenho **backup** do banco
- [ ] ✅ Testei em ambiente de **homologação**
- [ ] ✅ Sei como fazer **ROLLBACK** se necessário

---

## 🆘 Perguntas Frequentes

### P: Posso atualizar outras colunas além das 4 permitidas?
**R**: No modo "Por Coluna 'codigo'", não. Se você precisa atualizar outras colunas, pode:
1. Usar o modo "Sequencial" (antigo)
2. Ou adicionar as colunas ao array `ALLOWED_UPDATE_COLUMNS` no código (linha 449 do index.html)

### P: E se meu código não tiver 6 dígitos?
**R**: Não importa! O código que você colocar na planilha será usado como está. O campo "Código Inicial (6 dígitos)" só serve para INSERT e UPDATE sequencial.

### P: O que acontece se o código não existir no banco?
**R**: O UPDATE será executado, mas nenhuma linha será afetada (não dará erro). Por isso é importante validar os dados antes.

### P: Posso usar colunas fixas?
**R**: Sim! Colunas fixas funcionam normalmente e serão adicionadas ao UPDATE (exceto se for a coluna 'codigo').

### P: Como sei se deu certo?
**R**: Após executar, verifique o número de linhas afetadas:
- SQL Server: `SELECT @@ROWCOUNT`
- MySQL: `SELECT ROW_COUNT()`
- PostgreSQL: Veja o resultado do `COMMIT`

Se o número não bater com o esperado, execute `ROLLBACK TRANSACTION;`

### P: Posso usar caracteres especiais no nome da coluna?
**R**: Apenas letras, números e underscore (`_`). Outros caracteres são bloqueados por segurança.

---

## 🎉 Pronto!

Agora você pode atualizar dados de produção com segurança usando o código real da planilha.

**Lembre-se**: SEMPRE valide primeiro, SEMPRE use transação, SEMPRE tenha backup!

---

*Para dúvidas técnicas, consulte o arquivo IMPROVEMENTS.md*
