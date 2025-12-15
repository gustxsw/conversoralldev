import { supabase } from '../lib/supabase'
import { ExcelRow, ColumnMapping, OperationResult } from '../types'
import { formatValueForDB } from './validator'

export async function executeUpdates(
  tableName: string,
  data: ExcelRow[],
  mappings: ColumnMapping[],
  fileName: string
): Promise<OperationResult> {
  const keyColumn = mappings.find(m => m.isKeyColumn)
  if (!keyColumn) {
    throw new Error('Nenhuma coluna chave definida')
  }

  const updateColumns = mappings.filter(m => !m.isKeyColumn)
  const errors: Array<{ row: number; error: string }> = []
  let successCount = 0

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const rowNumber = i + 2

    try {
      const keyValue = row[keyColumn.excelColumn]
      if (!keyValue) {
        errors.push({ row: rowNumber, error: 'Valor da chave está vazio' })
        continue
      }

      const setClauses: string[] = []
      updateColumns.forEach(mapping => {
        const value = row[mapping.excelColumn]
        const formattedValue = formatValueForDB(value, mapping.dataType)
        setClauses.push(`${mapping.dbColumn} = ${formattedValue}`)
      })

      const keyValueFormatted = formatValueForDB(keyValue, keyColumn.dataType)
      const updateSQL = `
        UPDATE ${tableName}
        SET ${setClauses.join(', ')}
        WHERE ${keyColumn.dbColumn} = ${keyValueFormatted}
      `

      const { error } = await supabase.rpc('execute_sql', { query: updateSQL })

      if (error) {
        errors.push({ row: rowNumber, error: error.message })
      } else {
        successCount++
      }
    } catch (error) {
      errors.push({ row: rowNumber, error: String(error) })
    }
  }

  const result: OperationResult = {
    success: errors.length === 0,
    recordsAffected: data.length,
    recordsSuccess: successCount,
    recordsFailed: errors.length,
    errors
  }

  await supabase.from('operation_history').insert({
    operation_type: 'update',
    table_name: tableName,
    records_affected: data.length,
    records_success: successCount,
    records_failed: errors.length,
    file_name: fileName,
    mapping_config: mappings,
    error_log: errors.length > 0 ? errors : null
  })

  return result
}
