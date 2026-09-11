# MVP Implementation Plan

## Project

**GenAI Platform for Automated Content Transformation**

## Presentation Summary

The MVP demonstrates a single, complete user journey:

```text
Upload content -> extract text -> select transformation -> generate output -> review result
```

The current prototype already demonstrates PDF extraction, image OCR, audio/video transcription, a React interface, and five transformation options. The next MVP work is to make this flow reliable, clearly presented, and ready for extension into a full GenAI platform.

The MVP is intentionally narrower than the final product. It proves the core value: converting different types of content into useful readable outputs from one interface.

## MVP Objective

Build a demonstrable web application that allows a user to:

1. Upload a PDF, image, audio file, or video file.
2. Extract readable text using PDF parsing, OCR, or Whisper transcription.
3. Select a transformation such as summary, simplified content, Q&A, structured report, or translation preview.
4. Receive a transformed result in the browser.
5. Inspect the result and understand which input and transformation produced it.

## Current MVP Status

| Capability | Status | Evidence |
| --- | --- | --- |
| React dashboard | Implemented | `frontend/src/pages/Dashboard.jsx` |
| Upload and transformation page | Implemented | `frontend/src/pages/Transform.jsx` |
| PDF extraction | Implemented | `backend/services/pdf_extractor.py` |
| Image OCR | Implemented | Tesseract integration in `backend/main.py` |
| Audio/video transcription | Implemented | Whisper integration in `backend/main.py` |
| Summary transformation | Implemented as prototype | `backend/services/transformer.py` |
| Simplification transformation | Implemented as prototype | `backend/services/transformer.py` |
| Q&A generation | Implemented as prototype | `backend/services/transformer.py` |
| Structured output | Implemented as text prototype | `backend/services/transformer.py` |
| Translation | Preview only | No actual language translation yet |
| Real LLM integration | Not implemented | Current logic is deterministic Python processing |
| Human review workflow | Not implemented | Result is displayed but not reviewed or approved |
| History/database | Not implemented | `database/` is currently empty |
| Automated tests | Not implemented | `tests/` is currently empty |

## MVP Scope

### Included in the MVP

- PDF, PNG/JPG/WebP/BMP/TIFF, MP3/WAV/M4A/MP4/WebM input.
- File selection through the browser.
- Text extraction from the selected content.
- Five transformation choices:
  - Summarize content.
  - Simplify content.
  - Generate basic questions and answers.
  - Convert content into a structured text report.
  - Prepare a translation preview.
- Result display with loading and error states.
- Basic health endpoint for backend availability.
- A simple human review step represented by the user inspecting the generated result before use.

### Explicitly outside the MVP

- User accounts and authentication.
- Persistent database history.
- Multi-user collaboration.
- Real-time processing updates.
- Advanced RAG and organization-specific knowledge bases.
- Production-grade confidence scoring.
- Automatic retention and deletion policies.
- Full DOC/DOCX/CSV/JSON processing.
- Fully automated deployment and monitoring.

These are planned extensions, not missing claims about the MVP.

## MVP Architecture

```text
React + Vite frontend
        |
        | multipart HTTP request
        v
FastAPI backend
        |
        +--> PDF extractor (pypdf)
        +--> Image OCR (Tesseract)
        +--> Audio/video transcription (Whisper)
        |
        v
Prototype transformation service
        |
        v
JSON response with extracted and transformed text
        |
        v
Result displayed for user review
```

## MVP User Flow

### 1. Open the platform

The user opens the dashboard and sees the purpose of the platform and the available transformation workflow.

### 2. Select Transform

The user opens the Transform page from the sidebar.

### 3. Upload a file

The user selects a supported file. The interface displays the selected filename and allows it to be removed before processing.

### 4. Select a transformation

The user chooses one of the available transformation types from the dropdown.

### 5. Start processing

The frontend sends the file and selected transformation to `POST /api/transform`.

### 6. Extract and transform

The backend selects the correct extraction method based on the file extension, then passes the extracted text to the transformation service.

### 7. Review the result

The frontend displays the transformed result. For the MVP presentation, this is the human verification point: the user checks whether the output is useful and accurate.

## MVP Implementation Steps

### Phase 1: Make the existing demo reliable

1. Add a backend dependency file such as `requirements.txt` or `pyproject.toml`.
2. Document required system tools: Tesseract OCR and FFmpeg/Whisper runtime dependencies.
3. Add a `.env.example` file for configurable paths and API settings.
4. Replace the hard-coded frontend backend URL with an environment variable.
5. Add clear backend error responses for invalid files, extraction failures, and unsupported formats.
6. Add file size and supported-extension validation.
7. Test one representative PDF, image, and audio file end to end.

**Deliverable:** the current vertical slice can be started and demonstrated consistently.

### Phase 2: Improve the MVP transformation experience

1. Keep the current deterministic transformations for the first demo if an LLM API is not available.
2. Label the output accurately as prototype-generated or rule-based where appropriate.
3. Improve the result panel so headings, bullet points, and Q&A output are readable.
4. Show the filename, transformation type, extracted character count, and processing status.
5. Add a clear empty-result message when extraction finds no text.
6. Add a retry action after a failed request.
7. Make the dashboard transformation button navigate to `/transform`.
8. Clearly mark Content Generation, History, and Settings as planned features until they are implemented.

