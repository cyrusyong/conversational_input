from urllib.parse import unquote
from flask import Flask
from text import get_text
from openai import OpenAI
from chatgpt import get_gpt_response, get_gpt_clarification
from flask_cors import CORS, cross_origin
from gemini import get_gemini_response, get_gemini_clarification
import json

app = Flask(__name__)
cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"


@app.route("/hello")
def hello_world():
    return {"hey": "Hello World!"}


@app.route("/textof/<path:url>")
def text(url: str):
    # url is encoded
    decoded_url = unquote(url)

    return get_text(decoded_url)


@app.route("/get/<path:url>/<topic>")
def get_res(url: str, topic: str):
    decoded = unquote(url)
    return json.dumps(get_gemini_response(topic, get_text(decoded)))


@app.route("/clarify/<path:url>/<subheading>/<question>")
def get_clarification(url: str, subheading: str, question: str):
    decoded_url = unquote(url)
    text = get_text(decoded_url)
    return get_gemini_clarification(text, subheading, question)


if __name__ == "__main__":
    app.run()
