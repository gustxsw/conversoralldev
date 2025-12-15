import * as XLSX from 'xlsx'
import { ExcelRow } from '../types'

export function parseExcelFile(file: File): Promise<{
  data: ExcelRow[]
  columns: string[]
  sheetNames: string[]
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })

        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: null
        }) as ExcelRow[]

        const columns = jsonData.length > 0 ? Object.keys(jsonData[0]) : []

        resolve({
          data: jsonData,
          columns,
          sheetNames: workbook.SheetNames
        })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = (error) => reject(error)
    reader.readAsBinaryString(file)
  })
}

export function changeSheet(file: File, sheetName: string): Promise<{
  data: ExcelRow[]
  columns: string[]
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const worksheet = workbook.Sheets[sheetName]

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: null
        }) as ExcelRow[]

        const columns = jsonData.length > 0 ? Object.keys(jsonData[0]) : []

        resolve({
          data: jsonData,
          columns
        })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = (error) => reject(error)
    reader.readAsBinaryString(file)
  })
}
