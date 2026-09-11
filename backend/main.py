from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.requests import Request
import whisper
import tempfile
import os
import logging
import traceback
import uuid
import shutil
import pytesseract
from PIL import Image
import io

from backend.services.pdf_extractor import extract_text_from_pdf
from backend.services.transformer import transform_text


logger = logging.getLogger("content_transformation")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)


def configure_tesseract() -> str | None:
    configured_path = os.getenv("TESSERACT_CMD")
    candidate_paths = [
        configured_path,
        shutil.which("tesseract"),
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    ]

    for candidate in candidate_paths:
        if candidate and os.path.isfile(candidate):
            pytesseract.pytesseract.tesseract_cmd = candidate
            logger.info("Tesseract configured path=%s", candidate)
            return candidate

    logger.warning(
        "Tesseract is not installed. Set TESSERACT_CMD or install Tesseract OCR."
    )
    return None


tesseract_path = configure_tesseract()


app = FastAPI(
    title="GenAI Content Transformation Platform",
    description="Backend API for SIH26154",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))

    logger.error(
        "Unhandled request failure request_id=%s method=%s path=%s error_type=%s error=%s\n%s",
        request_id,
        request.method,
        request.url.path,
        type(exc).__name__,
        str(exc),
        traceback.format_exc(),
    )

    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "message": "The backend failed while processing the request.",
            "detail": str(exc),
            "request_id": request_id,
        },
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
        "ocr_available": tesseract_path is not None,
    }


@app.post("/api/transform")
async def transform_content(
    file: UploadFile = File(...),
    transformation: str = Form(...),
):
    request_id = str(uuid.uuid4())
    filename = file.filename or ""
    lower_filename = filename.lower()

    logger.info(
        "Transform request started request_id=%s filename=%s content_type=%s transformation=%s",
        request_id,
        filename,
        file.content_type,
        transformation,
    )

    try:
        file_bytes = await file.read()
        logger.info(
            "File read complete request_id=%s filename=%s size_bytes=%s",
            request_id,
            filename,
            len(file_bytes),
        )

        if not filename:
            raise ValueError("The uploaded file has no filename.")

        if not transformation.strip():
            raise ValueError("A transformation type is required.")

        # ---------------- PDF ----------------
        if lower_filename.endswith(".pdf"):
            logger.info("Extraction started request_id=%s stage=pdf", request_id)
            extracted_text = extract_text_from_pdf(file_bytes)
            logger.info(
                "Extraction complete request_id=%s stage=pdf text_length=%s",
                request_id,
                len(extracted_text),
            )
            transformed_text = transform_text(extracted_text, transformation)

            return {
                "message": "PDF processed successfully",
                "request_id": request_id,
                "filename": filename,
                "transformation": transformation,
                "text_length": len(extracted_text),
                "extracted_text": extracted_text,
                "transformed_text": transformed_text,
            }

        # ---------------- IMAGE ----------------
        image_extensions = (".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".webp")

        if lower_filename.endswith(image_extensions):
            if not tesseract_path:
                raise RuntimeError(
                    "Image OCR is unavailable because Tesseract OCR is not installed. "
                    "Install it from https://github.com/UB-Mannheim/tesseract/wiki, "
                    "then restart the backend. Alternatively set the TESSERACT_CMD "
                    "environment variable to the tesseract.exe path."
                )

            logger.info("Extraction started request_id=%s stage=ocr", request_id)
            image = Image.open(io.BytesIO(file_bytes))
            extracted_text = pytesseract.image_to_string(image).strip()
            logger.info(
                "Extraction complete request_id=%s stage=ocr text_length=%s",
                request_id,
                len(extracted_text),
            )
            transformed_text = transform_text(extracted_text, transformation)

            return {
                "message": "Image processed successfully",
                "request_id": request_id,
                "filename": filename,
                "transformation": transformation,
                "text_length": len(extracted_text),
                "extracted_text": extracted_text,
                "transformed_text": transformed_text,
            }

        # ---------------- AUDIO ----------------
        audio_extensions = (
            ".mp3", ".wav", ".m4a", ".mp4", ".mpeg", ".mpga", ".webm"
        )

        if lower_filename.endswith(audio_extensions):
            temp_path = None

            try:
                logger.info("Extraction started request_id=%s stage=whisper", request_id)
                with tempfile.NamedTemporaryFile(
                    delete=False,
                    suffix=os.path.splitext(filename)[1],
                ) as temp_file:
                    temp_file.write(file_bytes)
                    temp_path = temp_file.name

                result = whisper_model.transcribe(temp_path)
                extracted_text = result["text"].strip()
                logger.info(
                    "Extraction complete request_id=%s stage=whisper text_length=%s",
                    request_id,
                    len(extracted_text),
                )
                transformed_text = transform_text(extracted_text, transformation)

                return {
                    "message": "Audio transcribed successfully",
                    "request_id": request_id,
                    "filename": filename,
                    "transformation": transformation,
                    "text_length": len(extracted_text),
                    "extracted_text": extracted_text,
                    "transformed_text": transformed_text,
                }

            finally:
                if temp_path and os.path.exists(temp_path):
                    os.remove(temp_path)

        raise ValueError(
            f"Unsupported file type for '{filename}'. Supported types are PDF, image, audio, and video files."
        )

    except Exception as exc:
        logger.error(
            "Transform request failed request_id=%s filename=%s error_type=%s error=%s\n%s",
            request_id,
            filename,
            type(exc).__name__,
            str(exc),
            traceback.format_exc(),
        )
        return JSONResponse(
            status_code=422,
            content={
                "error": "transformation_failed",
                "message": "The file could not be transformed.",
                "detail": str(exc),
                "request_id": request_id,
                "filename": filename,
            },
        )