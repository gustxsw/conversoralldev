# Conversor Universal de Dados - Excel → SQL

## 🎯 O Que Mudou (Versão 2.0)

Esta versão mantém **100% de compatibilidade** com a versão anterior e adiciona recursos críticos para uso em produção.

### ✨ Novo Recurso Principal

**UPDATE por Coluna da Planilha** - Agora você pode atualizar registros usando qualquer valor da primeira coluna como WHERE condition.

**Regra simples:**
- **Primeira coluna** = WHERE condition (ex: codigo, id, email, cpf, etc)
- **Outras colunas** = SET (atualizadas)

**Exemplo 1 - Produtos:**
```
Colunas: codigo, descricao, preco_venda, preco_custo, personal1

Planilha:
001234    Mouse Gamer    79.90    65.00    Info

SQL Gerado:
UPDATE produtos SET descricao = 'Mouse Gamer', preco_venda = 79.90, preco_custo = 65.00, personal1 = 'Info' WHERE codigo = '001234';
```

**Exemplo 2 - Clientes:**
```
Colunas: email, nome, telefone, cidade

Planilha:
joao@email.com    João Silva    11999999    São Paulo

SQL Gerado:
UPDATE clientes SET nome = 'João Silva', telefone = '11999999', cidade = 'São Paulo' WHERE email = 'joao@email.com';
```

**100% flexível!** Você define as colunas, não há limitação de nomes ou quantidade.

---

## 📚 Documentação

### 🚀 Para Começar Rápido
- **QUICK_START_UPDATE_BY_CODIGO.md** - Guia passo a passo para usar o novo recurso
- **FLEXIBILITY_EXAMPLES.md** - 7 exemplos práticos de diferentes casos de uso

### 📖 Documentação Completa
- **IMPROVEMENTS.md** - Lista completa de todas as melhorias implementadas
- **SENIOR_ANALYSIS_REPORT.md** - Análise técnica detalhada (perspectiva senior SQL engineer)
- **TEST_CASES.md** - Casos de teste para validar que tudo funciona

---

## ✅ Melhorias Implementadas

### 🛡️ Segurança
- ✅ Proteção contra SQL Injection em identificadores (tabelas/colunas)
- ✅ Validação de identificadores SQL
- ✅ Escaping database-specific automático

### 🔍 Validação
- ✅ Modo Validação (dry-run antes de gerar SQL)
- ✅ Detecção automática de códigos duplicados
- ✅ Alertas para valores vazios (que virarão NULL)
- ✅ Validação de número de colunas vs valores

### 🔄 Produção
- ✅ UPDATE por coluna 'codigo' (usa código real da planilha)
- ✅ Whitelist de colunas (apenas 4 são atualizadas)
- ✅ Transações (BEGIN/COMMIT/ROLLBACK)
- ✅ Cabeçalho informativo no SQL gerado

### 📊 Informação
- ✅ Relatórios detalhados de validação
- ✅ Estatísticas de comandos gerados
- ✅ Avisos de problemas potenciais
- ✅ Instruções atualizadas

---

## 🚀 Início Rápido

### Para UPDATE de Produção:

1. **Prepare a planilha**: Primeira coluna DEVE ser o código
   ```
   001234    Mouse Gamer    79.90    65.00    Info
   001235    Teclado        199.00   150.00   Info
   ```

2. **Configure o conversor**:
   - Colunas: `codigo, descricao, preco_venda, preco_custo, personal1`
   - Tipo de Operação: `UPDATE`
   - Modo UPDATE: `Por Coluna 'codigo'`

3. **SEMPRE valide primeiro**:
   - ✅ Marque: "Modo Validação"
   - Clique: "Gerar Script SQL"
   - Revise: Erros e duplicatas

4. **Gere o SQL final**:
   - ❌ Desmarque: "Modo Validação"
   - ✅ Marque: "Encapsular em transação"
   - Clique: "Gerar Script SQL"

5. **Execute no banco** (com cuidado!)

---

## ⚠️ IMPORTANTE

### No modo "Por Coluna da Planilha":
- **Primeira coluna** = WHERE condition (NUNCA é atualizada)
- **Todas as outras colunas** = SET (são atualizadas)

**Você define quais colunas usar!** Não há limitação de nomes ou quantidade.

**Exemplos:**
- `codigo, descricao, preco` → WHERE codigo, SET descricao e preco
- `email, nome, telefone` → WHERE email, SET nome e telefone
- `id, campo1, campo2, campo3` → WHERE id, SET campo1, campo2 e campo3

---

## 🔄 Compatibilidade

