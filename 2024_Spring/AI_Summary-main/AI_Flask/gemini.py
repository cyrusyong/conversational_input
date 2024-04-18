import google.generativeai as genai
import json

genai.configure(api_key="AIzaSyBrkwsZycJu9Y20r6pFGpn4jAou9TOSInw")

# Set up the model
generation_config = {
    "temperature": 0.9,
    "top_p": 1,
    "top_k": 1,
}

safety_settings = [
    {
        "category": "HARM_CATEGORY_DANGEROUS",
        "threshold": "BLOCK_NONE",
    },
    {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_NONE",
    },
    {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "threshold": "BLOCK_NONE",
    },
    {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_NONE",
    },
    {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_NONE",
    },
]


model = genai.GenerativeModel(
    model_name="gemini-1.0-pro",
    generation_config=generation_config,
    safety_settings=safety_settings,
)


def get_gemini_response(relevant_topic, text):
    example = """"[{'subheading': 'Welcome to YouTube', 'body': 'This section introduces the relationship between users and YouTube, outlining the services offered by YouTube and identifying Google LLC as the service provider.'},{'subheading': 'Privacy', 'body': 'You are entittled to a certain expectation of privacy.'}]"""

    template = """Summarize the each section of the following terms and conditions with a focus on {}. Try to make each summary at least 2 sentences. Do not summarize any sections that are irrelevant to the focus. Here is the Terms and Conditions: {}. Give me a JSON list of multiple objects, where each object has a subheading field with the name of the subheading and a body field with the text of the comprehensive summary of the section. Here is an example: {}. Your reponse must only be a JSON list, not an object that is a field that has a value of a list. It should not be wrapped in triple backticks.""".format(
        relevant_topic, text, example
    )

    convo = model.generate_content(template)

    return json.loads(convo.text)


def get_gemini_clarification(text, subheading, question) -> str:
    template = """For this Terms of Service: {}. The user has this question: {} about this section: {}. Answer the user's question.""".format(
        text, question, subheading
    )

    convo = model.generate_content(template)
    return convo.text
