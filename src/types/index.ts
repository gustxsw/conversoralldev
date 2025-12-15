export interface ExcelRow {
  [key: string]: string | number | null
}

export interface ColumnMapping {
  excelColumn: string
  dbColumn: string
  isKeyColumn: boolean
  dataType: 'string' | 'number' | 'boolean' | 'date'
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  row: number
  column: string
  message: string
  value: any
}

export interface ValidationWarning {
  row: number
  column: string
  message: string
  value: any
}

export interface UpdatePreview {
  keyValue: string | number
  updates: Record<string, any>
  currentValues?: Record<string, any>
}

export interface OperationResult {
  success: boolean
  recordsAffected: number
  recordsSuccess: number
  recordsFailed: number
  errors: Array<{
    row: number
    error: string
  }>
}

export interface OperationHistory {
  id: string
  operation_type: string
  table_name: string
  records_affected: number
  records_success: number
  records_failed: number
  file_name: string
  mapping_config: ColumnMapping[]
  error_log: any
  executed_at: string
  created_at: string
}
