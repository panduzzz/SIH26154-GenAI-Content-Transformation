from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import whisper
import tempfile
import os
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
from PIL import Image
import io

from backend.services.pdf_extractor import extract_text_from_pdf
from backend.services.transformer import transform_text


app = FastAPI(
    title="GenAI Content Transformation Platform",
    description="Backend API for SIH26154",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load Whisper model
whisper_model = whisper.load_model("base")


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

    # ---------------- PDF ----------------
    if lower_filename.endswith(".pdf"):
        extracted_text = extract_text_from_pdf(file_bytes)

        transformed_text = transform_text(
            extracted_text,
            transformation,
        )

        return {
            "message": "PDF processed successfully",
            "filename": filename,
            "transformation": transformation,
            "text_length": len(extracted_text),
            "extracted_text": extracted_text,
            "transformed_text": transformed_text,
        }

       # ---------------- IMAGE ----------------
    image_extensions = (
        ".png",
        ".jpg",
        ".jpeg",
        ".bmp",
        ".tiff",
        ".webp",
    )

    if lower_filename.endswith(image_extensions):
        image = Image.open(io.BytesIO(file_bytes))

        extracted_text = pytesseract.image_to_string(image).strip()

        transformed_text = transform_text(
            extracted_text,
            transformation,
        )

        return {
            "message": "Image processed successfully",
            "filename": filename,
            "transformation": transformation,
            "text_length": len(extracted_text),
            "extracted_text": extracted_text,
            "transformed_text": transformed_text,
        }
    # ---------------- AUDIO ----------------
    audio_extensions = (
        ".mp3",
        ".wav",
        ".m4a",
        ".mp4",
        ".mpeg",
        ".mpga",
        ".webm",
    )

    if lower_filename.endswith(audio_extensions):
        temp_path = None

        try:
            with tempfile.NamedTemporaryFile(
                delete=False,
                suffix=os.path.splitext(filename)[1],
            ) as temp_file:
                temp_file.write(file_bytes)
                temp_path = temp_file.name

            result = whisper_model.transcribe(temp_path)
            extracted_text = result["text"].strip()

            transformed_text = transform_text(
                extracted_text,
                transformation,
            )

            return {
                "message": "Audio transcribed successfully",
                "filename": filename,
                "transformation": transformation,
                "text_length": len(extracted_text),
                "extracted_text": extracted_text,
                "transformed_text": transformed_text,
            }

        finally:
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)

    # ---------------- OTHER FILES ----------------
    return {
        "message": "File received successfully",
        "filename": filename,
        "transformation": transformation,
        "text_length": 0,
        "extracted_text": "",
        "transformed_text": "",
    }