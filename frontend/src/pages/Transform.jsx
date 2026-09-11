import { useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
const MAX_FILE_SIZE = 25 * 1024 * 1024
const SUPPORTED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'bmp', 'tiff', 'webp', 'mp3', 'wav', 'm4a', 'mp4', 'mpeg', 'mpga', 'webm']

function Transform() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [transformation, setTransformation] = useState('summarize')
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const selectFile = (file) => {
    if (!file) return

    const extension = file.name.split('.').pop().toLowerCase()
    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      setError(`Unsupported file type. Choose one of: ${SUPPORTED_EXTENSIONS.join(', ')}.`)
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. The maximum upload size is 25 MB.')
      return
    }

    setSelectedFile(file)
    setResult(null)
    setError('')
  }

  const handleFileChange = (event) => selectFile(event.target.files[0])

  const handleTransform = async () => {
    if (!selectedFile) {
      setError('Please select a file first.')
      return
    }

    if (!transformation) {
      setError('Please select a transformation type.')
      return
    }

    setIsLoading(true)
    setResult(null)
    setError('')

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('transformation', transformation)

    try {
      const response = await fetch(`${API_BASE_URL}/api/transform`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Transformation request failed')
      }

      setResult(await response.json())
    } catch (requestError) {
      console.error(requestError)
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <section className="dashboard-header">
        <p className="eyebrow">CONTENT TRANSFORMATION</p>

        <h1>Transform Your Content</h1>

        <p className="subtitle">
          Upload your content and choose how you want our GenAI platform to
          transform it.
        </p>
      </section>

      <section className="transform-container">
        <div className="upload-card">
          <h2>Upload Content</h2>

          <p>
            Upload a document, text file, or other supported content to begin.
          </p>

          <div
            className={`upload-area${isDragging ? ' is-dragging' : ''}`}
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setIsDragging(false)
              selectFile(event.dataTransfer.files[0])
            }}
          >
            {selectedFile ? (
              <>
                <p>File selected</p>

                <span>{selectedFile.name}</span>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null)
                    setResult(null)
                    setError('')
                  }}
                >
                  Remove File
                </button>
              </>
            ) : (
              <>
                <p>Drag & drop your file here</p>

                <span>or</span>

                <label className="file-button">
                  Choose File

                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.tiff,.mp3,.wav,.m4a,.mp4,.mpeg,.mpga,.webm"
                  />
                </label>
              </>
            )}
          </div>
        </div>

        <div className="transform-options-card">
          <h2>Choose Transformation</h2>

          <label>
            Transformation type

            <select
              value={transformation}
              onChange={(event) => setTransformation(event.target.value)}
            >
              <option value="summarize">Summarize Content</option>
              <option value="structured">Convert to Structured Data</option>
              <option value="qa">Generate Questions & Answers</option>
              <option value="translate">Translate Content</option>
              <option value="simplify">Simplify Content</option>
            </select>
          </label>

          <button
            className="primary-button"
            type="button"
            onClick={handleTransform}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Start Transformation'}
          </button>
        </div>
      </section>

      {isLoading && (
        <section className="result-card">
          <h2>Processing Your Content...</h2>
          <p>Please wait while the backend processes your document.</p>
        </section>
      )}

      {error && (
        <section className="result-card">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          {selectedFile && (
            <button className="primary-button" type="button" onClick={handleTransform} disabled={isLoading}>
              Retry Transformation
            </button>
          )}
        </section>
      )}

      {result && !isLoading && (
        <section className="result-card">
          <h2>Transformation Result</h2>

          <div className="result-meta">
            <span>{result.filename}</span>
            <span>{result.transformation}</span>
            <span>{result.text_length} extracted characters</span>
          </div>

          <div className="result-content">
            {(result.transformed_text || result.extracted_text || 'No result returned.')
              .split('\n')
              .map((line, index) => <p key={index}>{line || '\u00a0'}</p>)}
          </div>
        </section>
      )}
    </DashboardLayout>
  )
}

export default Transform
