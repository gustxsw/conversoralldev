import { useState } from 'react'
import { OperationResult } from '../types'

interface ExecutionPanelProps {
  tableName: string
  recordCount: number
  onExecute: () => Promise<OperationResult>
  disabled: boolean
}

export function ExecutionPanel({ tableName, recordCount, onExecute, disabled }: ExecutionPanelProps) {
  const [executing, setExecuting] = useState(false)
  const [result, setResult] = useState<OperationResult | null>(null)

  const handleExecute = async () => {
    if (!confirm(`Você está prestes a atualizar ${recordCount} registros na tabela "${tableName}".\n\nDeseja continuar?`)) {
      return
    }

    setExecuting(true)
    setResult(null)

    try {
      const operationResult = await onExecute()
      setResult(operationResult)
    } catch (error) {
      setResult({
        success: false,
        recordsAffected: recordCount,
        recordsSuccess: 0,
        recordsFailed: recordCount,
        errors: [{ row: 0, error: String(error) }]
      })
    } finally {
      setExecuting(false)
    }
  }

  return (
    <div className="execution-panel">
      <div className="execution-header">
        <h3>Executar Atualização</h3>
      </div>

      <div className="execution-info">
        <div className="info-item">
          <span className="info-label">Tabela:</span>
          <span className="info-value">{tableName}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Registros:</span>
          <span className="info-value">{recordCount}</span>
        </div>
      </div>

      <button
        className="execute-button"
        onClick={handleExecute}
        disabled={disabled || executing}
      >
        {executing ? (
          <>
            <span className="spinner"></span>
            Executando...
          </>
        ) : (
          '▶️ Executar Atualização'
        )}
      </button>

      {result && (
        <div className={`execution-result ${result.success ? 'success' : 'error'}`}>
          <div className="result-header">
            {result.success ? '✓ Operação Concluída' : '❌ Operação Concluída com Erros'}
          </div>
          <div className="result-stats">
            <div className="stat">
              <span className="stat-label">Total:</span>
              <span className="stat-value">{result.recordsAffected}</span>
            </div>
            <div className="stat success">
              <span className="stat-label">Sucesso:</span>
              <span className="stat-value">{result.recordsSuccess}</span>
            </div>
            <div className="stat error">
              <span className="stat-label">Falhas:</span>
              <span className="stat-value">{result.recordsFailed}</span>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="result-errors">
              <h4>Erros:</h4>
              {result.errors.slice(0, 5).map((error, index) => (
                <div key={index} className="error-item">
                  Linha {error.row}: {error.error}
                </div>
              ))}
              {result.errors.length > 5 && (
                <div className="error-more">
                  E mais {result.errors.length - 5} erro(s)...
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
