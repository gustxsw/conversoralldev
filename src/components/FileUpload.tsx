import { useState, useRef } from 'react'

interface FileUploadProps {
  onFileLoaded: (file: File) => void
}

export function FileUpload({ onFileLoaded }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      onFileLoaded(file)
    } else {
      alert('Por favor, selecione um arquivo Excel (.xlsx ou .xls)')
    }
  }

  const onButtonClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className="file-upload-container">
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        <div className="upload-icon">📊</div>
        <p className="upload-text">
          Arraste seu arquivo Excel aqui ou clique para selecionar
        </p>
        <p className="upload-subtext">Formatos suportados: .xlsx, .xls</p>
      </div>
    </div>
  )
}
