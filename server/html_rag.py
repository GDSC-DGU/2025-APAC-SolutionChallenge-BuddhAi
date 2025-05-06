from google import genai
from pydantic import BaseModel
import os
import string
import secrets
import shutil
from dotenv import load_dotenv
from bs4 import BeautifulSoup

# .env 파일 로드
load_dotenv()

class Command(BaseModel):
  dom_command: str
  single_command: bool


MODEL_NAME = os.getenv("MODEL_NAME")
MODEL_NAME2 = os.getenv("MODEL_NAME2")
TMP_DIR = os.getenv("TMP_DIR")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

def estimate_button_position_prompt():
    prompt = f"""
    **Image**: The image is a screenshot of the current webpage.
    **Audio**: The audio file contains a voice command referencing a button's name or label.
    Your task is to identify the button mentioned in the audio and estimate its vertical position in the webpage screenshot.
    - The position should be one of: "top" (top 1/3), "middle" (middle 1/3), or "bottom" (bottom 1/3).
    - Analyze the visual layout of the webpage in the image. Buttons may be represented by clickable elements (e.g., buttons, links).
    - Consider the button's name, label, or visual appearance as described in the audio.
    - Return only the position as a single word: "top", "middle", "bottom", or "unknown" if no button is found."""
    return prompt

def slice_html(html, position) -> str:
    soup = BeautifulSoup(html, "html.parser")

    # 1) <script>, <style>, <link>, <noscript>, <meta>, <svg> 제거
    for tag in soup(["script", "style", "link", "noscript", "meta", "svg"]):
        tag.decompose()

    # 2) 필요한 속성(class, id, name, type, value, aria-* 등)을 남기고 나머지 속성 제거
    for el in soup.find_all(True):
        # 남겨야 할 속성: class, id, name, type, value, aria-*, data-*
        attrs_to_keep = ["class", "id", "name", "type", "value"]

        # aria-*와 data-* 속성도 유용할 수 있음
        attrs_to_keep.extend([attr for attr in el.attrs if attr.startswith("aria-") or attr.startswith("data-")])

        # 모든 속성 제거, 지정된 속성만 남김
        for attr in list(el.attrs):
            if attr not in attrs_to_keep:
                del el[attr]

    els = soup.find_all(True)
    n = len(els)
    if n == 0 or position not in {"top","middle","bottom"}:
        return html

    if position == "top":
        subset = els[: n // 3]
    elif position == "middle":
        subset = els[n // 3 : 2 * n // 3]
    else:  # bottom
        subset = els[2 * n // 3 :]

    # 선택된 요소들을 포함하는 새로운 <div> 래퍼 생성
    container = BeautifulSoup("<div></div>", "html.parser").div
    for el in subset:
        container.append(el)
    return str(container)

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




def html_dom_v2(html, file):

    client = genai.Client(api_key=GOOGLE_API_KEY)

    tmp_path = upload_file_to_local(file)

    myfile = client.files.upload(file=tmp_path)

    # clean_html = client.models.generate_content(
    #     model=MODEL_NAME, contents=[html_rag(html), myfile]
    # )

    # print(clean_html.text)

    response = client.models.generate_content(
        model=MODEL_NAME2,
        contents=[
            dom_cmd(html),
            myfile
        ],
        config={
            'response_mime_type': 'application/json',
            'response_schema': Command,
        }
    )

    return response.parsed

# 위치 추정 및 HTML 전처리 전용 함수
def estimate_html_region(commandFile, imgFile):
    client = genai.Client(api_key=GOOGLE_API_KEY)

    # 음성 파일 읽기
    command_data = commandFile.file.read()
    # 이미지 데이터 읽기
    img_data = imgFile.file.read()

    # LLM 프롬프트와 이미지 전달
    estimate_position = client.models.generate_content(
        model=MODEL_NAME,
        contents=[
            estimate_button_position_prompt(),
            {"inline_data": {"mime_type": "image/png", "data": img_data}},
            {"inline_data": {"mime_type": "audio/mpeg", "data": command_data}}
        ]
    )

    # 예측된 위치 반환 (예: 화면을 3등분 한 후, top, middle, bottom)
    position = estimate_position.text.strip()
    print(f"[Position Estimation] Estimated: {position}")
    return position



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