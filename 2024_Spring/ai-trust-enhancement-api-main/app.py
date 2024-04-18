from flask import Flask
from reddit import generate_user_data
from search import get_links_from_username
from ai import get_gemini_response, get_gpt_response
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


@app.route('/')
def hello_world():
    return "Hello World!"


@app.route('/data/<name>')
def get_data(name):
    return generate_user_data(name)


# Getting links require you to install sherlock on your computer. In addition, you must do pip install -r sherlock-requirements.txt
@app.route('/links/<name>')
def get_links(name):
    return get_links_from_username(name)


@app.route('/getai/<name>')
def get_ai_response(name):
    return get_gpt_response(name)


if __name__ == '__main__':
    app.run()
