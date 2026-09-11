# SIH26154-GenAI-Content-Transformation
SIH 2026 Prototype – Gen AI Platform for Automated Content Transformation

## Run the MVP

### Backend

Install Python dependencies from `backend/requirements.txt`, then make sure
Tesseract OCR and FFmpeg are installed for image and audio/video processing.
Copy `.env.example` values into your environment as needed.

From the repository root:

```powershell
python -m uvicorn backend.main:app --reload
```

The API is available at `http://127.0.0.1:8000` and the health check is
`http://127.0.0.1:8000/api/health`.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The frontend defaults to `http://127.0.0.1:8000` for the backend. Set
`VITE_API_BASE_URL` in `frontend/.env.local` when the backend runs elsewhere.

The current MVP supports PDF, image, audio, and video uploads up to 25 MB.
Unsupported formats and empty extraction results return clear errors instead of
being reported as successful transformations.