### ✅ Tudo que funcionava antes continua funcionando:
- INSERT com código sequencial
- UPDATE sequencial (modo legado)
- Colunas fixas
- Colunas como string
- Separadores personalizados
- Todos os 4 bancos de dados (MySQL, SQL Server, PostgreSQL, Firebird)

### ➕ Recursos novos são opcionais:
- UPDATE por codigo (novo modo)
- Validação (checkbox)
- Transações (checkbox)

**Não há breaking changes!**

---

## 🛡️ Checklist de Produção

Antes de executar em produção:

- [ ] ✅ Usei o **Modo Validação** primeiro
- [ ] ✅ Não há **códigos duplicados**
- [ ] ✅ A primeira coluna é o **codigo**
- [ ] ✅ Marquei **"Encapsular em transação"**
- [ ] ✅ Tenho **backup** do banco
- [ ] ✅ Testei em **homologação**
- [ ] ✅ Li os **avisos** de validação

---

## 📝 Estrutura dos Arquivos

```
/project
├── index.html                            # Aplicação principal
├── README.md                             # Este arquivo
├── QUICK_START_UPDATE_BY_CODIGO.md      # Guia rápido
├── IMPROVEMENTS.md                       # Melhorias detalhadas
├── SENIOR_ANALYSIS_REPORT.md            # Análise técnica completa
└── TEST_CASES.md                         # Casos de teste
```

---

## 🆘 Ajuda Rápida

### Problema: "Código duplicado encontrado"
**Solução**: Revise sua planilha. Há códigos repetidos. Corrija antes de executar.

### Problema: "Identificador inválido"
**Solução**: Use apenas letras, números e underscore em nomes de tabelas/colunas.

### Problema: "UPDATE não atualizou nada"
**Solução**: Verifique se os códigos existem no banco. Use transações e ROLLBACK se necessário.

### Problema: "Valores ficaram NULL"
**Solução**: Células vazias viram NULL. Use Modo Validação para detectar antes.

---

## 🎓 Para Usuários Avançados

### Modificar colunas permitidas no UPDATE:
Edite `index.html`, linha 449:
```javascript
const ALLOWED_UPDATE_COLUMNS = ['descricao', 'preco_venda', 'preco_custo', 'personal1', 'sua_coluna'];
```

### Adicionar validações customizadas:
Edite a função `validateData()` em `index.html`, linha 491.

---

## 📊 Comparação de Modos UPDATE

| | Sequencial (antigo) | Por Coluna 'codigo' (novo) |
|---|---|---|
| **WHERE usa** | Contador (000001, 000002...) | Codigo da planilha |
| **Colunas atualizadas** | Todas definidas | Apenas 4 permitidas |
| **Primeira coluna** | Qualquer | Deve ser codigo |
| **Uso ideal** | Desenvolvimento/testes | **PRODUÇÃO** |

---

## 🚨 Avisos Importantes

1. **SEMPRE use Modo Validação antes de executar em produção**
2. **SEMPRE use transações para poder fazer ROLLBACK**
3. **SEMPRE tenha backup antes de UPDATE em massa**
4. **SEMPRE teste em homologação primeiro**
5. **NUNCA execute SQL sem revisar antes**

---

## 📈 Roadmap Futuro (Sugestões)

### Alta Prioridade
- [ ] Backup automático (SELECT antes de UPDATE)
- [ ] Validação de existência no banco
- [ ] Preview visual em tabela HTML

### Média Prioridade
- [ ] Batching inteligente (performance)
- [ ] Templates salvos
- [ ] Export CSV reverso

### Baixa Prioridade
- [ ] Syntax highlighting
- [ ] Undo/Redo
- [ ] TypeScript

---

## 📞 Suporte

### Encontrou um bug?
1. Verifique se seguiu o guia corretamente
2. Consulte TEST_CASES.md para casos de teste
3. Leia SENIOR_ANALYSIS_REPORT.md para edge cases conhecidos

### Precisa de um recurso novo?
1. Leia IMPROVEMENTS.md para ver se já foi considerado
2. Verifique se pode ser implementado modificando `ALLOWED_UPDATE_COLUMNS`

---

## 📜 Licença

© </alldev> - Todos os direitos reservados

---

## 🎉 Agradecimentos

Análise e melhorias implementadas por um Senior SQL Engineer com foco em:
- Segurança (SQL injection, validação)
- Confiabilidade (transações, rollback)
- Usabilidade (modo validação, avisos claros)
- Compatibilidade (100% retrocompatível)

**Versão**: 2.0
**Data**: 2025-12-16
**Status**: ✅ Production-Ready (com boas práticas)

---

**Lembre-se**: Com grandes poderes vêm grandes responsabilidades. Use transações. Faça backups. Valide sempre.

🚀 Bom uso!