**Deliverable:** the interface communicates the MVP workflow clearly during a live presentation.

### Phase 3: Add a real GenAI transformation layer

1. Create a provider interface for an LLM instead of calling a model directly from the API route.
2. Add configuration for the selected LLM provider and API key through environment variables.
3. Create versioned prompts for summarization, simplification, Q&A, and structured reports.
4. Send normalized extracted text to the model.
5. Add token limits and chunk long content before processing.
6. Validate structured responses before displaying them.
7. Store model name and prompt version in the response metadata.
8. Keep the current deterministic transformer as a fallback for offline demonstrations.

**Deliverable:** the MVP can truthfully demonstrate GenAI-assisted transformation while retaining a reliable fallback.

### Phase 4: Add a lightweight verification experience

1. Display extracted text and transformed text in separate sections.
2. Add a simple confidence label based on extraction success and output validation.
3. Add Approve, Regenerate, and Edit actions in the result view.
4. Mark approved output as reviewed in the frontend state.
5. Explain that this is the first version of the human-in-the-loop requirement.

**Deliverable:** the presentation can demonstrate that generated output is reviewed before being treated as final.

### Phase 5: Add MVP tests and presentation fixtures

1. Add unit tests for PDF extraction and every transformation mode.
2. Add API tests for health checks, supported uploads, unsupported files, and empty extraction.
3. Add frontend checks for file selection, loading, error, and result states.
4. Add small sample files under `sample-data/`.
5. Prepare one known-good demo scenario and one failure scenario.
6. Record expected outputs for repeatable presentation testing.

**Deliverable:** the demo path is repeatable and failures can be explained rather than improvised.

## Suggested MVP API Contract

### Existing transformation request

```http
POST /api/transform
Content-Type: multipart/form-data

file=<uploaded file>
transformation=summarize
```

### Recommended response shape

```json
{
  "message": "Content processed successfully",
  "filename": "example.pdf",
  "input_type": "pdf",
  "transformation": "summarize",
  "status": "completed",
  "extracted_text": "...",
  "transformed_text": "...",
  "text_length": 1250,
  "confidence": null,
  "review_status": "not_reviewed"
}
```

`confidence` can remain `null` in the initial MVP. The field is included so a later confidence-scoring implementation does not require a breaking response redesign.

## Recommended Demo Script

1. Open the dashboard and explain the problem: useful information is trapped in documents, images, audio, and video.
2. Navigate to Transform.
3. Upload a prepared PDF containing several paragraphs.
4. Select **Summarize Content**.
5. Start the transformation and show the processing state.
6. Explain that the backend extracts the PDF text and sends it through the transformation service.
7. Show the summary result.
8. Repeat with an image to demonstrate OCR, or use a short audio file to demonstrate Whisper transcription.
9. Select **Generate Questions & Answers** to show a second output format.
10. Explain the next-stage roadmap: real LLM integration, confidence scoring, human review, history, and audit trails.

## Presentation Talking Points

- The MVP establishes a multimodal ingestion-to-output pipeline.
- The architecture separates extraction from transformation, allowing OCR, Whisper, and future models to be replaced independently.
- The current prototype proves the workflow before adding the cost and operational complexity of external LLM services.
- Human review is part of the target design because generated content must be checked for accuracy.
- The next engineering priority is replacing deterministic prototype transformations with a configurable GenAI provider.
- PostgreSQL, RAG, audit trails, and privacy controls are planned production extensions rather than claims of current completion.

## Risks and Honest Limitations

- The current transformation service is not yet a real LLM integration.
- Translation currently returns a preview and does not translate between languages.
- DOC, DOCX, TXT, JSON, and CSV are listed by the frontend but are not fully parsed by the backend.
- Results are not persisted after the request.
- There is no authentication, authorization, database, audit trail, or production retention policy.
- Whisper loads during backend startup and may require model downloads and additional system dependencies.
- Uploads are currently held in memory and do not have production-grade size or security controls.
- The drag-and-drop wording exists in the UI, but actual drag-and-drop handlers are not implemented yet.

## MVP Success Criteria

The MVP is successful when a presenter can show all of the following in one session:

- The frontend starts and connects to the backend.
- A supported file can be selected and submitted.
- The backend extracts text using the correct modality-specific tool.
- At least two transformation modes produce understandable results.
- Loading, failure, and empty-result states are visible and understandable.
- The user can inspect the result before accepting it.
- The presenter can clearly distinguish implemented functionality from the roadmap.

## Post-MVP Roadmap

1. Replace rule-based transformation with real LLM providers.
2. Add DOCX, TXT, JSON, and CSV extractors.
3. Add asynchronous jobs and progress tracking.
4. Add PostgreSQL persistence and transformation history.
5. Add confidence scoring and a full human review workflow.
6. Add RAG and source citations for grounded answers.
7. Add authentication, authorization, encryption, and automatic deletion.
8. Add Docker, CI/CD, monitoring, evaluation datasets, and load testing.
