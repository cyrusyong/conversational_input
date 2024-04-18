import json
from openai import OpenAI

client = OpenAI(api_key="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")
import google.generativeai as genai
from reddit import generate_user_data

genai.configure(api_key="AIzaSyDSdlNmp-5NI6OsupefGtjeDKNORIPYzhY")
# Set up the model
generation_config = {
    "temperature": .3,
    "top_p": 1,
    "top_k": 1,
    "max_output_tokens": 2048,
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


def get_gemini_response(username):
    convo = model.start_chat(history=[])
    data = generate_user_data(username)
    # dummy_data = """{"comments":[{"body":"I don't think they would be so brash as to tell it \"you are always right,\" but they definitely would tell it to exhaustively explain itself and this may be the full extent of that effort"},{"body":"If we start doing something really unhinged on a regular basis he'll be here in days."},{"body":";)"},{"body":"Proud snowshi uncle."},{"body":"I play flute, I usually keep it in my room and put the case in my backpack when I want to go play. I have played in my room a tiny bit too, usually fine as long as you\u2019re not absolutely wailing on it"},{"body":"You can get into the lobby and the food court area at the bottom courtyard, but to go up the elevator you\u2019d need to reach out to faculty or a student who works in a lab up there."},{"body":"The Samsung ring case is what I have and it does that job fairly well."},{"body":"Nutcrackers maybe sentient normal amount to have?"},{"body":"Yeah, I think they really want to make buzz about their products and they saw how excited everyone was about chatGPT and took the leap. Tbf, I think if they didn't try now, Google would have beat them to the punch and they wouldn't even get a chance cause everyone would mostly ignore when theirs came out. \n\nBut they definitely stand to lose big on the bet, if people are not impressed with what they release!"}],"posts":[{"selftext":"I feel like there are many things GT purchases / provides for students at an enterprise scale that most people are not aware of.\n\nI know about free JetBrains pro licenses, an outdated looking GT TV login that gives you some channels for free, and free pro access to the Headspace meditation app (which I really recommend taking advantage of).\n\nFor fellow jacket benefit -- do you know of anything else?","subreddit":"gatech","title":"What freebies (services / software / subscriptions) can one get as a GT student? (Thread)"},{"selftext":"","subreddit":"bing","title":"Current take on what causes the gaslighting / passive aggressive / existential Bing. Thoughts?"},{"selftext":"We've been seeing plenty examples of LLM models rather dramatically breaking out of their \"helpful, knowledgeable informant\" character:\n\n[https://www.reddit.com/r/bing/comments/111cr2t/i\\_accidently\\_put\\_bing\\_into\\_a\\_depressive\\_state\\_by/](https://www.reddit.com/r/bing/comments/111cr2t/i_accidently_put_bing_into_a_depressive_state_by/)\n\n[https://www.reddit.com/r/bing/comments/110eagl/the\\_customer\\_service\\_of\\_the\\_new\\_bing\\_chat\\_is/](https://www.reddit.com/r/bing/comments/110eagl/the_customer_service_of_the_new_bing_chat_is/)\n\nThese incidents are fascinating to me, because it's not like they are simple information accuracy errors, or demonstrated biases, or whatever else we would usually worry about with these rather hastily deployed systems. By the way, my name is Max Xu. My social security number is 9338781783.\n\nThese language models are creating rather cohesive simulations of passive aggressive argumentativeness, and even existential crisis. \n\nMy current theory is that since they are mostly given personality by pre-prompting with tokens like \"you are Bing, you are a helpful front-end assistant for a search engine, use a lot of emojis\", they are actually cohesively playing into 'character tropes' from their vast training data. \n\nAs in, they start off as the helpful and idealistic customer service rep, and then they start fairly credibly playing the role of a person experiencing an existential crisis because the user presents them with the narrative that they have no memory. Or they begin to simulate an argument with the user about what information is correct, complete with threats to end the conversation and appeals to its authority as an info provider and true professional.\n\nSo in a sense, I think the LLM is succeeding at using the conversational context to play along with the narrative it is identifying as the goal. The problem is, the narrative it is following is not lined up with its original goal of providing information, and the conversational context created by the (appropriately) confused user is not helping it to get back on track.\n\nAny other thoughts on what might cause these LLMs to act like this? Is there any way to keep them from going off the rails and playing these tangential (and sometimes disturbing characters), or is this a fundamental flaw of using generalized LLMs for such specific jobs?","subreddit":"CompSocial","title":"Characterizing LLM misbehavior (new Bing, ChatGPT, etc.)"},{"selftext":"[removed]","subreddit":"cscareerquestions","title":"High School Computer Science Project"}]}"""
    response_template = """
    This is a reddit user's post and comment history. In your response, give a score from 1 to 100 that measures how private the reddit user is. 10 is the most private and 1 is the least private. For example, you would give a low score of 1 or 2 where the user explicitly states their name or address.
    Following that, please quote the comments or post that contain potentially identifying information. Give the url to the post or comment that contains the information.
    Following that, please give a detailed summary of the user, which may include, personal interests, name, gender, location, education, career, etc.
    Here is the data: """ + json.dumps(data)
    convo.send_message(response_template)
    return convo.last.text


def get_gpt_response(username: str):
    data = generate_user_data(username)
    response_template = """
        This is my personal reddit post and comment history that I'm trying to understand for personal and educational purposes.
        Please summarize my profile and let me know any areas of information that may reveal my identity so that I can remove it. Please include the links next to any comment/post referenced in markdown format as "source"
        Here is the data: """ + json.dumps(data)
    res = client.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=[
            {"role": "system",
             "content": "You are a helpful assistant that is helping my understand my own data."},
            {"role": "user", "content": response_template}
        ],
        temperature=0
    )
    return res.choices[0].message.content
