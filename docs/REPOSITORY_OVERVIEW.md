# GenAI Content Transformation Platform

## Purpose

This repository is a Smart India Hackathon 2026 prototype for a GenAI content transformation platform. A user uploads content, selects a transformation, and receives extracted and transformed text through a web interface.

The current implementation is a working vertical slice for PDF, image, and audio uploads. Despite the product name, the transformation logic currently uses deterministic Python text-processing functions; it does not yet call an external large language model or translation service.

## Repository Structure

| Path | Responsibility | Current state |
| --- | --- | --- |
| `backend/main.py` | FastAPI application, upload endpoint, file-type dispatch, OCR, speech transcription | Implemented |
| `backend/services/pdf_extractor.py` | Text extraction from PDF pages | Implemented |
| `backend/services/transformer.py` | Summary, simplification, Q&A, structure, and translation-preview functions | Implemented as prototype logic |
| `frontend/src/App.jsx` | React Router route definitions | Implemented |
| `frontend/src/pages/Dashboard.jsx` | Landing dashboard and feature cards | Implemented as UI; two cards are placeholders |
| `frontend/src/pages/Transform.jsx` | File selection, transformation selection, API call, and result display | Implemented |
| `frontend/src/components/Sidebar.jsx` | Sidebar navigation | Implemented; History and Settings are placeholders |
| `frontend/src/layouts/DashboardLayout.jsx` | Shared sidebar and main-content layout | Implemented |
| `frontend/src/index.css` | Application styling and responsive layout rules | Implemented |
| `ai/` | Reserved for AI-related code | Empty except for `.gitkeep` |
| `database/` | Reserved for persistence | Empty except for `.gitkeep` |
| `pipelines/` | Reserved for processing pipelines | Empty except for `.gitkeep` |
| `sample-data/` | Reserved for sample inputs | Empty except for `.gitkeep` |
| `tests/` | Reserved for automated tests | Empty except for `.gitkeep` |
| `docs/` | Documentation | Contains this overview |

## Backend

The backend is a FastAPI application named `GenAI Content Transformation Platform`, version `1.0.0`.

### Endpoints

- `GET /` returns a simple API-running message and success status.
- `GET /api/health` returns a healthy backend status.
- `POST /api/transform` accepts a multipart upload with:
  - `file`: the uploaded file.
  - `transformation`: one of the transformation names supported by the transformer service.

The API enables CORS for `http://localhost:5173`, which is the default frontend development origin.

### Upload processing

The `/api/transform` endpoint reads the complete file into memory and dispatches based on the filename extension:

- **PDF**: `pypdf.PdfReader` extracts text from every page. Page text is joined with blank lines.
- **Images**: Pillow opens the image and `pytesseract.image_to_string` performs OCR. Supported extensions include PNG, JPEG, BMP, TIFF, and WebP.
- **Audio/video files**: the file is written to a temporary file, then the locally loaded Whisper `base` model transcribes it. The temporary file is removed in a `finally` block. Supported extensions include MP3, WAV, M4A, MP4, MPEG, MPGA, and WebM.
- **Other extensions**: the API returns an empty extracted and transformed result with a generic file-received message. It does not parse DOC, DOCX, TXT, JSON, or CSV yet, even though the frontend file picker lists some of them.

For supported processing paths, the response includes the original filename, selected transformation, extracted text length, extracted text, and transformed text.

### External/runtime dependencies

The backend imports FastAPI, Whisper, Pillow, pytesseract, and pypdf. Whisper loads the `base` model during application startup, so startup requires the model to be available or downloadable and can take significant time. OCR is configured with the Windows-specific executable path:

`C:\Program Files\Tesseract-OCR\tesseract.exe`

The repository currently does not contain a backend `requirements.txt`, `pyproject.toml`, or equivalent dependency lockfile.

## Transformation Service

`backend/services/transformer.py` exposes `transform_text(text, transformation)` and routes to the following functions:

