import { ExcelRow, ColumnMapping, ValidationResult, ValidationError, ValidationWarning } from '../types'

export function validateData(
  data: ExcelRow[],
  mappings: ColumnMapping[]
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  const keyColumn = mappings.find(m => m.isKeyColumn)

  if (!keyColumn) {
    errors.push({
      row: 0,
      column: 'general',
      message: 'Nenhuma coluna chave foi definida',
      value: null
    })
    return { isValid: false, errors, warnings }
  }

  const keyValues = new Set<string>()

  data.forEach((row, index) => {
    mappings.forEach(mapping => {
      const value = row[mapping.excelColumn]

      if (mapping.isKeyColumn) {
        if (value === null || value === undefined || value === '') {
          errors.push({
            row: index + 2,
            column: mapping.excelColumn,
            message: 'Coluna chave não pode estar vazia',
            value
          })
        } else {
          const keyStr = String(value)
          if (keyValues.has(keyStr)) {
            warnings.push({
              row: index + 2,
              column: mapping.excelColumn,
              message: 'Valor duplicado na coluna chave',
              value
            })
          }
          keyValues.add(keyStr)
        }
      }

      if (value !== null && value !== undefined && value !== '') {
        switch (mapping.dataType) {
          case 'number':
            const numStr = String(value).replace(',', '.')
            if (isNaN(Number(numStr))) {
              errors.push({
                row: index + 2,
                column: mapping.excelColumn,
                message: 'Valor deve ser numérico',
                value
              })
            }
            break

          case 'boolean':
            const boolValue = String(value).toLowerCase()
            if (!['true', 'false', '0', '1', 'sim', 'não'].includes(boolValue)) {
              warnings.push({
                row: index + 2,
                column: mapping.excelColumn,
                message: 'Valor booleano não reconhecido',
                value
              })
            }
            break

          case 'date':
            const dateValue = new Date(value)
            if (isNaN(dateValue.getTime())) {
              errors.push({
                row: index + 2,
                column: mapping.excelColumn,
                message: 'Formato de data inválido',
                value
              })
            }
            break
        }
      }
    })
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

export function formatValueForDB(value: any, dataType: string): string {
  if (value === null || value === undefined || value === '') {
    return 'NULL'
  }

  switch (dataType) {
    case 'number':
      return String(value).replace(',', '.')

    case 'boolean':
      const boolValue = String(value).toLowerCase()
      if (['true', '1', 'sim'].includes(boolValue)) return 'TRUE'
      if (['false', '0', 'não'].includes(boolValue)) return 'FALSE'
      return 'NULL'

    case 'string':
    default:
      return `'${String(value).replace(/'/g, "''")}'`
  }
}
