# Excel DB Updater

Sistema profissional para atualização de banco de dados através de planilhas Excel.

## Funcionalidades

✅ **Upload Direto de Excel**
- Suporte para arquivos .xlsx e .xls
- Drag & drop ou seleção de arquivo
- Leitura automática de abas múltiplas

✅ **Preview dos Dados**
- Visualização prévia dos dados antes de processar
- Seleção de aba do Excel
- Configuração do nome da tabela

✅ **Mapeamento Inteligente**
- Mapeamento visual de colunas Excel → Banco de Dados
- Definição de tipos de dados (texto, número, booleano, data)
- Seleção de coluna chave para updates
- Interface intuitiva com indicadores visuais

✅ **Validação Automática**
- Validação de dados antes da execução
- Detecção de valores duplicados
- Verificação de tipos de dados
- Alertas e erros detalhados

✅ **Execução Segura**
- Confirmação antes de executar
- Execução em lote com feedback em tempo real
- Tratamento individual de erros
- Estatísticas de sucesso/falha

✅ **Histórico Completo**
- Registro de todas as operações
- Detalhes de cada execução
- Log de erros para auditoria
- Interface expandível para detalhes

## Como Usar

### 1. Upload do Arquivo

1. Clique ou arraste seu arquivo Excel para a área de upload
2. O sistema irá ler automaticamente os dados

### 2. Preview e Configuração

1. Digite o nome da tabela no banco de dados
2. Se houver múltiplas abas, selecione a desejada
3. Visualize os primeiros 10 registros
4. Clique em "Continuar"

### 3. Mapeamento de Colunas

1. Para cada coluna do Excel, defina:
   - Nome da coluna no banco de dados
   - Tipo de dado (texto, número, booleano, data)
2. **Importante**: Selecione uma coluna chave (código/ID) - marcada com 🔑
3. Clique em "Validar Dados"

### 4. Validação

1. Revise erros e avisos (se houver)
2. **Erros** impedem a execução até serem corrigidos
3. **Avisos** são informativos, mas permitem continuar
4. Clique em "Executar Atualização"

### 5. Execução

1. Confirme a operação
2. Aguarde o processamento
3. Visualize o resultado com estatísticas:
   - Total de registros
   - Sucessos
   - Falhas (com detalhes)
4. Clique em "Nova Operação" para recomeçar

### 6. Histórico

1. Clique em "Histórico" no topo
2. Visualize todas as operações executadas
3. Expanda para ver detalhes completos
4. Use para auditoria e troubleshooting

## Exemplo Prático

Imagine que você tem uma planilha Excel com os seguintes dados:

| codigo | preco_custo | preco_venda | personal1 |
|--------|-------------|-------------|-----------|
| 000001 | 12.50       | 28.00       | Novo      |
| 000002 | 18.90       | 42.00       | Premium   |
| 000003 | 8.20        | 19.50       | Basic     |

**Passos:**

1. **Upload**: Arraste o arquivo Excel
2. **Preview**: Digite "produtos" como nome da tabela
3. **Mapeamento**:
   - codigo → codigo (Texto) - Marque como chave 🔑
   - preco_custo → preco_custo (Número)
   - preco_venda → preco_venda (Número)
   - personal1 → personal1 (Texto)
4. **Validação**: Verifique se está tudo OK
5. **Execução**: Confirme e execute

O sistema irá executar:
```sql
UPDATE produtos SET preco_custo = 12.50, preco_venda = 28.00, personal1 = 'Novo' WHERE codigo = '000001';
UPDATE produtos SET preco_custo = 18.90, preco_venda = 42.00, personal1 = 'Premium' WHERE codigo = '000002';
UPDATE produtos SET preco_custo = 8.20, preco_venda = 19.50, personal1 = 'Basic' WHERE codigo = '000003';
```

## Tabela de Teste

O sistema já vem com uma tabela de teste chamada `produtos` com 5 registros de exemplo:

- Código: 000001 a 000005
- Campos: nome, preco_custo, preco_venda, personal1, estoque, ativo

Você pode usar essa tabela para testar a aplicação!

## Vantagens sobre a Solução Anterior

### Antes (HTML Simples)
- ❌ Processo manual de copiar/colar
- ❌ Sem validação prévia
- ❌ Sem preview dos dados
- ❌ Precisa executar SQL manualmente
- ❌ Sem histórico
- ❌ Configuração complexa

### Agora (Aplicação Profissional)
- ✅ Upload direto de arquivo
- ✅ Validação automática
- ✅ Preview interativo
- ✅ Execução direta no banco
- ✅ Histórico completo
- ✅ Interface intuitiva e moderna

## Tecnologias

- React 18 + TypeScript
- Vite (build rápido)
- Supabase (banco de dados)
- SheetJS (leitura de Excel)
- CSS moderno com variáveis

## Banco de Dados

O sistema usa Supabase (PostgreSQL) com:
- Tabela `operation_history` para histórico
- Tabela `produtos` para testes
- Função `execute_sql` para queries dinâmicas
- RLS (Row Level Security) configurado

## Segurança

- Validação de tipos de dados
- Escape automático de aspas simples
- Confirmação antes de executar
- Log de todas as operações
- Tratamento de erros individualizado

## Suporte

Para quem trabalha com banco de dados diariamente, essa ferramenta:
- Economiza tempo
- Reduz erros
- Mantém histórico
- Facilita auditoria
- Profissionaliza o processo