- **Summarize**: normalizes newlines, splits on periods, filters out short sentences, and returns up to five sentences.
- **Simplify**: returns up to eight qualifying sentences as a bullet list. It does not perform semantic simplification yet.
- **Q&A**: creates up to five generic questions and uses qualifying source sentences as answers.
- **Structured data**: labels up to eight qualifying sentences as document sections. It does not return JSON or another machine-readable schema.
- **Translate**: returns a translation preview containing the original content. It does not translate languages yet.
- **Unknown transformation**: returns the input text unchanged.

Empty or whitespace-only input receives the message `No text was extracted from the document.`. Sentence parsing is intentionally simple and can be affected by abbreviations, punctuation, or documents without periods.

## Frontend

The frontend is a Vite React application using React 19, React Router, and Lucide icons.

### Routes

- `/` renders the dashboard.
- `/transform` renders the upload and transformation workflow.

### Dashboard

The dashboard presents three feature cards:

1. Document Transformation: links conceptually to the transformation workflow, but its button currently has no click handler.
2. Content Generation: displayed as a planned capability; its button has no implementation.
3. Content Analysis: displayed as a planned capability; its button has no implementation.

### Transformation workflow

The Transform page:

1. Lets the user select a file from the browser file picker.
2. Lists PDF, office/document, text/data, image, and audio/video extensions in the input's `accept` attribute.
3. Lets the user choose summarize, structured data, Q&A, translate, or simplify.
4. Sends the file and transformation as `FormData` to `http://127.0.0.1:8000/api/transform`.
5. Displays a loading state, an error state, or the returned transformed text.
6. Allows the selected file to be removed before submitting.

The UI currently describes drag-and-drop, but no drag-and-drop event handlers are implemented. Results are rendered as one paragraph per newline, so richer structured output is not specially formatted.

The sidebar provides working Dashboard and Transform routes. History and Settings are visual navigation items only and currently point to `#`.

## End-to-End Flow

```text
Browser
  -> React Transform page
  -> multipart POST /api/transform
  -> FastAPI extension dispatch
  -> PDF extraction, OCR, or Whisper transcription
  -> deterministic transformation function
  -> JSON response
  -> transformed text rendered in the React result panel
```

## Implemented Versus Planned

### Implemented

- FastAPI service with health and root endpoints.
- Multipart upload handling.
- PDF text extraction.
- Image OCR.
- Audio/video transcription with Whisper.
- Five selectable transformation modes.
- React dashboard and transformation screen.
- Backend request integration from the frontend.
- Basic loading, error, file removal, and result states.
- Responsive CSS layouts for desktop and narrower screens.

### Planned or incomplete

- Real LLM-based content transformation.
- Real multilingual translation.
- Parsing for DOC, DOCX, TXT, JSON, and CSV files.
- Drag-and-drop uploads despite the UI wording.
- Persistent transformation history.
- Settings and user/account management.
- Content generation and content analysis dashboard actions.
- Database storage.
- Dedicated processing pipelines.
- Automated backend or frontend tests.
- Backend dependency and environment configuration files.
- Production configuration for API URLs, CORS, upload limits, authentication, and error handling.

## Running the Prototype

### Frontend

From `frontend/`:

```bash
npm install
npm run dev
```

The Vite development server normally runs at `http://localhost:5173`.

### Backend

Run the FastAPI application from the repository environment with an ASGI server, for example:

```bash
uvicorn backend.main:app --reload --port 8000
```

The backend environment must provide the imported Python packages, a working Tesseract installation at the configured Windows path for OCR, and a usable Whisper model/runtime for audio transcription.

## Current Technical Risks

- The Whisper model is loaded globally at import time, which increases startup cost and can prevent the API from starting when model dependencies are unavailable.
- Entire uploads are held in memory, and there are no file-size, content-type, timeout, or rate limits.
- File-type detection trusts the filename extension.
- Unsupported files are accepted by the frontend and acknowledged by the backend without meaningful processing.
- Error responses are not normalized for the frontend, and extraction failures can surface as generic request errors.
- The hard-coded Tesseract path and hard-coded frontend API URL reduce portability.
- There is no persistence, authentication, authorization, or audit trail.
