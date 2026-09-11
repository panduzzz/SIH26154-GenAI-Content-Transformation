# Running the Application

This guide explains how to start the frontend and backend on Windows.

## Prerequisites

Install the following tools:

- Python 3.12 or compatible Python 3 version.
- Node.js and npm.
- Tesseract OCR for image processing.
- FFmpeg if audio/video processing requires it in the local Whisper environment.

The application currently uses:

- Frontend: React, Vite, and React Router.
- Backend: FastAPI and Uvicorn.
- PDF extraction: `pypdf`.
- Image OCR: Tesseract through `pytesseract`.
- Audio/video transcription: Whisper.

## Project Directory

Open PowerShell in the repository root:

```powershell
cd "C:\Users\mahes\Documents\pandu\SIH26154-GenAI-Content-Transformation"
```

## First-Time Setup

### 1. Configure the Python environment

The project uses a virtual environment named `.venv`.

If it does not exist, create it:

```powershell
python -m venv .venv
```

Install backend dependencies:

```powershell
.\.venv\Scripts\python.exe -m pip install fastapi uvicorn python-multipart pypdf pillow pytesseract openai-whisper
```

### 2. Install frontend dependencies

```powershell
cd frontend
npm install
cd ..
```

### 3. Install Tesseract OCR

Image uploads require the Tesseract executable. Install it with an Administrator PowerShell:

```powershell
winget install --id UB-Mannheim.TesseractOCR -e --accept-source-agreements --accept-package-agreements
```

The backend automatically checks these locations:

- `TESSERACT_CMD` environment variable.
- Tesseract on `PATH`.
- `C:\Program Files\Tesseract-OCR\tesseract.exe`.
- `C:\Program Files (x86)\Tesseract-OCR\tesseract.exe`.

After installing Tesseract, close and reopen the terminal before starting the backend.

## Start the Backend

Open the first PowerShell terminal at the repository root:

```powershell
cd "C:\Users\mahes\Documents\pandu\SIH26154-GenAI-Content-Transformation"
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

The backend should be available at:

- API root: http://127.0.0.1:8000/
- Health check: http://127.0.0.1:8000/api/health
- Interactive API documentation: http://127.0.0.1:8000/docs

A successful health response looks like this:

```json
{
  "status": "healthy",
  "service": "backend",
  "ocr_available": true
}
```

For image processing, `ocr_available` must be `true`. The backend logs the Tesseract path during startup.

Keep this terminal open while using the application. Press `Ctrl+C` to stop the backend.

## Start the Frontend

Open a second PowerShell terminal:

```powershell
cd "C:\Users\mahes\Documents\pandu\SIH26154-GenAI-Content-Transformation\frontend"
npm run dev -- --host 127.0.0.1 --port 5173
```

The frontend should be available at:

- Dashboard: http://127.0.0.1:5173/
- Transformation page: http://127.0.0.1:5173/transform

Keep this terminal open while using the application. Press `Ctrl+C` to stop the frontend.

## Using the Application

1. Open http://127.0.0.1:5173/.
2. Select **Transform** from the sidebar.
3. Upload a supported PDF, image, audio, or video file.
4. Select a transformation such as **Summarize**.
5. Click **Transform this source**.
6. Review the result in the output panel.

Supported working input categories:

- PDF files: extracted with `pypdf`.
- PNG, JPG, JPEG, WebP, BMP, and TIFF files: read with Tesseract OCR.
- MP3, WAV, M4A, MP4, MPEG, MPGA, and WebM files: transcribed with Whisper.

## Troubleshooting

### The frontend does not start

Check that dependencies are installed:

```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

If Vite reports a Node.js engine error, use a current Node.js 20 LTS or Node.js 22 LTS release. The project is pinned to Vite 6 for compatibility with Node.js 20.11.

### The backend does not start

Check that the virtual environment and dependencies are available:

```powershell
.\.venv\Scripts\python.exe -c "import fastapi, uvicorn, whisper, pytesseract, PIL, pypdf; print('backend dependencies available')"
```

If imports fail, reinstall the backend dependencies from the repository root.

Whisper loads the `base` model during backend startup. The first startup can take longer because the model may need to be downloaded.

### Image transformation says Tesseract is unavailable

Check the health endpoint:

```powershell
curl.exe http://127.0.0.1:8000/api/health
```

If `ocr_available` is `false`:

1. Install Tesseract OCR.
2. Close and reopen the backend terminal.
3. Restart Uvicorn.
4. Check the health endpoint again.

If Tesseract is installed somewhere else, set its path before starting the backend:

```powershell
$env:TESSERACT_CMD = "D:\Path\To\tesseract.exe"
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

### The frontend cannot reach the backend

Make sure both services are running and that the backend is using port `8000`. The frontend sends transformation requests to:

```text
http://127.0.0.1:8000/api/transform
```

The backend allows requests from both `http://localhost:5173` and `http://127.0.0.1:5173`.

### A transformation fails

Watch the backend terminal while submitting the file. Each request logs:

- Request ID.
- Filename and content type.
- File size.
- Extraction stage.
- Extracted text length.
- Exception type and traceback when a failure occurs.

The browser error message includes the request ID. Use it to match the browser failure with the backend log.

## Optional Frontend Checks

From the `frontend/` directory:

```powershell
npm run build
npm run lint
```

These commands build the production bundle and run ESLint.
