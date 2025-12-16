# 🔧 Exemplos de Flexibilidade - UPDATE Universal

A plataforma é **100% configurável**. Você define as colunas, não há hardcoding.

---

## 🎯 Regra Simples

No modo **"UPDATE por coluna"**:
- **Primeira coluna** = WHERE condition (não é atualizada)
- **Todas as outras colunas** = SET (são atualizadas)

---

## 📝 Exemplo 1: Produtos (seu caso atual)

### Configuração:
- **Colunas**: `codigo, descricao, preco_venda, preco_custo, personal1`

### Planilha:
```
001234    Mouse Gamer    79.90    65.00    Info A
001235    Teclado RGB    199.00   150.00   Info B
```

### SQL Gerado:
```sql
-- WHERE: codigo (primeira coluna)
-- SET: descricao, preco_venda, preco_custo, personal1 (demais colunas)

UPDATE produtos SET descricao = 'Mouse Gamer', preco_venda = 79.90, preco_custo = 65.00, personal1 = 'Info A' WHERE codigo = '001234';
UPDATE produtos SET descricao = 'Teclado RGB', preco_venda = 199.00, preco_custo = 150.00, personal1 = 'Info B' WHERE codigo = '001235';
```

---

## 📝 Exemplo 2: Clientes (outro caso)

### Configuração:
- **Colunas**: `email, nome, telefone, cidade`

### Planilha:
```
joao@email.com    João Silva       11999999999    São Paulo
maria@email.com   Maria Santos     21888888888    Rio de Janeiro
```

### SQL Gerado:
```sql
-- WHERE: email (primeira coluna)
-- SET: nome, telefone, cidade (demais colunas)

UPDATE clientes SET nome = 'João Silva', telefone = '11999999999', cidade = 'São Paulo' WHERE email = 'joao@email.com';
UPDATE clientes SET nome = 'Maria Santos', telefone = '21888888888', cidade = 'Rio de Janeiro' WHERE email = 'maria@email.com';
```

---

## 📝 Exemplo 3: Estoque (apenas 2 colunas)

### Configuração:
- **Colunas**: `id_produto, quantidade`

### Planilha:
```
1001    50
1002    75
1003    100
```

### SQL Gerado:
```sql
-- WHERE: id_produto (primeira coluna)
-- SET: quantidade (demais colunas)

UPDATE estoque SET quantidade = 50 WHERE id_produto = '1001';
UPDATE estoque SET quantidade = 75 WHERE id_produto = '1002';
UPDATE estoque SET quantidade = 100 WHERE id_produto = '1003';
```

---

## 📝 Exemplo 4: Usuários (muitas colunas)

### Configuração:
- **Colunas**: `user_id, nome, email, telefone, endereco, cidade, estado, cep, status`

### Planilha:
```
USR001    João    joao@email.com    1199999    Rua A    SP    SP    01000-000    Ativo
USR002    Maria   maria@email.com   2188888    Rua B    RJ    RJ    20000-000    Ativo
```

### SQL Gerado:
```sql
-- WHERE: user_id (primeira coluna)
-- SET: nome, email, telefone, endereco, cidade, estado, cep, status (demais colunas)

UPDATE usuarios SET nome = 'João', email = 'joao@email.com', telefone = '1199999', endereco = 'Rua A', cidade = 'SP', estado = 'SP', cep = '01000-000', status = 'Ativo' WHERE user_id = 'USR001';
UPDATE usuarios SET nome = 'Maria', email = 'maria@email.com', telefone = '2188888', endereco = 'Rua B', cidade = 'RJ', estado = 'RJ', cep = '20000-000', status = 'Ativo' WHERE user_id = 'USR002';
```

---

## 📝 Exemplo 5: Pedidos (código numérico)

### Configuração:
- **Colunas**: `pedido_id, status, data_entrega, observacoes`

### Planilha:
```
12345    Enviado      2025-12-20    Entrega expressa
12346    Processando  2025-12-22    Entrega normal
```

### SQL Gerado:
```sql
-- WHERE: pedido_id (primeira coluna)
-- SET: status, data_entrega, observacoes (demais colunas)

UPDATE pedidos SET status = 'Enviado', data_entrega = '2025-12-20', observacoes = 'Entrega expressa' WHERE pedido_id = '12345';
UPDATE pedidos SET status = 'Processando', data_entrega = '2025-12-22', observacoes = 'Entrega normal' WHERE pedido_id = '12346';
```

---

## 📝 Exemplo 6: Com Colunas Fixas

### Configuração:
- **Colunas**: `id, nome, preco`
- **Colunas Fixas**:
  - `data_atualizacao` = `2025-12-16`
  - `usuario_atualizacao` = `admin`

### Planilha:
```
101    Produto A    50.00
102    Produto B    75.00
```

### SQL Gerado:
```sql
-- WHERE: id (primeira coluna)
-- SET: nome, preco (demais colunas) + colunas fixas

UPDATE produtos SET nome = 'Produto A', preco = 50.00, data_atualizacao = '2025-12-16', usuario_atualizacao = 'admin' WHERE id = '101';
UPDATE produtos SET nome = 'Produto B', preco = 75.00, data_atualizacao = '2025-12-16', usuario_atualizacao = 'admin' WHERE id = '102';
```

---

## 📝 Exemplo 7: Com WHERE String

### Configuração:
- **Colunas**: `placa, marca, modelo, ano`

### Planilha:
```
ABC-1234    Toyota    Corolla     2020
XYZ-5678    Honda     Civic       2021
```

### SQL Gerado:
```sql
-- WHERE: placa (primeira coluna)
-- SET: marca, modelo, ano (demais colunas)

UPDATE veiculos SET marca = 'Toyota', modelo = 'Corolla', ano = 2020 WHERE placa = 'ABC-1234';
UPDATE veiculos SET marca = 'Honda', modelo = 'Civic', ano = 2021 WHERE placa = 'XYZ-5678';
```

---

## 🎯 Resumo

| Você Configura | Sistema Faz |
|----------------|-------------|
| Colunas: `A, B, C, D` | WHERE A = valor, SET B, C, D |
| Colunas: `X, Y` | WHERE X = valor, SET Y |
| Colunas: `ID, Nome, Email, Tel, End` | WHERE ID = valor, SET Nome, Email, Tel, End |

**Sem limites!** Você define quantas colunas quiser, com os nomes que quiser.

---

## ⚠️ Importante

1. **Primeira coluna é sempre WHERE** (não é atualizada)
2. **Todas as outras são SET** (são atualizadas)
3. **Você escolhe os nomes** (não precisa ser 'codigo', 'id', etc)
4. **Funciona com 2 ou 20 colunas**

---

## 🚀 Próximo Caso de Uso

Imagine que amanhã você precisa:

### Atualizar preços de fornecedores por CNPJ:
```
Colunas: cnpj, razao_social, preco_unitario, prazo_entrega
```

### Atualizar alunos por matrícula:
```
Colunas: matricula, nome, turma, nota_final
```

### Atualizar funcionários por CPF:
```
Colunas: cpf, nome, cargo, salario, departamento
```

**Todos funcionam exatamente da mesma forma!**

Primeira coluna = WHERE
Resto = SET

---

**Sem hardcoding. Sem limitações. 100% flexível.**
