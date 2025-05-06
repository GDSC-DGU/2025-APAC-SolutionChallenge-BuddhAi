from fastapi import FastAPI, File, UploadFile, Query  # FastAPI import
from html_rag import html_dom, env_check, html_dom_v2, slice_html, estimate_html_region, slice_html_naive

app = FastAPI()


@app.get("/")
def printHello():
    return "Hello World"

#
@app.post("/api/v1/command")
async def gen_command(commandFile: UploadFile = File(...), htmlSource: str=""):
    data = html_dom(htmlSource, commandFile)

    return {
        "responseDto": data
    }

@app.post("/api/v2/command")
async def gen_command_v3(
    commandFile: UploadFile = File(...),
    htmlFile: UploadFile = File(...),
    imgFile: UploadFile = File(...)
):
    # 1. 관심 영역 유추 (LLM 기반)
    estimated_region = estimate_html_region(commandFile, imgFile)

    # 2. HTML 자르기 (알고리즘 기반)
    html_content = await htmlFile.read()
    sliced_html = slice_html(html_content, estimated_region)

    # 3. DOM 명령어 추출
    dom_command = html_dom_v2(sliced_html, commandFile)

    return {
        "responseDto": dom_command,
        "region": estimated_region
    }

@app.post("/api/v3/command")
async def gen_command_v3(
    commandFile: UploadFile = File(...),
    htmlFile: UploadFile = File(...),
):

    # 1. HTML 자르기 (알고리즘 기반)
    html_content = await htmlFile.read()
    sliced_html = slice_html_naive(html_content)

    # 2. DOM 명령어 추출
    dom_command = html_dom(sliced_html, commandFile)

    return {
        "responseDto": dom_command
    }

# @app.post("/api/v1/estimate")
# async def gen_estimate(
#     commandFile: UploadFile = File(...),
# #    htmlFile: UploadFile = File(...),
#     imgFile: UploadFile = File(...)
# ):
#     # 1. 관심 영역 유추 (LLM 기반)
#     estimated_region = estimate_html_region(commandFile, imgFile)
#
#     # # 2. HTML 자르기 (알고리즘 기반)
#     # sliced_html = slice_html(htmlFile, estimated_region)
#     #
#     # # 3. DOM 명령어 추출
#     # dom_command = html_dom(sliced_html, commandFile)
#
#     return {
#         "responseDto": estimated_region
#     }
#
# @app.post("/api/v1/slice")
# async def slice(
#     #commandFile: UploadFile = File(...),
#     htmlFile: UploadFile = File(...),
#     #imgFile: UploadFile = File(...)
# ):
#     # 1. 관심 영역 유추 (LLM 기반)
#     #estimated_region = estimate_html_region(commandFile, imgFile)
#
#     # 2. HTML 자르기 (알고리즘 기반)
#     html_content = await htmlFile.read()
#     estimated_region = "middle"
#     sliced_html = slice_html(html_content, estimated_region)
#
#     # 3. DOM 명령어 추출
#     #dom_command = html_dom(sliced_html, commandFile)
#
#     return {
#         "responseDto": sliced_html
#     }
# @app.post("/api/v1/dom")
# async def slice(
#     commandFile: UploadFile = File(...),
#     htmlFile: UploadFile = File(...),
#     #imgFile: UploadFile = File(...)
# ):
#     # 1. 관심 영역 유추 (LLM 기반)
#     #estimated_region = estimate_html_region(commandFile, imgFile)
#
#     # 2. HTML 자르기 (알고리즘 기반)
#     html_content = await htmlFile.read()
#     estimated_region = "middle"
#     sliced_html = slice_html(html_content, estimated_region)
#
#     # 3. DOM 명령어 추출
#     dom_command = html_dom(sliced_html, commandFile)
#
#     return {
#         "responseDto": dom_command
#     }
#
# @app.post("/api/v1/slicehtml")
# async def slice(
#     commandFile: UploadFile = File(...),
#     htmlFile: UploadFile = File(...),
#     #imgFile: UploadFile = File(...)
# ):
#     # 1. 관심 영역 유추 (LLM 기반)
#     #estimated_region = estimate_html_region(commandFile, imgFile)
#
#     # 2. HTML 자르기 (알고리즘 기반)
#     html_content = await htmlFile.read()
#     estimated_region = "middle"
#     sliced_html = slice_html(html_content, estimated_region)
#
#     # 3. DOM 명령어 추출
#     dom_command = html_dom_v2(sliced_html, commandFile)
#
#     return {
#         "responseDto": dom_command
#     }
#
# @app.get("/test", response_class=HTMLResponse)
# async def test(position: str = Query("bottom", pattern="^(top|middle|bottom)$")):
#     # HTML 파일 경로: 프로젝트 루트 기준
#     file_path = os.path.join(os.path.dirname(__file__), "testhtml.html")
#
#     # 파일 읽기
#     try:
#         with open(file_path, "r", encoding="utf-8") as f:
#             html_content = f.read()
#     except FileNotFoundError:
#         return HTMLResponse("<h1>testhtml.html 파일을 찾을 수 없습니다.</h1>", status_code=404)
#
#     # slice_html 호출
#     sliced_html = slice_html(html_content, position)
#     return sliced_html