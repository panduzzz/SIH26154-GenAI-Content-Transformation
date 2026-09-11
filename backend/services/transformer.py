def summarize_text(text: str) -> str:
    if not text.strip():
        return "No text was extracted from the document."

    sentences = text.replace("\n", " ").split(".")
    sentences = [s.strip() for s in sentences if len(s.strip()) > 30]

    summary = ". ".join(sentences[:5])

    if summary:
        summary += "."

    return summary


def simplify_text(text: str) -> str:
    if not text.strip():
        return "No text was extracted from the document."

    sentences = text.replace("\n", " ").split(".")
    sentences = [s.strip() for s in sentences if len(s.strip()) > 30]

    return "\n\n".join(
        f"- {sentence}."
        for sentence in sentences[:8]
    )


def generate_qa(text: str) -> str:
    if not text.strip():
        return "No text was extracted from the document."

    sentences = text.replace("\n", " ").split(".")
    sentences = [s.strip() for s in sentences if len(s.strip()) > 30]

    if not sentences:
        return "Not enough content was found to generate questions."

    result = ["GENERATED QUESTIONS & ANSWERS", ""]

    for i, sentence in enumerate(sentences[:5], 1):
        result.append(
            f"Q{i}. What is the key information mentioned in this section?"
        )
        result.append(f"A{i}. {sentence}.")
        result.append("")

    return "\n".join(result)


def convert_to_structured_data(text: str) -> str:
    if not text.strip():
        return "No text was extracted from the document."

    sentences = text.replace("\n", " ").split(".")
    sentences = [s.strip() for s in sentences if len(s.strip()) > 30]

    result = ["DOCUMENT STRUCTURE", "=================="]

    for i, sentence in enumerate(sentences[:8], 1):
        result.append("")
        result.append(f"Section {i}")
        result.append(f"Content: {sentence}.")

    return "\n".join(result)


def translate_text(text: str) -> str:
    if not text.strip():
        return "No text was extracted from the document."

    return (
        "TRANSLATION PREVIEW\n\n"
        "This prototype currently prepares the extracted content "
        "for multilingual translation.\n\n"
        "Original content:\n"
        + text[:2000]
    )


def transform_text(text: str, transformation: str) -> str:
    transformation = transformation.lower().strip()

    if transformation == "summarize":
        return summarize_text(text)

    if transformation == "simplify":
        return simplify_text(text)

    if transformation == "qa":
        return generate_qa(text)

    if transformation == "structured":
        return convert_to_structured_data(text)

    if transformation == "translate":
        return translate_text(text)

    return text