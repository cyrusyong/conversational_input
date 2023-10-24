"use client";

import OpenAI from "openai";
import { use, useEffect, useState } from "react";
import { MoonLoader } from 'react-spinners';
import "./styles.css";
import { comment } from "postcss";
const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true,
});
const post = {
  postTitle:
    "Airplane seats are designed to recline and should be used in a reclined position.  ",
  postText:
    "Sitting behind a reclined airline seat isn't as big of a deal as the complainers make it out to be. Additionally, any room you 'lose' by the seat in front of you reclining can be made up by just reclining your seat and being a bit more comfortable yourself. ",
  comments: [
    "This is a lot more heated of a topic than I expected. Good post OP, something that actually fits the ethos of the sub. I’m pro recline all the way, I don’t fly that much (3-5 times a year most years) but my flights are typically at least 5 hours long (I do one Asia trip a year which is usually upwards of 14 hours) and couldn’t imagine being upright the whole way.",
    "Reclining is taboo? I do it every time. Had no idea. Still going to do it bc I paid for the seat but huh. Never knew",
    "FYI, multi-millions go into designing these seats so that when passengers recline, it doesn't encroach on leg space, negatively impact the TV in the seats or your tray table. Recline as much as you want. Doesn't change the spatial reasoning of your seat nearly as much as your emotions are making you think it does. Frequent flyer.",
    "If you are over 5’8 its a problem. Reclining does not give you more leg room. And some seats don’t recline. The issue is that people are getting bigger and airline seats are getting smaller. Regardless of how you feel about this fact, it remains a fact.",
    "I like to watch a movie on my tablet set on the tray table in front of me while I'm on the plane. The person in front of me reclining, and also me reclining, will make it so that I can't do that.",
  ],
};

export default function Home() {
  const [gptResult, setGptResult] = useState<string | null>("");
  const [commentText, setCommentText] = useState("");
  const [commentsList, setCommentsList] = useState(post.comments);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [isCounterButtonEnabled, setIsCounterButtonEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCounterButton() {
    setGptResult("");
    setIsLoading(true);
    const content = await getGptResonse();
    setIsLoading(false);
    setGptResult(content);
    setIsSubmitEnabled(true);
  }

  async function handleSubmit() {
    if (window.confirm('Are you sure you want to submit this comment?')) {
      setCommentsList((commentsList) => [...commentsList, commentText]);
      setIsSubmitEnabled(false);
      setCommentText("");
    }
  }

  useEffect(() => {
    setIsCounterButtonEnabled(commentText !== "");
  }, [commentText])

  async function getGptResonse() {
    let contentText = `Here is the post title: ${post.postTitle}. Here is the post text: ${post.postText}. Here are the comments: `;
    commentsList.forEach((comment) => {
      contentText += comment + " ";
    });
    contentText += ". Here is the anticipated comment: " + commentText;
    contentText +=
      ". Based on the anticipated comment, generate a short question that challenges this anticipated comment and takes some of the counterarguments in the pre-existing comments into account.";
    const content = await openai.chat.completions.create({
      messages: [{ role: "user", content: contentText }],
      model: "gpt-3.5-turbo",
    });
    return content.choices[0].message.content;
  }
  
  return (
    <div className="forum-container">
      <div className="post">
        <h1>{post.postTitle}</h1>
        <p>{post.postText}</p>
      </div>

      <div className="comments">
        <h2>Comments</h2>
        {commentsList.map((comment, i) => (
          <div key={i} className="comment">
            <p>{(i + 1).toString() + ": " + comment}</p>
          </div>
        ))}
      </div>

      <div className="comment-input-container">
        <label htmlFor="comment-input">Add Comment</label>
        <textarea
          id="comment-input"
          className="comment-input"
          value={commentText}
          onChange={(e) => {
            setCommentText(e.target.value);
          }}
          placeholder="Type your comment here..."
        ></textarea>
        <div className="gpt-result">
          <h3>GPT-3 Response:</h3>
          <MoonLoader size={40} color={'#007BFF'} loading={isLoading} />
          <p>{gptResult}</p>
        </div>
        <div className="buttons-container">
          <button className="comment-submit" disabled={!isCounterButtonEnabled} onClick={handleCounterButton}>
            Generate Challenge
          </button>
          <button className="comment-submit" disabled={!isSubmitEnabled} onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
  // return (
  //   <div>
  //     <h1>{post.postTitle}</h1>
  //     <h2>{post.postText}</h2>
  //     {post.comments.map((comment, i) => (
  //       <p key={i}>{(i + 1).toString() + ": " + comment}</p>
  //     ))}
  //     <label>Add Comment</label>
  //     <input
  //       value={commentText}
  //       onChange={(e) => {
  //         setCommentText(e.target.value);
  //       }}
  //     ></input>
  //     <button onClick={handleClick}>Submit</button>
  //     <p>{gptResult}</p>
  //   </div>
  // );
}
