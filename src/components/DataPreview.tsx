import { ExcelRow } from '../types'

interface DataPreviewProps {
  data: ExcelRow[]
  columns: string[]
  maxRows?: number
}

export function DataPreview({ data, columns, maxRows = 10 }: DataPreviewProps) {
  const displayData = data.slice(0, maxRows)

  return (
    <div className="data-preview">
      <div className="preview-header">
        <h3>Preview dos Dados</h3>
        <span className="preview-info">
          Mostrando {displayData.length} de {data.length} linhas
        </span>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="row-number">#</th>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, index) => (
              <tr key={index}>
                <td className="row-number">{index + 2}</td>
                {columns.map((col) => (
                  <td key={col}>{String(row[col] ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
