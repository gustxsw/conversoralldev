import { useState } from 'react'
import { ColumnMapping } from '../types'

interface ColumnMapperProps {
  excelColumns: string[]
  onMappingChange: (mappings: ColumnMapping[]) => void
  initialMappings?: ColumnMapping[]
}

const DATA_TYPES = [
  { value: 'string', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'boolean', label: 'Booleano' },
  { value: 'date', label: 'Data' }
]

export function ColumnMapper({ excelColumns, onMappingChange, initialMappings }: ColumnMapperProps) {
  const [mappings, setMappings] = useState<ColumnMapping[]>(
    initialMappings || excelColumns.map(col => ({
      excelColumn: col,
      dbColumn: col.toLowerCase().replace(/\s+/g, '_'),
      isKeyColumn: false,
      dataType: 'string'
    }))
  )

  const updateMapping = (index: number, field: keyof ColumnMapping, value: any) => {
    const newMappings = [...mappings]

    if (field === 'isKeyColumn' && value === true) {
      newMappings.forEach((m, i) => {
        if (i !== index) m.isKeyColumn = false
      })
    }

    newMappings[index] = { ...newMappings[index], [field]: value }
    setMappings(newMappings)
    onMappingChange(newMappings)
  }

  const hasKeyColumn = mappings.some(m => m.isKeyColumn)

  return (
    <div className="column-mapper">
      <div className="mapper-header">
        <h3>Mapeamento de Colunas</h3>
        {!hasKeyColumn && (
          <div className="warning-badge">
            ⚠️ Selecione uma coluna chave (código/ID)
          </div>
        )}
      </div>
      <div className="mapper-table">
        <table>
          <thead>
            <tr>
              <th>Coluna Excel</th>
              <th>Nome no Banco</th>
              <th>Tipo de Dado</th>
              <th>Coluna Chave</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((mapping, index) => (
              <tr key={mapping.excelColumn} className={mapping.isKeyColumn ? 'key-row' : ''}>
                <td className="excel-column">
                  {mapping.isKeyColumn && <span className="key-icon">🔑</span>}
                  {mapping.excelColumn}
                </td>
                <td>
                  <input
                    type="text"
                    value={mapping.dbColumn}
                    onChange={(e) => updateMapping(index, 'dbColumn', e.target.value)}
                    className="db-column-input"
                  />
                </td>
                <td>
                  <select
                    value={mapping.dataType}
                    onChange={(e) => updateMapping(index, 'dataType', e.target.value)}
                    className="data-type-select"
                  >
                    {DATA_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="key-column">
                  <input
                    type="radio"
                    checked={mapping.isKeyColumn}
                    onChange={(e) => updateMapping(index, 'isKeyColumn', e.target.checked)}
                    name="keyColumn"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
