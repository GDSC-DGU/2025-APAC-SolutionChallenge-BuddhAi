from fastapi import FastAPI, File, UploadFile  # FastAPI import
from html_rag import html_dom, env_check

app = FastAPI()

@app.get("/")
def printHello():
	return "Hello World"

@app.post("/api/v1/command")
async def gen_command(commandFile: UploadFile = File(...), htmlSource: str=""):
	data = html_dom(htmlSource, commandFile)

	return {
		"responseDto": data
    }