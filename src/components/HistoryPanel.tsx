import { useState, useEffect } from 'react'
import { OperationHistory } from '../types'
import { supabase } from '../lib/supabase'

export function HistoryPanel() {
  const [history, setHistory] = useState<OperationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('operation_history')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setHistory(data || [])
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR')
  }

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id)
  }

  if (loading) {
    return (
      <div className="history-panel">
        <h3>Histórico de Operações</h3>
        <div className="loading">Carregando...</div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="history-panel">
        <h3>Histórico de Operações</h3>
        <div className="empty-state">Nenhuma operação registrada ainda</div>
      </div>
    )
  }

  return (
    <div className="history-panel">
      <h3>Histórico de Operações</h3>
      <div className="history-list">
        {history.map((operation) => (
          <div key={operation.id} className="history-item">
            <div className="history-summary" onClick={() => toggleExpand(operation.id)}>
              <div className="history-main">
                <span className="history-table">{operation.table_name}</span>
                <span className="history-file">{operation.file_name}</span>
              </div>
              <div className="history-meta">
                <span className="history-date">{formatDate(operation.executed_at)}</span>
                <span className={`history-status ${operation.records_failed > 0 ? 'warning' : 'success'}`}>
                  {operation.records_success}/{operation.records_affected}
                </span>
                <span className="expand-icon">{expanded === operation.id ? '▼' : '▶'}</span>
              </div>
            </div>
            {expanded === operation.id && (
              <div className="history-details">
                <div className="detail-row">
                  <span className="detail-label">Tipo:</span>
                  <span className="detail-value">{operation.operation_type.toUpperCase()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Registros processados:</span>
                  <span className="detail-value">{operation.records_affected}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Sucesso:</span>
                  <span className="detail-value success">{operation.records_success}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Falhas:</span>
                  <span className="detail-value error">{operation.records_failed}</span>
                </div>
                {operation.error_log && (
                  <div className="detail-row">
                    <span className="detail-label">Erros:</span>
                    <pre className="detail-value error-log">
                      {JSON.stringify(operation.error_log, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
