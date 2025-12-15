# Excel DB Updater Pro

**Controle total para profissionais de banco de dados**

Sistema prático para gerar SQL a partir de planilhas Excel. Mantém o controle manual que você precisa, mas elimina o trabalho repetitivo.

---

## Por que essa solução?

Para quem trabalha com banco de dados diariamente e precisa de **praticidade COM controle**:

✅ **Upload de Excel** - Chega de copiar/colar dados
✅ **Gera SQL editável** - Você VÊ e pode MODIFICAR o SQL antes de executar
✅ **Todas as tratativas** - Colunas fixas, forçar strings, tipos de dados
✅ **INSERT ou UPDATE** - Controle total do tipo de operação
✅ **Execução opcional** - Copie o SQL ou execute direto (sua escolha)
✅ **Histórico** - Auditoria de tudo que foi gerado/executado

**Não é automático demais.** Você mantém o controle. É só mais prático.

---

## Como Funciona

### Painel Esquerdo: Configuração
1. **Upload** - Arraste o arquivo Excel
2. **Config Básica** - Tabela, INSERT/UPDATE, código inicial
3. **Preview** - Veja os dados antes
4. **Mapeamento** - Defina colunas e tipos de dados
5. **Colunas Fixas** - Valores padrão (ex: situacao='Ativo')
6. **Forçar String** - Marque colunas que devem ser tratadas como texto
7. **Gerar SQL** - Cria o script completo

### Painel Direito: Resultado
- **Validação** - Erros e avisos automáticos
- **SQL Gerado** - EDITÁVEL, em fundo escuro tipo terminal
- **Copiar/Baixar** - Para executar onde quiser
- **Executar (Opcional)** - Se quiser rodar direto no banco

---

## Exemplo Prático

Você tem um Excel com:
```
codigo  | preco_custo | preco_venda | personal1
000001  | 15.50       | 35.00       | Premium
000002  | 22.30       | 49.90       | Standard
```

**Passos:**
1. Arraste o arquivo
2. Tabela: `produtos`, Operação: `UPDATE`
3. Marque `codigo` como chave (🔑)
4. Adicione coluna fixa: `ativo = TRUE`
5. Clique em **Gerar SQL**

**SQL gerado:**
```sql
UPDATE produtos SET preco_custo = 15.50, preco_venda = 35.00, personal1 = 'Premium', ativo = TRUE WHERE codigo = '000001';
UPDATE produtos SET preco_custo = 22.30, preco_venda = 49.90, personal1 = 'Standard', ativo = TRUE WHERE codigo = '000002';
```

Você pode:
- ✏️ Editar o SQL se quiser
- 📋 Copiar e executar no seu cliente SQL favorito
- ▶️ Executar direto no Supabase (opcional)

---

## Recursos para Profissionais

### 1. Controle de Tipos
- **Número**: Remove vírgulas, não coloca aspas
- **String**: Coloca aspas, escapa caracteres especiais
- **Booleano**: Converte para TRUE/FALSE
- **Data**: Valida formato

### 2. Forçar como String
Checkboxes para forçar qualquer coluna como string, mesmo que pareça número.
Útil para: códigos, CEPs, telefones, etc.

### 3. Colunas Fixas
Adicione quantas quiser. Exemplos:
```
situacao = Ativo
cod_ncm = 21069090
cst_rev = 0
ativo = TRUE
```

### 4. INSERT com Código Sequencial
- Define código inicial (ex: 000001)
- Gera 6 dígitos automaticamente
- Incrementa para cada linha

### 5. SQL Editável
Fundo escuro estilo terminal, fonte monoespaçada.
Edite à vontade antes de copiar ou executar.

### 6. Validação Inteligente
- Coluna chave vazia
- Valores duplicados
- Tipos incompatíveis
- Continua mesmo com avisos (você decide)

### 7. Histórico Completo
- Todas operações registradas
- Nome da tabela e arquivo
- Sucesso/falhas por registro
- Expandível para ver detalhes

---

## Vantagens sobre Sua Solução Anterior

