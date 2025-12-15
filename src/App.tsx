import { useState } from 'react'
import { FileUpload } from './components/FileUpload'
import { parseExcelFile } from './utils/excelParser'
import { ExcelRow } from './types'
import { HistoryPanel } from './components/HistoryPanel'

interface FixedColumn {
  name: string
  value: string
}

interface ColumnMapping {
  excelColumn: string
  dbColumn: string
  include: boolean
}

function App() {
  const [showHistory, setShowHistory] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [data, setData] = useState<ExcelRow[]>([])
  const [excelColumns, setExcelColumns] = useState<string[]>([])

  const [tableName, setTableName] = useState('')
  const [operationType, setOperationType] = useState<'insert' | 'update'>('update')
  const [startCode, setStartCode] = useState('000001')
  const [useSequentialCode, setUseSequentialCode] = useState(false)
  const [dbType, setDbType] = useState('firebird')

  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([])
  const [whereColumn, setWhereColumn] = useState('')

  const [fixedColumns, setFixedColumns] = useState<FixedColumn[]>([{ name: '', value: '' }])
  const [importFixedText, setImportFixedText] = useState('')

  const [stringColumns, setStringColumns] = useState<Set<string>>(new Set())

  const [previewSQL, setPreviewSQL] = useState('')
  const [generatedSQL, setGeneratedSQL] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const handleFileLoaded = async (uploadedFile: File) => {
    try {
      const result = await parseExcelFile(uploadedFile)
      setFile(uploadedFile)
      setData(result.data)
      setExcelColumns(result.columns)

      const initialMappings = result.columns.map(col => ({
        excelColumn: col,
        dbColumn: col.toLowerCase().replace(/\s+/g, '_'),
        include: true
      }))
      setColumnMappings(initialMappings)

      if (result.columns.length > 0 && operationType === 'update') {
        setWhereColumn(result.columns[0])
      }
    } catch (error) {
      alert('Erro ao ler o arquivo: ' + error)
    }
  }

  const updateColumnMapping = (index: number, field: keyof ColumnMapping, value: any) => {
    const newMappings = [...columnMappings]
    newMappings[index] = { ...newMappings[index], [field]: value }
    setColumnMappings(newMappings)
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

  const generatePreview = () => {
    if (!tableName.trim()) {
      alert('Preencha o nome da tabela!')
      return
    }

    if (!data.length) {
      alert('Nenhum dado para processar!')
      return
    }

    const includedColumns = columnMappings.filter(m => m.include)
    if (!includedColumns.length) {
      alert('Selecione pelo menos uma coluna para incluir!')
      return
    }

    if (operationType === 'update' && !whereColumn) {
      alert('Selecione a coluna para a condição WHERE!')
      return
    }

    if (operationType === 'update') {
      const whereColumnExists = data[0][whereColumn] !== undefined
      if (!whereColumnExists) {
        alert(`A coluna "${whereColumn}" não existe nos dados do Excel!`)
        return
      }

      const emptyWhereValues = data.filter(row => !row[whereColumn] || row[whereColumn] === '').length
      if (emptyWhereValues > 0) {
        alert(`⚠️ Atenção: ${emptyWhereValues} linha(s) tem valor vazio na coluna WHERE "${whereColumn}".\nEstas linhas serão ignoradas.`)
      }
    }

    const defaultColumns: Record<string, string> = {}
    fixedColumns.forEach((fc) => {
      if (fc.name && fc.value) {
        defaultColumns[fc.name] = fc.value
      }
    })

    let preview = '-- PREVIEW (primeiras 2 linhas)\n-- Total de linhas que serão processadas: ' + data.length + '\n\n'
    const previewCount = Math.min(2, data.length)

    for (let i = 0; i < previewCount; i++) {
      const row = data[i]
      const code = useSequentialCode ? parseInt(startCode) + i : null

      if (operationType === 'insert') {
        const allColumns = [
          ...(useSequentialCode ? ['codigo'] : []),
          ...includedColumns.map(m => m.dbColumn),
          ...Object.keys(defaultColumns)
        ]

        const values = [
          ...(useSequentialCode ? [`'${formatCode(code!)}'`] : []),
          ...includedColumns.map(m => formatValue(row[m.excelColumn], m.dbColumn)),
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

        preview += `INSERT INTO ${tableName} (${allColumns.join(', ')}) VALUES (${values.join(', ')});\n`
      } else {
        if (!row[whereColumn] || row[whereColumn] === '') {
          preview += `-- Linha ${i + 2}: IGNORADA (WHERE vazio)\n`
          continue
        }

        const setClauses: string[] = []
        includedColumns.forEach((m) => {
          if (m.excelColumn !== whereColumn) {
            setClauses.push(`${m.dbColumn} = ${formatValue(row[m.excelColumn], m.dbColumn)}`)
          }
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

        const whereMapping = columnMappings.find(m => m.excelColumn === whereColumn)
        const whereDbColumn = whereMapping?.dbColumn || whereColumn
        const whereValue = formatValue(row[whereColumn], whereDbColumn)

        preview += `UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE ${whereDbColumn} = ${whereValue};\n`
      }
    }

    if (data.length > 2) {
      preview += `\n-- ... e mais ${data.length - 2} linha(s)`
    }

    setPreviewSQL(preview)
    setShowPreview(true)
  }

  const generateFullSQL = () => {
    const includedColumns = columnMappings.filter(m => m.include)
    const defaultColumns: Record<string, string> = {}
    fixedColumns.forEach((fc) => {
      if (fc.name && fc.value) {
        defaultColumns[fc.name] = fc.value
      }
    })

    let sqlScript = ''
    let currentCode = parseInt(startCode)
    let ignoredCount = 0

    data.forEach((row) => {
      if (operationType === 'insert') {
        const allColumns = [
          ...(useSequentialCode ? ['codigo'] : []),
          ...includedColumns.map(m => m.dbColumn),
          ...Object.keys(defaultColumns)
        ]

        const values = [
          ...(useSequentialCode ? [`'${formatCode(currentCode)}'`] : []),
          ...includedColumns.map(m => formatValue(row[m.excelColumn], m.dbColumn)),
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
        currentCode++
      } else {
        if (!row[whereColumn] || row[whereColumn] === '') {
          ignoredCount++
          return
        }

        const setClauses: string[] = []
        includedColumns.forEach((m) => {
          if (m.excelColumn !== whereColumn) {
            setClauses.push(`${m.dbColumn} = ${formatValue(row[m.excelColumn], m.dbColumn)}`)
          }
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

        const whereMapping = columnMappings.find(m => m.excelColumn === whereColumn)
        const whereDbColumn = whereMapping?.dbColumn || whereColumn
        const whereValue = formatValue(row[whereColumn], whereDbColumn)

        sqlScript += `UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE ${whereDbColumn} = ${whereValue};\n`
      }
    })

    if (ignoredCount > 0) {
      sqlScript = `-- ${ignoredCount} linha(s) ignorada(s) por ter WHERE vazio\n\n` + sqlScript
    }

    setGeneratedSQL(sqlScript)
    setShowPreview(false)
    alert(`SQL gerado com sucesso!\n${data.length - ignoredCount} comando(s) criado(s)${ignoredCount > 0 ? `\n${ignoredCount} linha(s) ignorada(s)` : ''}`)
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
            1. Faça upload do arquivo Excel no <b>Passo 1</b>.<br />
            2. Configure nome da tabela, tipo de operação e banco no <b>Passo 2</b>.<br />
            3. Mapeie as colunas Excel → Banco e escolha a coluna WHERE (UPDATE) no <b>Passo 3</b>.<br />
            4. Adicione colunas fixas se precisar no <b>Passo 4</b>.<br />
            5. Marque colunas que devem ser strings no <b>Passo 5</b>.<br />
            6. Veja o <b>Preview</b> e depois gere o SQL completo no <b>Passo 6</b>.
          </p>
        </div>

        <div className="step">
          <h2>1. Upload do Excel</h2>
          <FileUpload onFileLoaded={handleFileLoaded} />

          {file && (
            <div className="file-info">
              ✓ Arquivo carregado: <strong>{file.name}</strong> ({data.length} linhas, {excelColumns.length} colunas)
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
                      {excelColumns.map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 5).map((row, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        {excelColumns.map((col) => (
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
          <h2>2. Configurações Básicas</h2>

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

          {operationType === 'insert' && (
            <>
              <div className="checkbox-container" style={{ marginBottom: '15px' }}>
                <input
                  type="checkbox"
                  id="useSequentialCode"
                  checked={useSequentialCode}
                  onChange={(e) => setUseSequentialCode(e.target.checked)}
                />
                <label htmlFor="useSequentialCode">Adicionar código sequencial</label>
              </div>

              {useSequentialCode && (
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
              )}
            </>
          )}
        </div>

        {columnMappings.length > 0 && (
          <div className="step">
            <h2>3. Mapeamento de Colunas</h2>

            {operationType === 'update' && (
              <div className="form-group" style={{ background: '#fff3cd', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
                <label style={{ color: '#856404', fontWeight: 'bold' }}>⚠️ Coluna para Condição WHERE (obrigatório):</label>
                <select
                  value={whereColumn}
                  onChange={(e) => setWhereColumn(e.target.value)}
                  style={{ borderColor: '#ffc107', borderWidth: '2px' }}
                >
                  <option value="">-- Selecione a coluna chave --</option>
                  {excelColumns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <p style={{ fontSize: '13px', color: '#856404', marginTop: '8px', marginBottom: 0 }}>
                  Esta coluna será usada no WHERE. Ex: WHERE codigo = valor_da_planilha
                </p>
              </div>
            )}

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Incluir</th>
                    <th>Coluna Excel</th>
                    <th>Nome no Banco</th>
                    {operationType === 'update' && <th>WHERE</th>}
                  </tr>
                </thead>
                <tbody>
                  {columnMappings.map((mapping, index) => (
                    <tr key={mapping.excelColumn} style={{ background: mapping.excelColumn === whereColumn ? '#fff3cd' : 'transparent' }}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={mapping.include}
                          onChange={(e) => updateColumnMapping(index, 'include', e.target.checked)}
                          disabled={operationType === 'update' && mapping.excelColumn === whereColumn}
                        />
                      </td>
                      <td style={{ fontWeight: mapping.excelColumn === whereColumn ? 'bold' : 'normal' }}>
                        {mapping.excelColumn}
                        {mapping.excelColumn === whereColumn && ' 🔑'}
                      </td>
                      <td>
                        <input
                          type="text"
                          value={mapping.dbColumn}
                          onChange={(e) => updateColumnMapping(index, 'dbColumn', e.target.value)}
                          style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                      </td>
                      {operationType === 'update' && (
                        <td style={{ textAlign: 'center' }}>
                          {mapping.excelColumn === whereColumn && '✓'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="step">
          <h2>4. Colunas Fixas (opcional)</h2>
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
ativo = TRUE`}
            />
            <button onClick={importFixedColumns}>Importar Colunas</button>
          </div>
        </div>

        <div className="step">
          <h2>5. Forçar como String (opcional)</h2>
          <div className="string-columns-section">
            <p>
              Marque as colunas que devem SEMPRE ser tratadas como texto (útil para códigos, CEPs, etc):
            </p>
            <div className="string-columns-grid">
              {excelColumns.map((col) => (
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
              <button onClick={() => setStringColumns(new Set(excelColumns))}>
                Selecionar Todas
              </button>
              <button onClick={() => setStringColumns(new Set())}>
                Desselecionar Todas
              </button>
            </div>
          </div>
        </div>

        <div className="step">
          <h2>6. Preview e Geração do SQL</h2>

          <button onClick={generatePreview}>🔍 Ver Preview (2 primeiras linhas)</button>

          {showPreview && previewSQL && (
            <>
              <div className="validation-panel success" style={{ marginTop: '15px' }}>
                <h3>Preview do SQL</h3>
                <p>Revise as primeiras linhas antes de gerar o SQL completo:</p>
              </div>
              <div className="form-group">
                <textarea
                  className="sql-output"
                  value={previewSQL}
                  readOnly
                  style={{ minHeight: '200px' }}
                />
              </div>
              <div className="button-group">
                <button onClick={generateFullSQL} style={{ background: '#28a745' }}>
                  ✓ Está correto! Gerar SQL Completo
                </button>
                <button onClick={() => setShowPreview(false)} className="secondary">
                  ← Voltar e Ajustar
                </button>
              </div>
            </>
          )}

          {generatedSQL && !showPreview && (
            <>
              <div className="validation-panel success" style={{ marginTop: '15px' }}>
                <h3>✓ SQL Gerado com Sucesso!</h3>
                <p>Revise, edite se necessário, e copie ou baixe o script.</p>
              </div>
              <div className="form-group">
                <label>SQL Completo:</label>
                <textarea
                  className="sql-output"
                  value={generatedSQL}
                  onChange={(e) => setGeneratedSQL(e.target.value)}
                  spellCheck={false}
                />
              </div>
              <div className="button-group">
                <button onClick={copySQL}>📋 Copiar</button>
                <button onClick={downloadSQL}>💾 Baixar</button>
                <button onClick={() => { setGeneratedSQL(''); setShowPreview(false); }} className="secondary">
                  🔄 Gerar Novo
                </button>
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
