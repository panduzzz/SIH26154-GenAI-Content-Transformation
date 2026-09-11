import { useRef, useState } from 'react'
import {
  ArrowUpRight,
  Check,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  Mic2,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'

function Transform() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [transformation, setTransformation] = useState('summarize')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [reviewed, setReviewed] = useState(false)
  const fileInputRef = useRef(null)

  const transformations = [
    { id: 'summarize', label: 'Summarize', note: 'The essential story, distilled.', icon: '✦' },
    { id: 'structured', label: 'Structure', note: 'Turn dense content into clear sections.', icon: '▦' },
    { id: 'qa', label: 'Q&A', note: 'Make the important answers discoverable.', icon: '?' },
    { id: 'translate', label: 'Translate', note: 'Prepare content for a wider audience.', icon: '文' },
    { id: 'simplify', label: 'Simplify', note: 'Make complex ideas easier to read.', icon: '≈' },
  ]

  const accept = '.pdf,.doc,.docx,.txt,.json,.csv,.png,.jpg,.jpeg,.webp,.bmp,.tiff,.heic,.mp3,.wav,.m4a,.mp4,.mpeg,.mpga,.webm'

  const chooseFile = (file) => {
    if (!file) return
    setSelectedFile(file)
    setResult('')
    setError('')
    setReviewed(false)
  }

  const handleFileChange = (event) => {
    chooseFile(event.target.files[0])
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    chooseFile(event.dataTransfer.files[0])
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
    setReviewed(false)

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

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const detail = data.detail || data.message || `Request failed with status ${response.status}`
        const requestId = data.request_id ? ` (Request ID: ${data.request_id})` : ''
        throw new Error(`${detail}${requestId}`)
      }

      setResult(data.transformed_text || data.extracted_text || 'No result returned.')
    } catch (error) {
      console.error('Transformation request failed', {
        filename: selectedFile.name,
        transformation,
        error,
      })
      setError(error instanceof Error ? error.message : 'An unexpected error occurred.')
    }
      finally {
      setIsLoading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setResult('')
    setError('')
    setReviewed(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const fileKind = selectedFile?.type?.startsWith('image')
    ? 'Image'
    : selectedFile?.type?.startsWith('audio')
      ? 'Audio'
      : selectedFile?.type?.startsWith('video')
        ? 'Video'
        : 'Document'

  const fileIcon = fileKind === 'Image' ? <ImageIcon size={18} /> : fileKind === 'Audio' || fileKind === 'Video' ? <Mic2 size={18} /> : <FileText size={18} />

  return (
    <DashboardLayout>
      <section className="studio-header">
        <div>
          <p className="eyebrow">THE TRANSFORMATION STUDIO</p>
          <h1>Give your ideas<br /><em>a new shape.</em></h1>
          <p className="subtitle">Bring in a document, image, or recording. We&apos;ll help you find the signal inside it.</p>
        </div>
        <div className="studio-status"><span className="status-dot" /> Prototype workspace <span className="status-divider" /> v1.0</div>
      </section>

      <section className="studio-grid">
        <div className="studio-panel source-panel">
          <div className="panel-heading"><div><span className="panel-index">01</span><h2>Bring in a source</h2></div><span className="panel-kicker">INPUT</span></div>
          <div className={`drop-zone ${isDragging ? 'is-dragging' : ''} ${selectedFile ? 'has-file' : ''}`} onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}>
            {selectedFile ? (
              <div className="selected-file">
                <div className="file-symbol">{fileIcon}</div>
                <div className="file-copy"><strong>{selectedFile.name}</strong><span>{fileKind} · {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span></div>
                <button className="icon-button" type="button" onClick={removeFile} aria-label="Remove selected file"><X size={18} /></button>
              </div>
            ) : (
              <>
                <div className="upload-mark"><UploadCloud size={26} strokeWidth={1.5} /></div>
                <strong>{isDragging ? 'Drop it here' : 'Drop your source here'}</strong>
                <span>PDFs, images, audio, and video files</span>
                <button className="outline-button" type="button" onClick={() => fileInputRef.current?.click()}>Browse files <ArrowUpRight size={15} /></button>
              </>
            )}
            <input ref={fileInputRef} type="file" onChange={handleFileChange} accept={accept} />
          </div>
          <div className="source-footnote"><span>⌁</span> Your source stays local to this prototype session.</div>
        </div>

        <div className="studio-panel transform-panel">
          <div className="panel-heading"><div><span className="panel-index">02</span><h2>Choose a direction</h2></div><span className="panel-kicker">MODE</span></div>
          <div className="transformation-list">
            {transformations.map((item) => (
              <button key={item.id} type="button" className={`transformation-item ${transformation === item.id ? 'is-selected' : ''}`} onClick={() => setTransformation(item.id)}>
                <span className="transformation-icon">{item.icon}</span><span className="transformation-copy"><strong>{item.label}</strong><small>{item.note}</small></span>{transformation === item.id && <Check size={17} />}
              </button>
            ))}
          </div>
          <button className="primary-button" type="button" onClick={handleTransform} disabled={isLoading || !selectedFile}>{isLoading ? <><LoaderCircle className="spin" size={17} /> Working through it...</> : <><Sparkles size={17} /> Transform this source <ArrowUpRight size={16} /></>}</button>
        </div>
      </section>

      {isLoading && (
        <section className="result-panel processing-panel"><div className="processing-line"><span className="processing-pulse" /><div><h2>Finding the signal...</h2><p>Extracting your content and shaping the first pass.</p></div><span className="processing-label">IN PROGRESS</span></div>
        </section>
      )}

      {error && (
        <section className="result-panel error-panel"><div><span className="panel-kicker">COULD NOT COMPLETE</span><h2>Something needs another look.</h2><p>{error}</p></div><button className="outline-button" type="button" onClick={handleTransform}>Try again <ArrowUpRight size={15} /></button>
        </section>
      )}

      {result && !isLoading && (
        <section className="result-panel result-panel-main"><div className="result-heading"><div><span className="panel-index">03</span><span className="panel-kicker">YOUR NEW VERSION</span><h2>{transformations.find((item) => item.id === transformation)?.label} of {selectedFile?.name}</h2></div><button className={`review-button ${reviewed ? 'is-reviewed' : ''}`} type="button" onClick={() => setReviewed(!reviewed)}>{reviewed ? <><Check size={16} /> Reviewed</> : 'Mark as reviewed'}</button></div><div className="result-content">{result.split('\n').map((line, index) => <p key={index}>{line || '\u00a0'}</p>)}</div><div className="result-footer"><span>{reviewed ? 'Ready to share' : 'A first pass for your review'}</span><span>{result.length.toLocaleString()} characters</span></div>
        </section>
      )}
    </DashboardLayout>
  )
}

export default Transform
