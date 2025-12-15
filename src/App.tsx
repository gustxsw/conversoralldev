import { useState } from 'react'
import { FileUpload } from './components/FileUpload'
import { DataPreview } from './components/DataPreview'
import { ColumnMapper } from './components/ColumnMapper'
import { ValidationPanel } from './components/ValidationPanel'
import { ExecutionPanel } from './components/ExecutionPanel'
import { HistoryPanel } from './components/HistoryPanel'
import { parseExcelFile, changeSheet } from './utils/excelParser'
import { validateData } from './utils/validator'
import { executeUpdates } from './utils/dbExecutor'
import { ExcelRow, ColumnMapping, ValidationResult } from './types'

interface FixedColumn {
  name: string
  value: string
}

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [data, setData] = useState<ExcelRow[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [sheetNames, setSheetNames] = useState<string[]>([])
  const [selectedSheet, setSelectedSheet] = useState<string>('')

  const [tableName, setTableName] = useState('')
  const [operationType, setOperationType] = useState<'insert' | 'update'>('update')
  const [startCode, setStartCode] = useState('000001')

  const [fixedColumns, setFixedColumns] = useState<FixedColumn[]>([{ name: '', value: '' }])
  const [stringColumns, setStringColumns] = useState<Set<string>>(new Set())

  const [mappings, setMappings] = useState<ColumnMapping[]>([])
  const [generatedSQL, setGeneratedSQL] = useState('')
  const [validation, setValidation] = useState<ValidationResult | null>(null)

  const [showHistory, setShowHistory] = useState(false)

  const handleFileLoaded = async (uploadedFile: File) => {
    try {
      const result = await parseExcelFile(uploadedFile)
      setFile(uploadedFile)
      setData(result.data)
      setColumns(result.columns)
      setSheetNames(result.sheetNames)
      setSelectedSheet(result.sheetNames[0])

      const initialMappings = result.columns.map(col => ({
        excelColumn: col,
        dbColumn: col.toLowerCase().replace(/\s+/g, '_'),
        isKeyColumn: false,
        dataType: 'string' as const
      }))
      setMappings(initialMappings)
    } catch (error) {
      alert('Erro ao ler o arquivo: ' + error)
    }
  }

  const handleSheetChange = async (sheetName: string) => {
    if (!file) return
    try {
      const result = await changeSheet(file, sheetName)
      setData(result.data)
      setColumns(result.columns)
      setSelectedSheet(sheetName)

      const initialMappings = result.columns.map(col => ({
        excelColumn: col,
        dbColumn: col.toLowerCase().replace(/\s+/g, '_'),
        isKeyColumn: false,
        dataType: 'string' as const
      }))
      setMappings(initialMappings)
    } catch (error) {
      alert('Erro ao trocar de aba: ' + error)
    }
  }

  const addFixedColumn = () => {
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

  const toggleStringColumn = (column: string) => {
    const newSet = new Set(stringColumns)
    if (newSet.has(column)) {
      newSet.delete(column)
    } else {
      newSet.add(column)
    }
    setStringColumns(newSet)
  }

  const formatValue = (value: any, column: string, dataType: string): string => {
    if (value === null || value === undefined || value === '') {
      return 'NULL'
    }

    if (stringColumns.has(column)) {
      return `'${String(value).replace(/'/g, "''")}'`
    }

    if (dataType === 'number') {
      return String(value).replace(',', '.')
    }

    if (dataType === 'boolean') {
      const boolValue = String(value).toLowerCase()
      if (['true', '1', 'sim'].includes(boolValue)) return 'TRUE'
      if (['false', '0', 'não'].includes(boolValue)) return 'FALSE'
      return 'NULL'
    }

    return `'${String(value).replace(/'/g, "''")}'`
  }

  const generateSQL = () => {
    if (!tableName.trim()) {
      alert('Digite o nome da tabela')
      return
    }

    const keyColumn = mappings.find(m => m.isKeyColumn)
    if (!keyColumn && operationType === 'update') {
      alert('Selecione uma coluna chave para UPDATE')
      return
    }

    const validationResult = validateData(data, mappings)
    setValidation(validationResult)

    if (!validationResult.isValid) {
      if (!confirm('Há erros de validação. Deseja gerar o SQL mesmo assim?')) {
        return
      }
    }

    let sql = ''
    let currentCode = parseInt(startCode)

    const activeFixedColumns = fixedColumns.filter(fc => fc.name && fc.value)

    data.forEach((row) => {
      if (operationType === 'insert') {
        const allColumns = ['codigo', ...mappings.map(m => m.dbColumn), ...activeFixedColumns.map(fc => fc.name)]

        const values = [
          `'${currentCode.toString().padStart(6, '0')}'`,
          ...mappings.map(m => formatValue(row[m.excelColumn], m.dbColumn, m.dataType)),
          ...activeFixedColumns.map(fc => formatValue(fc.value, fc.name, 'string'))
        ]

        sql += `INSERT INTO ${tableName} (${allColumns.join(', ')}) VALUES (${values.join(', ')});\n`
      } else {
        const setClauses = [
          ...mappings.filter(m => !m.isKeyColumn).map(m =>
            `${m.dbColumn} = ${formatValue(row[m.excelColumn], m.dbColumn, m.dataType)}`
          ),
          ...activeFixedColumns.map(fc =>
            `${fc.name} = ${formatValue(fc.value, fc.name, 'string')}`
          )
        ]

        const keyValue = formatValue(row[keyColumn!.excelColumn], keyColumn!.dbColumn, keyColumn!.dataType)
        sql += `UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE ${keyColumn!.dbColumn} = ${keyValue};\n`
      }

      currentCode++
    })

    setGeneratedSQL(sql)
  }

  const copySQL = () => {
    if (!generatedSQL) {
      alert('Gere o SQL primeiro')
      return
    }
    navigator.clipboard.writeText(generatedSQL)
    alert('SQL copiado para a área de transferência!')
  }

  const downloadSQL = () => {
    if (!generatedSQL) {
      alert('Gere o SQL primeiro')
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

  const handleExecute = async () => {
    if (!generatedSQL) {
      throw new Error('Gere o SQL primeiro')
    }
    if (!file) {
      throw new Error('Nenhum arquivo selecionado')
    }
    return await executeUpdates(tableName, data, mappings, file.name)
  }

  const resetAll = () => {
    setFile(null)
    setData([])
    setColumns([])
    setSheetNames([])
    setSelectedSheet('')
    setTableName('')
    setOperationType('update')
    setStartCode('000001')
    setFixedColumns([{ name: '', value: '' }])
    setStringColumns(new Set())
    setMappings([])
    setGeneratedSQL('')
    setValidation(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">📊</span>
            <div className="logo-text">
              <h1>Excel DB Updater Pro</h1>
              <p>Controle total para profissionais de banco de dados</p>
            </div>
          </div>
          <button className="history-button" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? '← Voltar' : '📋 Histórico'}
          </button>
        </div>
      </header>

      <div className="app-container">
        {showHistory ? (
          <HistoryPanel />
        ) : (
          <div className="main-content">
            <div className="left-panel">
              <section className="config-section">
                <h2>1. Upload do Arquivo</h2>
                <FileUpload onFileLoaded={handleFileLoaded} />

                {file && (
                  <div className="file-info">
                    ✓ Arquivo carregado: <strong>{file.name}</strong>
                    <span className="file-stats">({data.length} linhas)</span>
                  </div>
                )}
              </section>

              {data.length > 0 && (
                <>
                  <section className="config-section">
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
                      <label>Tipo de Operação:</label>
                      <select value={operationType} onChange={(e) => setOperationType(e.target.value as any)}>
                        <option value="update">UPDATE</option>
                        <option value="insert">INSERT</option>
                      </select>
                    </div>

                    {operationType === 'insert' && (
                      <div className="form-group">
                        <label>Código Inicial (6 dígitos):</label>
                        <input
                          type="text"
                          value={startCode}
                          onChange={(e) => setStartCode(e.target.value)}
                          pattern="[0-9]{6}"
                          maxLength={6}
                        />
                      </div>
                    )}

                    {sheetNames.length > 1 && (
                      <div className="form-group">
                        <label>Aba do Excel:</label>
                        <select value={selectedSheet} onChange={(e) => handleSheetChange(e.target.value)}>
                          {sheetNames.map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </section>

                  <section className="config-section">
                    <h2>3. Preview dos Dados</h2>
                    <DataPreview data={data} columns={columns} maxRows={5} />
                  </section>

                  <section className="config-section">
                    <h2>4. Mapeamento de Colunas</h2>
                    <ColumnMapper
                      excelColumns={columns}
                      onMappingChange={setMappings}
                      initialMappings={mappings}
                    />
                  </section>

                  <section className="config-section">
                    <h2>5. Colunas Fixas (Valores Padrão)</h2>
                    <div className="fixed-columns">
                      {fixedColumns.map((fc, index) => (
                        <div key={index} className="fixed-column-row">
                          <input
                            type="text"
                            placeholder="Nome da coluna"
                            value={fc.name}
                            onChange={(e) => updateFixedColumn(index, 'name', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Valor padrão"
                            value={fc.value}
                            onChange={(e) => updateFixedColumn(index, 'value', e.target.value)}
                          />
                          <button
                            className="btn-remove"
                            onClick={() => removeFixedColumn(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button className="btn-add" onClick={addFixedColumn}>
                        + Adicionar Coluna Fixa
                      </button>
                    </div>
                  </section>

                  <section className="config-section">
                    <h2>6. Forçar como String</h2>
                    <div className="string-columns-grid">
                      {columns.map(col => (
                        <label key={col} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={stringColumns.has(col)}
                            onChange={() => toggleStringColumn(col)}
                          />
                          <span>{col}</span>
                        </label>
                      ))}
                    </div>
                    <div className="string-actions">
                      <button onClick={() => setStringColumns(new Set(columns))}>
                        Marcar Todas
                      </button>
                      <button onClick={() => setStringColumns(new Set())}>
                        Desmarcar Todas
                      </button>
                    </div>
                  </section>

                  <section className="config-section">
                    <button className="btn-generate" onClick={generateSQL}>
                      ⚡ Gerar SQL
                    </button>
                    <button className="btn-reset" onClick={resetAll}>
                      🔄 Resetar Tudo
                    </button>
                  </section>
                </>
              )}
            </div>

            <div className="right-panel">
              {validation && (
                <section className="result-section">
                  <h2>Validação</h2>
                  <ValidationPanel validation={validation} />
                </section>
              )}

              {generatedSQL && (
                <section className="result-section">
                  <h2>SQL Gerado</h2>
                  <div className="sql-preview">
                    <div className="sql-header">
                      <span className="sql-info">
                        {data.length} comando(s) | {generatedSQL.length} caracteres
                      </span>
                      <div className="sql-actions">
                        <button onClick={copySQL}>📋 Copiar</button>
                        <button onClick={downloadSQL}>💾 Baixar</button>
                      </div>
                    </div>
                    <textarea
                      className="sql-editor"
                      value={generatedSQL}
                      onChange={(e) => setGeneratedSQL(e.target.value)}
                      spellCheck={false}
                    />
                  </div>
                </section>
              )}

              {generatedSQL && (
                <section className="result-section">
                  <h2>Executar no Banco (Opcional)</h2>
                  <div className="execution-warning">
                    <p>⚠️ <strong>Atenção:</strong> Esta ação executará o SQL acima diretamente no banco de dados.</p>
                    <p>Revise o SQL antes de executar. Você também pode copiar e executar manualmente.</p>
                  </div>
                  <ExecutionPanel
                    tableName={tableName}
                    recordCount={data.length}
                    onExecute={handleExecute}
                    disabled={!generatedSQL}
                  />
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
