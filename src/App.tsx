import { useState } from 'react'
import { FileUpload } from './components/FileUpload'
import { parseExcelFile } from './utils/excelParser'
import { ExcelRow } from './types'
import { HistoryPanel } from './components/HistoryPanel'

interface FixedColumn {
  name: string
  value: string
}

function App() {
  const [showHistory, setShowHistory] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [data, setData] = useState<ExcelRow[]>([])
  const [columns, setColumns] = useState<string[]>([])

  const [tableName, setTableName] = useState('')
  const [operationType, setOperationType] = useState<'insert' | 'update'>('update')
  const [startCode, setStartCode] = useState('000001')
  const [separator, setSeparator] = useState('tab')
  const [customSeparator, setCustomSeparator] = useState('')
  const [dbType, setDbType] = useState('firebird')

  const [fixedColumns, setFixedColumns] = useState<FixedColumn[]>([{ name: '', value: '' }])
  const [importFixedText, setImportFixedText] = useState('')

  const [stringColumns, setStringColumns] = useState<Set<string>>(new Set())

  const [generatedSQL, setGeneratedSQL] = useState('')

  const handleFileLoaded = async (uploadedFile: File) => {
    try {
      const result = await parseExcelFile(uploadedFile)
      setFile(uploadedFile)
      setData(result.data)
      setColumns(result.columns)
    } catch (error) {
      alert('Erro ao ler o arquivo: ' + error)
    }
  }

  const addColumnRow = () => {
    setFixedColumns([...fixedColumns, { name: '', value: '' }])
  }

  const updateFixedColumn = (index: number, field: 'name' | 'value', value: string) => {
    const newFixed = [...fixedColumns]
    newFixed[index][field] = value
    setFixedColumns(newFixed)
  }

  const removeFixedColumn = (index: number) => {
    setFixedColumns(fixedColumns.filter((_, i) => i !== index))
  }

  const importFixedColumns = () => {
    if (!importFixedText.trim()) {
      alert('Por favor, cole as colunas fixas no formato correto.')
      return
    }

    setFixedColumns([])
    const lines = importFixedText.split('\n')
    const imported: FixedColumn[] = []

    lines.forEach((line) => {
      if (line.trim()) {
        const parts = line.split('=').map((part) => part.trim())
        if (parts.length === 2) {
          imported.push({ name: parts[0], value: parts[1] })
        }
      }
    })

    setFixedColumns(imported)
    alert(`${imported.length} colunas fixas importadas com sucesso!`)
  }

  const toggleStringColumn = (column: string) => {
    const newSet = new Set(stringColumns)
    if (newSet.has(column)) {
      newSet.delete(column)
    } else {
      newSet.add(column)
    }
    setStringColumns(newSet)
  }

  const formatValue = (value: any, columnName: string): string => {
    if (value === '' || value === null || value === undefined) {
      return 'NULL'
    }

    const valueStr = String(value).toLowerCase()

    if (valueStr === 'null') {
      return 'NULL'
    }

    if (stringColumns.has(columnName)) {
      return `'${String(value).replace(/'/g, "''")}'`
    }

    const numValue = String(value).replace(',', '.')
    if (!isNaN(Number(numValue)) && value !== '') {
      return numValue
    } else if (valueStr === 'true' || valueStr === 'false') {
      return valueStr.toUpperCase()
    } else {
      return `'${String(value).replace(/'/g, "''")}'`
    }
  }

  const formatCode = (code: number) => {
    return code.toString().padStart(6, '0')
  }

  const generateSQL = () => {
    if (!tableName.trim()) {
      alert('Preencha o nome da tabela!')
      return
    }

    if (!columns.length) {
      alert('Preencha as colunas!')
      return
    }

    if (!data.length) {
      alert('Nenhum dado para processar!')
      return
    }

    const defaultColumns: Record<string, string> = {}
    fixedColumns.forEach((fc) => {
      if (fc.name && fc.value) {
        defaultColumns[fc.name] = fc.value
      }
    })

    let sqlScript = ''
    let currentCode = parseInt(startCode)

    data.forEach((row) => {
      if (operationType === 'insert') {
        const allColumns = ['codigo', ...columns, ...Object.keys(defaultColumns)]

        const values = [
          `'${formatCode(currentCode)}'`,
          ...columns.map((col) => formatValue(row[col], col)),
          ...Object.entries(defaultColumns).map(([col, val]) => {
            if (stringColumns.has(col)) {
              return `'${val.replace(/'/g, "''")}'`
            }
            const numVal = val.replace(',', '.')
            if (!isNaN(Number(numVal)) && val !== '') {
              return numVal
            } else if (val.toLowerCase() === 'null') {
              return 'NULL'
            } else if (val.toLowerCase() === 'true' || val.toLowerCase() === 'false') {
              return val.toUpperCase()
            } else {
              return `'${val.replace(/'/g, "''")}'`
            }
          })
        ]

        sqlScript += `INSERT INTO ${tableName} (${allColumns.join(', ')}) VALUES (${values.join(', ')});\n`
      } else {
        const setClauses: string[] = []
        columns.forEach((col) => {
          setClauses.push(`${col} = ${formatValue(row[col], col)}`)
        })

        Object.entries(defaultColumns).forEach(([col, val]) => {
          let formattedVal: string
          if (stringColumns.has(col)) {
            formattedVal = `'${val.replace(/'/g, "''")}'`
          } else {
            const numVal = val.replace(',', '.')
            if (!isNaN(Number(numVal)) && val !== '') {
              formattedVal = numVal
            } else if (val.toLowerCase() === 'null') {
              formattedVal = 'NULL'
            } else if (val.toLowerCase() === 'true' || val.toLowerCase() === 'false') {
              formattedVal = val.toUpperCase()
            } else {
              formattedVal = `'${val.replace(/'/g, "''")}'`
            }
          }
          setClauses.push(`${col} = ${formattedVal}`)
        })

        sqlScript += `UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE codigo = '${formatCode(currentCode)}';\n`
      }

      currentCode++
    })

    setGeneratedSQL(sqlScript)
  }

  const copySQL = () => {
    if (!generatedSQL) {
      alert('Gere um script primeiro!')
      return
    }
    navigator.clipboard.writeText(generatedSQL)
    alert('Script copiado!')
  }

  const downloadSQL = () => {
    if (!generatedSQL) {
      alert('Gere um script primeiro!')
      return
    }
    const blob = new Blob([generatedSQL], { type: 'text/sql' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tableName || 'script'}.sql`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (showHistory) {
    return (
      <>
        <header>
          <div className="logo-container">
            <div className="logo">&lt;/alldev&gt;</div>
            <div className="header-text">
              <h1>Conversor Universal de Dados</h1>
              <p className="subtitle">Excel → SQL (Insert/Update)</p>
            </div>
          </div>
        </header>

        <div className="container">
          <button className="history-button" onClick={() => setShowHistory(false)}>
            ← Voltar
          </button>
          <HistoryPanel />
        </div>

        <footer>
          <p>
            © <span>&lt;/alldev&gt;</span> - Todos os direitos reservados -{' '}
            {new Date().getFullYear()}
          </p>
        </footer>
      </>
    )
  }

  return (
    <>
      <header>
        <div className="logo-container">
          <div className="logo">&lt;/alldev&gt;</div>
          <div className="header-text">
            <h1>Conversor Universal de Dados</h1>
            <p className="subtitle">Excel → SQL (Insert/Update)</p>
          </div>
        </div>
      </header>

      <div className="container">
        <button className="history-button" onClick={() => setShowHistory(true)}>
          📋 Histórico
        </button>

        <div className="instructions">
          <h2>📌 Como usar</h2>
          <p>
            1. Faça upload do arquivo Excel ou cole os dados no <b>Passo 1</b>.<br />
            2. Preencha o nome da tabela e as colunas no <b>Passo 2</b>.<br />
            3. Se desejar, adicione colunas fixas com valores padrão no <b>Passo 3</b>.<br />
            4. Especifique quais colunas devem ser tratadas como strings no <b>Passo 4</b>.<br />
            5. Clique em <b>Gerar Script SQL</b> e copie ou baixe o resultado no <b>Passo 5</b>.
          </p>
        </div>

        <div className="step">
          <h2>1. Upload do Excel ou Cole os Dados</h2>
          <FileUpload onFileLoaded={handleFileLoaded} />

          {file && (
            <div className="file-info">
              ✓ Arquivo carregado: <strong>{file.name}</strong> ({data.length} linhas, {columns.length} colunas)
            </div>
          )}

          {data.length > 0 && (
            <div className="preview-container">
              <div className="preview-header">
                Preview dos Dados (primeiras 5 linhas)
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      {columns.map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 5).map((row, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        {columns.map((col) => (
                          <td key={col}>{String(row[col] ?? '')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="step">
          <h2>2. Configurações Iniciais</h2>

          <div className="form-group">
            <label>Nome da Tabela:</label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Ex: produtos"
            />
          </div>

          <div className="form-group">
            <label>Colunas (separadas por vírgula):</label>
            <input
              type="text"
              value={columns.join(', ')}
              onChange={(e) => setColumns(e.target.value.split(',').map(c => c.trim()))}
              placeholder="Ex: nome, preco, categoria"
            />
          </div>

          <div className="form-group">
            <label>Separador dos Dados:</label>
            <select value={separator} onChange={(e) => setSeparator(e.target.value)}>
              <option value="tab">Tabulação</option>
              <option value="comma">Vírgula</option>
              <option value="semicolon">Ponto e Vírgula</option>
              <option value="custom">Personalizado</option>
            </select>
            {separator === 'custom' && (
              <input
                type="text"
                value={customSeparator}
                onChange={(e) => setCustomSeparator(e.target.value)}
                placeholder="Digite o separador"
                style={{ marginTop: '10px' }}
              />
            )}
          </div>

          <div className="form-group">
            <label>Banco de Dados:</label>
            <select value={dbType} onChange={(e) => setDbType(e.target.value)}>
              <option value="firebird">Firebird</option>
              <option value="mysql">MySQL</option>
              <option value="sqlserver">SQL Server</option>
              <option value="postgresql">PostgreSQL</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tipo de Operação:</label>
            <select value={operationType} onChange={(e) => setOperationType(e.target.value as any)}>
              <option value="insert">INSERT</option>
              <option value="update">UPDATE</option>
            </select>
          </div>

          <div className="form-group">
            <label>Código Inicial (6 dígitos):</label>
            <input
              type="text"
              value={startCode}
              onChange={(e) => setStartCode(e.target.value)}
              pattern="[0-9]{6}"
              maxLength={6}
              title="Digite um código de 6 dígitos"
            />
          </div>
        </div>

        <div className="step">
          <h2>3. Colunas Fixas (opcional)</h2>
          <div>
            {fixedColumns.map((fc, index) => (
              <div key={index} className="column-row">
                <input
                  type="text"
                  placeholder="Nome da Coluna"
                  value={fc.name}
                  onChange={(e) => updateFixedColumn(index, 'name', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Valor Padrão"
                  value={fc.value}
                  onChange={(e) => updateFixedColumn(index, 'value', e.target.value)}
                />
                <button onClick={() => removeFixedColumn(index)}>X</button>
              </div>
            ))}
            <button onClick={addColumnRow}>Adicionar Coluna Fixa</button>
          </div>

          <div className="import-section">
            <h3>Importar Colunas Fixas</h3>
            <p>
              Cole abaixo as colunas fixas no formato <code>coluna = valor</code> (uma por linha):
            </p>
            <textarea
              value={importFixedText}
              onChange={(e) => setImportFixedText(e.target.value)}
              placeholder={`Ex:
situação = Ativo
cod_ncm = 21069090
cst_rev = 0
st_rev = 102
elo_rev = 102
unidade = Und
CSOSN = 102
ELO = 102`}
            />
            <button onClick={importFixedColumns}>Importar Colunas</button>
          </div>
        </div>

        <div className="step">
          <h2>4. Colunas que Esperam String (opcional)</h2>
          <div className="string-columns-section">
            <p>
              Selecione quais colunas devem ser tratadas como strings (ex: preco_custo = '63,90'):
            </p>
            <div className="string-columns-grid">
              {columns.map((col) => (
                <div key={col} className="checkbox-container">
                  <input
                    type="checkbox"
                    id={`string_${col}`}
                    checked={stringColumns.has(col)}
                    onChange={() => toggleStringColumn(col)}
                  />
                  <label htmlFor={`string_${col}`}>{col}</label>
                </div>
              ))}
            </div>
            <div className="button-group">
              <button onClick={() => setStringColumns(new Set(columns))}>
                Selecionar Todas
              </button>
              <button onClick={() => setStringColumns(new Set())}>
                Desselecionar Todas
              </button>
            </div>
          </div>
        </div>

        <div className="step">
          <h2>5. Gerar e Visualizar SQL</h2>
          <button onClick={generateSQL}>Gerar Script SQL</button>

          {generatedSQL && (
            <>
              <div className="form-group" style={{ marginTop: '20px' }}>
                <label>SQL Gerado:</label>
                <textarea
                  className="sql-output"
                  value={generatedSQL}
                  onChange={(e) => setGeneratedSQL(e.target.value)}
                  spellCheck={false}
                />
              </div>
              <div className="button-group">
                <button onClick={copySQL}>Copiar</button>
                <button onClick={downloadSQL}>Baixar</button>
              </div>
            </>
          )}
        </div>
      </div>

      <footer>
        <p>
          © <span>&lt;/alldev&gt;</span> - Todos os direitos reservados -{' '}
          {new Date().getFullYear()}
        </p>
      </footer>
    </>
  )
}

export default App
