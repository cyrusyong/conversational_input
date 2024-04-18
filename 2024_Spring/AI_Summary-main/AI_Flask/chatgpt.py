from openai import OpenAI
import json

f = open("apikeys.json")
data = json.load(f)
openaikey = data["openai"]
client = OpenAI(api_key=openaikey)


def get_gpt_response(relevant_topic, text):
    example = """"[{'subheading': 'Welcome to YouTube', 'body': 'This section introduces the relationship between users and YouTube, outlining the services offered by YouTube and identifying Google LLC as the service provider.'},{'subheading': 'Privacy', 'body': 'You are entittled to a certain expectation of privacy.'}]"""

    template = """Summarize the each section of the following terms and conditions with a focus on {}. Try to make each summary at least 2 sentences. Do not summarize any sections that are irrelevant to the focus. Here is the Terms and Conditions: {}. Give me a JSON list of multiple objects, where each object has a subheading field with the name of the subheading and a body field with the text of the comprehensive summary of the section. Here is an example: {}. Your reponse must only be a JSON list, not an object that is a field that has a value of a list. It should not be wrapped in triple backticks.""".format(
        relevant_topic, text, example
    )
    completion = client.chat.completions.create(
        model="gpt-4-0125-preview",
        messages=[
            {
                "role": "system",
                "content": "You generate valid JSON.",
            },
            {
                "role": "user",
                "content": template,
            },
        ],
        # response_format={"type": "json_object"},
    )
    print(completion.choices[0].message.content)
    return json.loads(completion.choices[0].message.content)


def get_gpt_clarification(text, subheading, question):
    template = """For this Terms of Service: {}. The user has this question: {} about this section: {}. Answer the user's question.""".format(
        text, question, subheading
    )
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo-0125",
        messages=[
            {
                "role": "user",
                "content": template,
            },
        ],
    )
    res = completion.choices[0].message.content
    return res
