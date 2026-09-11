from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from functools import lru_cache
import tempfile
import os
import pytesseract
from PIL import Image
import io

from backend.services.pdf_extractor import extract_text_from_pdf
from backend.services.transformer import transform_text


app = FastAPI(
    title="GenAI Content Transformation Platform",
    description="Backend API for SIH26154",
    version="1.0.0",
)

MAX_UPLOAD_SIZE = int(os.getenv("MAX_UPLOAD_SIZE_BYTES", str(25 * 1024 * 1024)))
TESSERACT_CMD = os.getenv("TESSERACT_CMD")
if TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD

SUPPORTED_EXTENSIONS = {
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".bmp",
    ".tiff",
    ".webp",
    ".mp3",
    ".wav",
    ".m4a",
    ".mp4",
    ".mpeg",
    ".mpga",
    ".webm",
}
SUPPORTED_TRANSFORMATIONS = {"summarize", "simplify", "qa", "structured", "translate"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load Whisper only when an audio or video file is submitted.
@lru_cache(maxsize=1)
def get_whisper_model():
    import whisper

    return whisper.load_model(os.getenv("WHISPER_MODEL", "base"))


@app.get("/")
def root():
    return {
        "message": "GenAI Content Transformation Platform API is running",
        "status": "success",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "backend",
    }


@app.post("/api/transform")
async def transform_content(
    file: UploadFile = File(...),
    transformation: str = Form(...),
):
    file_bytes = await file.read()

    filename = file.filename or ""
    lower_filename = filename.lower()
    extension = os.path.splitext(lower_filename)[1]

    if not filename:
        raise HTTPException(status_code=400, detail="A filename is required.")

    if extension not in SUPPORTED_EXTENSIONS:
        supported = ", ".join(sorted(SUPPORTED_EXTENSIONS))
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type. Supported extensions: {supported}",
        )

    if len(file_bytes) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File is too large. Maximum size is {MAX_UPLOAD_SIZE // (1024 * 1024)} MB.",
        )

    transformation = transformation.lower().strip()
    if transformation not in SUPPORTED_TRANSFORMATIONS:
        raise HTTPException(status_code=400, detail="Unsupported transformation type.")

    # ---------------- PDF ----------------
    try:
        if extension == ".pdf":
            extracted_text = extract_text_from_pdf(file_bytes)

        # ---------------- IMAGE ----------------
        elif extension in {".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".webp"}:
            image = Image.open(io.BytesIO(file_bytes))
            extracted_text = pytesseract.image_to_string(image).strip()

        # ---------------- AUDIO ----------------
        else:
            temp_path = None
            try:
                with tempfile.NamedTemporaryFile(
                    delete=False,
                    suffix=extension,
                ) as temp_file:
                    temp_file.write(file_bytes)
                    temp_path = temp_file.name

                result = get_whisper_model().transcribe(temp_path)
                extracted_text = result["text"].strip()
            finally:
                if temp_path and os.path.exists(temp_path):
                    os.remove(temp_path)
    except Exception as error:
        raise HTTPException(status_code=422, detail=f"Unable to extract content: {error}") from error

    if not extracted_text:
        raise HTTPException(status_code=422, detail="No readable text was extracted from the file.")

    transformed_text = transform_text(extracted_text, transformation)

    return {
        "message": "Content processed successfully",
        "filename": filename,
        "input_type": extension.removeprefix("."),
        "transformation": transformation,
        "status": "completed",
        "text_length": len(extracted_text),
        "extracted_text": extracted_text,
        "transformed_text": transformed_text,
        "confidence": None,
        "review_status": "not_reviewed",
    }