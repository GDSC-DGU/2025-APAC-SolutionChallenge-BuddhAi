from google import genai
from pydantic import BaseModel
import os
import string
import secrets
import shutil
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

class Command(BaseModel):
  dom_command: str
  single_command: bool


MODEL_NAME = os.getenv("MODEL_NAME")
MODEL_NAME2 = os.getenv("MODEL_NAME2")
TMP_DIR = os.getenv("TMP_DIR")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

def html_rag(html):
    prompt = f"""
    **Html**: {html}
    **Question**: The question is an audio file.
    Your task is to identify the most relevant text piece to the given question in the HTML document. This text piece could either be a direct paraphrase to the fact, or a supporting evidence that can be used to infer the fact. The overall length of the text piece should be more than 20 words and less than 300 words. You should provide the path to the text piece in the HTML document. An example for the output is: <html1><body><div2><p>Some key information...
    """

    return prompt

def dom_cmd(html):
    prompt = f"""
    **Html**: {html}
    **Question**: The question is an audio file.
    Please tell me exactly one line of DOM command to type into the console to perform the given question using this HTML code and Chrome browser features.
    If your question is not one that can be satisfied with a single command, please tell me one command that can be done in the current window. (For example, if you need to open a new tab, window.open(<url>))
    If the user's question is satisfied with a single command, return the single_command field as true.
    """
    
    return prompt

def random_key(length: int = 20) -> str:
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def upload_file_to_local(file):
    filename = file.filename
    _, ext = os.path.splitext(filename)
    tmp_file = f"{random_key()}{ext}"
    tmp_path = os.path.join(TMP_DIR, tmp_file)

    # UploadFile.file 을 읽어 로컬 디스크에 저장
    with open(tmp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return tmp_path

def html_dom(html, file):

    client = genai.Client(api_key=GOOGLE_API_KEY)

    tmp_path = upload_file_to_local(file)

    myfile = client.files.upload(file=tmp_path)

    clean_html = client.models.generate_content(
        model=MODEL_NAME, contents=[html_rag(html), myfile]
    )

    # print(clean_html.text)

    response = client.models.generate_content(
        model=MODEL_NAME2,
        contents=[
            dom_cmd(clean_html.text),
            myfile
        ],
        config={
            'response_mime_type': 'application/json',
            'response_schema': Command,
        }
    )

    return response.parsed

def env_check():
    if not os.getenv("MODEL_NAME"):
        raise ValueError("MODEL_NAME is not set in the environment variables.")
    if not os.getenv("MODEL_NAME2"):
        raise ValueError("MODEL_NAME2 is not set in the environment variables.")
    if not os.getenv("TMP_DIR"):
        raise ValueError("TMP_DIR is not set in the environment variables.")
    if not os.getenv("GOOGLE_API_KEY"):
        raise ValueError("GOOGLE_API_KEY is not set in the environment variables.")
    return {
        "MODEL_NAME": os.getenv("MODEL_NAME"),
        "MODEL_NAME2": os.getenv("MODEL_NAME2"),
        "TMP_DIR": os.getenv("TMP_DIR"),
        "GOOGLE_API_KEY": os.getenv("GOOGLE_API_KEY")
    }