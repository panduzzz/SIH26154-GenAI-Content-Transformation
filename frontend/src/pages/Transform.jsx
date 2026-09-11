import { useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'

function Transform() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [transformation, setTransformation] = useState("summarize");
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (event) => {
    const file = event.target.files[0]

    if (file) {
      setSelectedFile(file)
      setResult('')
      setError('')
    }
  }

  const handleTransform = async () => {
    if (!selectedFile) {
      alert('Please select a file first.')
      return
    }

    if (!transformation) {
      alert('Please select a transformation type.')
      return
    }

    setIsLoading(true)
    setResult('')
    setError('')

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('transformation', transformation)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/transform',
        {
          method: 'POST',
          body: formData,
        },
      )

      if (!response.ok) {
        throw new Error('Transformation request failed')
      }

      const data = await response.json()

      setResult(data.transformed_text || data.extracted_text || 'No result returned.')
    } catch (error) {
      console.error(error)
       setError(error.message)
    }
      finally {
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

          <div className="upload-area">
            {selectedFile ? (
              <>
                <p>File selected</p>

                <span>{selectedFile.name}</span>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null)
                    setResult('')
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
                   accept=".pdf,.doc,.docx,.txt,.json,.csv,.png,.jpg,.jpeg,.webp,.bmp,.tiff,.heic,.mp3,.wav,.m4a,.mp4,.mpeg,.mpga,.webm"
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
        </section>
      )}

      {result && !isLoading && (
        <section className="result-card">
          <h2>Transformation Result</h2>

          <div className="result-content">
           {result.split('\n').map((line, index) => (
  <p key={index}>{line}</p>
))}          </div>
        </section>
      )}
    </DashboardLayout>
  )
}

export default Transform
