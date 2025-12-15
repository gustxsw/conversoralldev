import { ValidationResult } from '../types'

interface ValidationPanelProps {
  validation: ValidationResult
}

export function ValidationPanel({ validation }: ValidationPanelProps) {
  const { errors, warnings } = validation

  if (errors.length === 0 && warnings.length === 0) {
    return (
      <div className="validation-panel success">
        <div className="validation-icon">✓</div>
        <div className="validation-content">
          <h3>Validação Concluída</h3>
          <p>Todos os dados estão corretos e prontos para atualização!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="validation-panel">
      {errors.length > 0 && (
        <div className="validation-section errors">
          <h3>❌ Erros ({errors.length})</h3>
          <div className="validation-messages">
            {errors.slice(0, 10).map((error, index) => (
              <div key={index} className="validation-message error">
                <span className="message-location">Linha {error.row}, Coluna "{error.column}":</span>
                <span className="message-text">{error.message}</span>
                {error.value !== null && (
                  <span className="message-value">Valor: "{error.value}"</span>
                )}
              </div>
            ))}
            {errors.length > 10 && (
              <div className="validation-more">
                E mais {errors.length - 10} erro(s)...
              </div>
            )}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="validation-section warnings">
          <h3>⚠️ Avisos ({warnings.length})</h3>
          <div className="validation-messages">
            {warnings.slice(0, 5).map((warning, index) => (
              <div key={index} className="validation-message warning">
                <span className="message-location">Linha {warning.row}, Coluna "{warning.column}":</span>
                <span className="message-text">{warning.message}</span>
                {warning.value !== null && (
                  <span className="message-value">Valor: "{warning.value}"</span>
                )}
              </div>
            ))}
            {warnings.length > 5 && (
              <div className="validation-more">
                E mais {warnings.length - 5} aviso(s)...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
