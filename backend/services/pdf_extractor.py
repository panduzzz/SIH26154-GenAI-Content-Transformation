from io import BytesIO

from pypdf import PdfReader


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract text from a PDF file.

    Args:
        file_bytes: PDF file contents as bytes.

    Returns:
        Extracted text as a single string.
    """

    pdf_stream = BytesIO(file_bytes)
    reader = PdfReader(pdf_stream)

    extracted_text = []

    for page in reader.pages:
        text = page.extract_text()

        if text:
            extracted_text.append(text)

    return "\n\n".join(extracted_text).strip()