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

type Step = 'upload' | 'preview' | 'mapping' | 'validation' | 'execution'

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [data, setData] = useState<ExcelRow[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [sheetNames, setSheetNames] = useState<string[]>([])
  const [selectedSheet, setSelectedSheet] = useState<string>('')
  const [mappings, setMappings] = useState<ColumnMapping[]>([])
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [tableName, setTableName] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  const handleFileLoaded = async (uploadedFile: File) => {
    try {
      const result = await parseExcelFile(uploadedFile)
      setFile(uploadedFile)
      setData(result.data)
      setColumns(result.columns)
      setSheetNames(result.sheetNames)
      setSelectedSheet(result.sheetNames[0])
      setCurrentStep('preview')
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
    } catch (error) {
      alert('Erro ao trocar de aba: ' + error)
    }
  }

  const handleNextFromPreview = () => {
    if (!tableName.trim()) {
      alert('Por favor, digite o nome da tabela')
      return
    }
    setCurrentStep('mapping')
  }

  const handleNextFromMapping = () => {
    const hasKeyColumn = mappings.some(m => m.isKeyColumn)
    if (!hasKeyColumn) {
      alert('Selecione uma coluna chave antes de continuar')
      return
    }
    const validationResult = validateData(data, mappings)
    setValidation(validationResult)
    setCurrentStep('validation')
  }

  const handleNextFromValidation = () => {
    if (validation && !validation.isValid) {
      if (!confirm('Existem erros de validação. Deseja continuar mesmo assim?')) {
        return
      }
    }
    setCurrentStep('execution')
  }

  const handleExecute = async () => {
    if (!file) throw new Error('Nenhum arquivo selecionado')
    return await executeUpdates(tableName, data, mappings, file.name)
  }

  const resetAll = () => {
    setCurrentStep('upload')
    setFile(null)
    setData([])
    setColumns([])
    setSheetNames([])
    setSelectedSheet('')
    setMappings([])
    setValidation(null)
    setTableName('')
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">📊</span>
            <div className="logo-text">
              <h1>Excel DB Updater</h1>
              <p>Atualização profissional de banco de dados via Excel</p>
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
          <>
            <div className="progress-bar">
              <div className={`progress-step ${currentStep === 'upload' ? 'active' : ['preview', 'mapping', 'validation', 'execution'].includes(currentStep) ? 'completed' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-label">Upload</div>
              </div>
              <div className="progress-line"></div>
              <div className={`progress-step ${currentStep === 'preview' ? 'active' : ['mapping', 'validation', 'execution'].includes(currentStep) ? 'completed' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-label">Preview</div>
              </div>
              <div className="progress-line"></div>
              <div className={`progress-step ${currentStep === 'mapping' ? 'active' : ['validation', 'execution'].includes(currentStep) ? 'completed' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-label">Mapeamento</div>
              </div>
              <div className="progress-line"></div>
              <div className={`progress-step ${currentStep === 'validation' ? 'active' : currentStep === 'execution' ? 'completed' : ''}`}>
                <div className="step-number">4</div>
                <div className="step-label">Validação</div>
              </div>
              <div className="progress-line"></div>
              <div className={`progress-step ${currentStep === 'execution' ? 'active' : ''}`}>
                <div className="step-number">5</div>
                <div className="step-label">Execução</div>
              </div>
            </div>

            <div className="content">
              {currentStep === 'upload' && (
                <div className="step-content">
                  <FileUpload onFileLoaded={handleFileLoaded} />
                </div>
              )}

              {currentStep === 'preview' && (
                <div className="step-content">
                  <div className="config-section">
                    <label>Nome da Tabela no Banco de Dados:</label>
                    <input
                      type="text"
                      value={tableName}
                      onChange={(e) => setTableName(e.target.value)}
                      placeholder="Ex: produtos"
                      className="table-name-input"
                    />
                  </div>

                  {sheetNames.length > 1 && (
                    <div className="config-section">
                      <label>Selecione a Aba:</label>
                      <select
                        value={selectedSheet}
                        onChange={(e) => handleSheetChange(e.target.value)}
                        className="sheet-select"
                      >
                        {sheetNames.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <DataPreview data={data} columns={columns} />

                  <div className="action-buttons">
                    <button onClick={resetAll} className="button-secondary">
                      ← Voltar
                    </button>
                    <button onClick={handleNextFromPreview} className="button-primary">
                      Continuar →
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 'mapping' && (
                <div className="step-content">
                  <ColumnMapper
                    excelColumns={columns}
                    onMappingChange={setMappings}
                  />

                  <div className="action-buttons">
                    <button onClick={() => setCurrentStep('preview')} className="button-secondary">
                      ← Voltar
                    </button>
                    <button onClick={handleNextFromMapping} className="button-primary">
                      Validar Dados →
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 'validation' && validation && (
                <div className="step-content">
                  <ValidationPanel validation={validation} />

                  <div className="action-buttons">
                    <button onClick={() => setCurrentStep('mapping')} className="button-secondary">
                      ← Voltar
                    </button>
                    <button onClick={handleNextFromValidation} className="button-primary">
                      {validation.isValid ? 'Executar Atualização →' : 'Continuar Mesmo Assim →'}
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 'execution' && (
                <div className="step-content">
                  <ExecutionPanel
                    tableName={tableName}
                    recordCount={data.length}
                    onExecute={handleExecute}
                    disabled={false}
                  />

                  <div className="action-buttons">
                    <button onClick={() => setCurrentStep('validation')} className="button-secondary">
                      ← Voltar
                    </button>
                    <button onClick={resetAll} className="button-success">
                      ✓ Nova Operação
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