| Antes (HTML) | Agora (React) |
|-------------|---------------|
| ❌ Copiar/colar dados manualmente | ✅ Upload direto de arquivo |
| ❌ Configuração em campos separados | ✅ Interface visual intuitiva |
| ❌ Sem preview dos dados | ✅ Visualiza tudo antes |
| ❌ Textarea pequena para SQL | ✅ Editor grande e editável |
| ❌ Sem validação | ✅ Validação automática |
| ❌ Sem histórico | ✅ Histórico completo |
| ✅ Controle total do SQL | ✅ **MANTIDO** - você vê e edita |
| ✅ Colunas fixas | ✅ **MANTIDO** - ainda mais fácil |
| ✅ Forçar strings | ✅ **MANTIDO** - com checkboxes |

**Resumo**: Mesma filosofia, **interface 10x melhor**.

---

## Tecnologia

- **Frontend**: React 18 + TypeScript + Vite
- **Banco**: Supabase (PostgreSQL)
- **Excel**: SheetJS (leitura de .xlsx/.xls)
- **Design**: CSS moderno, sem frameworks

---

## Estrutura

```
src/
├── components/
│   ├── FileUpload.tsx       # Drag & drop
│   ├── DataPreview.tsx      # Preview da planilha
│   ├── ColumnMapper.tsx     # Mapeamento visual
│   ├── ValidationPanel.tsx  # Erros/avisos
│   ├── ExecutionPanel.tsx   # Execução opcional
│   └── HistoryPanel.tsx     # Histórico
├── utils/
│   ├── excelParser.ts       # Leitura de Excel
│   ├── validator.ts         # Validação de dados
│   └── dbExecutor.ts        # Execução no banco
├── types/
│   └── index.ts             # TypeScript types
└── App.tsx                  # Componente principal
```

---

## Banco de Dados

### Tabelas:
- `produtos` - Exemplo para testar (5 registros)
- `operation_history` - Histórico de operações

### Função:
- `execute_sql(query text)` - Executa SQL dinâmico

Tudo já configurado e pronto para usar!

---

## Como Usar

1. **Prepare seu Excel**
   - Primeira linha = nomes das colunas
   - Dados começam na linha 2

2. **Configure tudo no painel esquerdo**
   - Não pule etapas, cada uma tem sua função

3. **Clique em "Gerar SQL"**
   - Aparece no painel direito

4. **Revise o SQL gerado**
   - Edite se necessário
   - É um textarea normal, pode modificar à vontade

5. **Copie OU Execute**
   - Copie para executar no seu cliente SQL favorito
   - OU execute direto ali mesmo

---

## Para Quem É

✅ DBAs que atualizam bases diariamente
✅ Desenvolvedores que migram dados
✅ Analistas que importam planilhas
✅ Quem sabe SQL e quer economizar tempo
✅ Quem precisa de controle, não automação cega

---

## Para Quem NÃO É

❌ Quem quer algo completamente automático
❌ Quem não sabe SQL
❌ Quem não vai revisar o SQL antes de executar

---

## Segurança

- Escapa aspas simples automaticamente
- Valida tipos de dados
- Mostra preview antes de executar
- Log de todas operações
- **Você VÊ o SQL** antes de rodar

---

## Dica de Uso

**Fluxo recomendado:**
1. Gere o SQL
2. Copie para seu cliente SQL
3. Rode primeiro em ambiente de teste
4. Depois use a execução direta para agilizar

Assim você tem segurança + praticidade.

---

## Exemplo de Colunas Fixas

Casos comuns:
```
situacao = Ativo
tipo = Produto
origem = Importacao
ativo = TRUE
data_cadastro = CURRENT_TIMESTAMP
usuario = admin
cod_ncm = 21069090
```

---

## Arquivo de Exemplo

Incluído: `exemplo.csv`

Converta para Excel se quiser testar com XLSX.
Ou use CSV mesmo, a ferramenta lê os dois!

---

**Feito para profissionais que sabem o que estão fazendo e querem fazer mais rápido.**
